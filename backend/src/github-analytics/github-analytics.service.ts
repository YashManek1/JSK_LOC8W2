import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Octokit } from '@octokit/rest';
import { GithubService } from '../queue/github/github.service';
import { GroqSecondaryService } from '../queue/groq-secondary/groq-secondary.service';

@Injectable()
export class GithubAnalyticsService {
    private readonly logger = new Logger(GithubAnalyticsService.name);
    private octokit: Octokit;

    constructor(
        private prisma: PrismaService,
        private github: GithubService,
        private groqSecondary: GroqSecondaryService
    ) {
        const token = process.env.GITHUB_PAT || process.env.GITHUB_TOKEN;
        if (!token) {
            this.logger.warn('⚠️ GITHUB_PAT is not set. API rate-limits apply.');
        }
        this.octokit = new Octokit({ auth: token as string });
    }

    /**
     * Parses a standard GitHub URL returning owner and repo
     */
    private parseGithubUrl(url: string): { owner: string; repo: string } {
        try {
            url = url.trim().replace(/\/$/, '');
            const parts = url.split('/');
            if (parts.length < 2) throw new Error('Invalid URL format');
            const repo = parts.pop();
            const owner = parts.pop();
            if (!repo || !owner) throw new Error('Could not parse repository owner and name');
            return { owner, repo };
        } catch (e) {
            throw new BadRequestException('Invalid GitHub Repository URL provided');
        }
    }

    /**
     * Fetches fresh GitHub stats and saves/updates it in PostgreSQL
     * to avoid pinging the API every time a dashboard loads.
     */
    async syncRepoStats(identifier: string, newGithubUrl?: string) {
        identifier = identifier.trim();
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);

        // 1. Get the target repository
        let entry = await this.prisma.shortlistEntry.findFirst({
            where: isUuid ? { id: identifier } : { teamName: { equals: identifier, mode: 'insensitive' } },
            include: { config: true },
        });

        if (!entry) {
            // Auto-create missing team for Sandbox usage
            let config = await this.prisma.roundConfig.findFirst({ orderBy: { createdAt: 'desc' } });
            if (!config) {
                config = await this.prisma.roundConfig.create({
                    data: { targetShortlist: 10, maxSlides: 15, domains: [], keywords: [] }
                });
            }
            entry = await this.prisma.shortlistEntry.create({
                data: {
                    teamName: identifier,
                    configId: config.id,
                    githubUrl: newGithubUrl || '',
                    status: 'PENDING'
                },
                include: { config: true }
            });
            this.logger.log(`Auto-created ShortlistEntry for newly submitted team ${identifier}`);
        } else if (newGithubUrl && newGithubUrl !== entry.githubUrl) {
            entry = await this.prisma.shortlistEntry.update({
                where: { id: entry.id },
                data: { githubUrl: newGithubUrl },
                include: { config: true },
            });
        }

        if (!entry.githubUrl) {
            throw new BadRequestException('Shortlist Entry or GitHub URL missing');
        }

        const { owner, repo } = this.parseGithubUrl(entry.githubUrl);
        this.logger.log(`Fetching deep stats for ${owner}/${repo}...`);

