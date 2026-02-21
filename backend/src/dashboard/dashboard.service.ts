import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getTeamCommits(teamId: string) {
    // Try to find by shortlist entry ID or team name
    const shortlistEntry = await this.prisma.shortlistEntry.findFirst({
      where: {
        OR: [{ id: teamId }, { teamName: teamId }],
      },
    });

    if (!shortlistEntry?.githubUrl) {
      return null;
    }

    // In a real implementation, you'd integrate with GitHub API
    // For now, return structure that frontend expects
    return {
      total: 0, // Will be populated by GitHub Analytics service
      contributors: [],
      lastUpdated: new Date().toISOString(),
      githubUrl: shortlistEntry.githubUrl,
      teamName: shortlistEntry.teamName,
    };
  }

  async getPPTScores(teamId: string) {
    const shortlistEntry = await this.prisma.shortlistEntry.findFirst({
      where: {
        OR: [{ id: teamId }, { teamName: teamId }],
      },
    });

    if (!shortlistEntry) {
      return null;
    }

    const pptScores = shortlistEntry.pptScores as any;

    return {
      overall: shortlistEntry.finalScore || 0,
      breakdown: pptScores || {},
      status: shortlistEntry.status,
      rank: shortlistEntry.rank,
      teamName: shortlistEntry.teamName,
    };
  }

  async getTeamSummary(teamId: string) {
    const [commits, scores] = await Promise.all([
      this.getTeamCommits(teamId),
      this.getPPTScores(teamId),
    ]);

    return {
      teamId,
      commits,
      scores,
    };
  }
}