        try {
            // 2. Fetch concurrent data from GitHub via Octokit individually so one 404/204 doesn't crash the rest
            const repoResponse = await this.octokit.repos.get({ owner, repo }).catch(() => null);
            if (!repoResponse) throw new BadRequestException(`GitHub rejected access to ${owner}/${repo}. Is the repository Private, Typoed, or Empty?`);

            const contributorsResponse = await this.octokit.repos.getContributorsStats({ owner, repo }).catch(() => null);
            const languagesResponse = await this.octokit.repos.listLanguages({ owner, repo }).catch(() => null);
            const punchCardResponse = await this.octokit.repos.getPunchCardStats({ owner, repo }).catch(() => null);
            
            // Fetch all branches to track multi-branch development
            const branchesResponse = await this.octokit.repos.listBranches({ owner, repo, per_page: 100 }).catch(() => null);
            const branches = branchesResponse?.data?.map(b => ({ 
                name: b.name, 
                protected: b.protected,
                commit: b.commit.sha.substring(0, 7)
            })) || [];

            // If GitHub is still crunching the stats (returns 202 Accepted) or empty, we fallback
            if (contributorsResponse && contributorsResponse.status === 202) {
                this.logger.warn(`GitHub is generating stats for ${owner}/${repo}. Try again later.`);
                // We could initiate a retry logic here, but for now we return what we can
            }

            // 3. Process Contributors (Summarize individual adds/deletes AND actual commit messages)
            const contributorsMap: any[] = [];
            const commitCounts = new Map<string, any>();
            let totalCommits = 0;

            // ALWAYS fetch listCommits to get the literal commit messages for Groq Feature Attribution!
            const commitsResponse = await this.octokit.repos.listCommits({ owner, repo, per_page: 100 }).catch(() => null);

            if (commitsResponse && Array.isArray(commitsResponse.data)) {
                commitsResponse.data.forEach((commitObj: any) => {
                    const authorLogin = commitObj.author?.login || commitObj.commit?.author?.name || 'Unknown';
                    const avatarUrl = commitObj.author?.avatar_url || '';
                    const message = commitObj.commit?.message || '';

                    if (!commitCounts.has(authorLogin)) {
                        commitCounts.set(authorLogin, {
                            author: authorLogin,
                            avatarUrl,
                            commits: 0,
                            additions: 0,
                            deletions: 0,
                            featuresBuilt: [],
                            commitMessages: []
                        });
                    }
                    const c = commitCounts.get(authorLogin)!;
                    c.commits += 1;
                    if (message && message.trim().length > 3) {
                        c.commitMessages.push(message.replace(/\s+/g, ' ').trim());
                    }
                    totalCommits += 1;
                });
            }

            // If the deep statistics engine is ready, merge the raw additions/deletions counts
            if (contributorsResponse && Array.isArray(contributorsResponse.data)) {
                // Wipe totalCommits because the stats array has the full historical count
                totalCommits = 0;
                contributorsResponse.data.forEach((contributor: any) => {
                    totalCommits += contributor.total;
                    let additions = 0;
                    let deletions = 0;
                    contributor.weeks.forEach((week: any) => {
                        additions += week.a;
                        deletions += week.d;
                    });

                    const authorLogin = contributor.author?.login || 'Unknown';
                    const avatarUrl = contributor.author?.avatar_url || '';

                    if (!commitCounts.has(authorLogin)) {
                        commitCounts.set(authorLogin, {
                            author: authorLogin,
                            avatarUrl,
                            commits: contributor.total,
                            additions,
                            deletions,
                            featuresBuilt: [],
                            commitMessages: []
                        });
                    } else {
                        const existing = commitCounts.get(authorLogin)!;
                        // Use stats engine count if it exceeds our 100 pagination limit
                        existing.commits = Math.max(existing.commits, contributor.total);
                        existing.additions = additions;
                        existing.deletions = deletions;
                    }
                });
            }

            commitCounts.forEach(val => contributorsMap.push(val));

            // Sort contributors by most commits
            contributorsMap.sort((a, b) => b.commits - a.commits);

            // 4. Punch Card (Commit Timelines)
            // GitHub punch card returns an array of arrays: [day_of_week, hour, commit_count]
            const timelineData = (punchCardResponse && Array.isArray(punchCardResponse.data)) ? punchCardResponse.data : [];

            const shortlistId = entry.id;

            // 5. Return the GitHub stats with branch information
            const repoStats: any = {
                id: shortlistId,
                shortlistId,
                teamName: entry.teamName,
                githubUrl: entry.githubUrl,
                totalCommits,
                contributors: contributorsMap,
                branches,
                timeline: timelineData,
                languages: languagesResponse?.data || {},
                lastSyncedAt: new Date(),
                // AI data placeholders
                summary: null,
                implementedFeatures: [],
                missingPitchedFeatures: [],
                relevanceScore: 0
            };

            // 6. AI Codebase Evaluation with Groq + Repomix (Re-enabled)
            if (entry.config?.problemStatement) {
                try {
                    this.logger.log(`🤖 Starting AI Codebase Evaluation for ${entry.teamName}...`);
                    const repomixOutput = await this.github.fetchGitHubData(entry.githubUrl);
                    
                    const aiEval = await this.groqSecondary.evaluateCodebaseImplementations(
                        repomixOutput.repoPackedContent,
                        entry.config.problemStatement,
                        contributorsMap
                    );

                    // Add AI insights to response (not saving to DB since schema doesn't have these fields)
                    repoStats.implementedFeatures = aiEval.implementedFeatures || [];
                    repoStats.missingPitchedFeatures = aiEval.missingPitchedFeatures || [];
                    repoStats.relevanceScore = aiEval.relevanceScore || 0;
                    repoStats.summary = {
                        totalFeatures: aiEval.implementedFeatures?.length || 0,
                        missingFeatures: aiEval.missingPitchedFeatures?.length || 0,
                        relevanceScore: aiEval.relevanceScore || 0,
                        fileCount: repomixOutput.totalFiles,
                        codebaseSize: repomixOutput.packedSizeChars
                    };

                    // Update contributors with their mapped features from AI
                    if (aiEval.developerMapping && Array.isArray(aiEval.developerMapping)) {
                        repoStats.contributors = contributorsMap.map(c => {
                            const mapping = aiEval.developerMapping.find((m: any) => m.author === c.author);
                            return { ...c, featuresBuilt: mapping?.features || [] };
                        });
                    }

                    this.logger.log(`✅ AI Codebase Evaluation Complete for ${entry.teamName} (Relevance: ${aiEval.relevanceScore}%)`);
                } catch (aiError: any) {
                    this.logger.error(`⚠️ AI Codebase Evaluation failed: ${aiError.message}`);
                    // Continue without AI data
                }
            }

            this.logger.log(`✅ Synced Github cache for ${owner}/${repo} (${branches.length} branches tracked)`);
            return repoStats;

        } catch (e: any) {
            require('fs').writeFileSync('debug.log', String(e.stack || e));
            if (e instanceof BadRequestException) throw e;
            this.logger.error(`GitHub API failed: ${e.message}`);
            throw new BadRequestException(`Could not fetch GitHub data: ${e.message}`);
        }
    }

    /**
     * Retrieves the GitHub statistics by syncing fresh data every time
     * (Database schema doesn't have GithubRepoStat cache table anymore)
     */
    async getRepoStats(identifier: string) {
        identifier = identifier.trim();
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);

        // Fetch the entry to verify it exists
        const entry = await this.prisma.shortlistEntry.findFirst({
            where: isUuid ? { id: identifier } : { teamName: { equals: identifier, mode: 'insensitive' } },
            select: {
                id: true,
                githubUrl: true,
                pptxPath: true
            }
        });

        if (!entry) {
            throw new BadRequestException(`No team or entry found for identifier: ${identifier}`);
        }

        // If no repo linked yet, safely return empty template
        if (!entry.githubUrl) {
            return {
                totalCommits: 0, 
                contributors: [], 
                timeline: [], 
                languages: {}
            };
        }

        // Always fetch fresh data from GitHub (no caching since GithubRepoStat table doesn't exist)
        try {
            const stats = await this.syncRepoStats(entry.id);
            return stats;
        } catch (err: any) {
            this.logger.error(`[getRepoStats] Failed to sync ${identifier}: ${err.message}`);
            return {
                totalCommits: 0, 
                contributors: [], 
                timeline: [], 
                languages: {},
                error: err.message
            };
        }
    }
}
