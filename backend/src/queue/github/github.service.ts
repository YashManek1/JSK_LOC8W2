/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument */
import { Injectable, Logger } from '@nestjs/common';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export interface GitHubData {
  repoPackedContent: string;
  fileTree: string[];
  readme: string;
  totalFiles: number;
  packedSizeChars: number;
}

const GITHUB_API = 'https://api.github.com';

/** Directories/patterns to ALWAYS exclude from analysis */
const IGNORE_PATTERNS = [
  'node_modules',
  '.next',
  'dist',
  'build',
  '.git',
  '__pycache__',
  '.cache',
  '.vscode',
  '.idea',
  'coverage',
  '.nyc_output',
  'vendor',
  '.tox',
  'eggs',
  '*.egg-info',
  '.env',
  '.env.*',
  '*.lock',
  'package-lock.json',
  'yarn.lock',
  'pnpm-lock.yaml',
  'poetry.lock',
  'Pipfile.lock',
  '*.min.js',
  '*.min.css',
  '*.map',
  '*.chunk.js',
  '*.bundle.js',
  '*.d.ts',
  '*.png',
  '*.jpg',
  '*.jpeg',
  '*.gif',
  '*.svg',
  '*.ico',
  '*.woff',
  '*.woff2',
  '*.ttf',
  '*.eot',
  '*.mp4',
  '*.mp3',
  '*.pdf',
  '*.zip',
  '*.tar.gz',
];

@Injectable()
export class GithubService {
  private readonly logger = new Logger(GithubService.name);

  private parseGitHubUrl(url: string): { owner: string; repo: string } {
    const cleaned = url.replace(/\/+$/, '').replace(/\.git$/, '');
    const parts = new URL(cleaned).pathname.split('/').filter(Boolean);
    return { owner: parts[0], repo: parts[1] };
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'HackEval/1.0',
    };
    if (process.env.GITHUB_PAT) {
      headers.Authorization = `Bearer ${process.env.GITHUB_PAT}`;
    }
    return headers;
  }

  async fetchGitHubData(githubUrl: string): Promise<GitHubData> {
    const { owner, repo } = this.parseGitHubUrl(githubUrl);
    const headers = this.getHeaders();

    const tmpDir = path.join(
      os.tmpdir(),
      `hackeval-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    );
    const cloneDir = path.join(tmpDir, 'repo');
    const outputFile = path.join(tmpDir, 'repomix-output.txt');

    let repoPackedContent = '';
    let fileTree: string[] = [];

    try {
      // 1. Shallow clone
      this.logger.log(`    📥 Cloning ${owner}/${repo} (shallow)...`);
      const cloneStart = Date.now();

      let cloneUrl = `https://github.com/${owner}/${repo}.git`;
      if (process.env.GITHUB_PAT) {
        cloneUrl = `https://${process.env.GITHUB_PAT}@github.com/${owner}/${repo}.git`;
      }

      execSync(`git clone --depth 1 "${cloneUrl}" "${cloneDir}"`, {
        stdio: 'pipe',
        timeout: 60000,
      });
      this.logger.log(`    📥 Cloned in ${Date.now() - cloneStart}ms`);

      // 2. Build ignore args for Repomix
      const ignoreArgs = IGNORE_PATTERNS.map((p) => `--ignore "${p}"`).join(
        ' ',
      );

      // 3. Run Repomix
      this.logger.log('    📦 Packing codebase with Repomix (filtered)...');
      const packStart = Date.now();

      // Find repomix bin relative to backend node_modules
      const repomixBin = path.join(
        process.cwd(),
        'node_modules',
        '.bin',
        'repomix',
      );

      execSync(
        `"${repomixBin}" --style plain --output "${outputFile}" ${ignoreArgs}`,
        {
          cwd: cloneDir,
          stdio: 'pipe',
          timeout: 60000,
        },
      );

      if (fs.existsSync(outputFile)) {
        repoPackedContent = fs.readFileSync(outputFile, 'utf-8');
        this.logger.log(
          `    📦 Packed in ${Date.now() - packStart}ms — ${repoPackedContent.length} chars`,
        );
      }

      // 4. Get file tree from git (source files only)
      const treeOutput = execSync('git ls-tree -r --name-only HEAD', {
        cwd: cloneDir,
        stdio: 'pipe',
        encoding: 'utf-8',
        timeout: 10000,
      });

      const allFiles = treeOutput.trim().split('\n').filter(Boolean);

      // Filter noise from file tree display
      fileTree = allFiles.filter((f) => {
        const lower = f.toLowerCase();
        return (
          !lower.includes('node_modules/') &&
          !lower.includes('.next/') &&
          !lower.includes('dist/') &&
          !lower.includes('__pycache__/') &&
          !lower.endsWith('.lock') &&
          !lower.endsWith('.min.js') &&
          !lower.endsWith('.min.css') &&
          !lower.endsWith('.map') &&
          !lower.endsWith('.png') &&
          !lower.endsWith('.jpg') &&
          !lower.endsWith('.svg')
        );
      });

      this.logger.log(
        `    📂 Source files: ${fileTree.length} (total in repo: ${allFiles.length})`,
      );
    } catch (err: any) {
      this.logger.warn(
        `    ⚠️  Repomix/clone failed, falling back to GitHub API: ${err.message}`,
      );
      return this.fallbackToAPI(owner, repo, headers);
    } finally {
      try {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      } catch {
        /* ignore */
      }
    }

    // 5. Fetch README via API
    let readme = '';
    try {
      const res = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/readme`, {
        headers,
      });
      if (res.ok) {
        const data: any = await res.json();
        readme = Buffer.from(data.content, 'base64').toString('utf-8');
      }
    } catch {
      readme = '(README not found)';
    }

    return {
      repoPackedContent,
      fileTree,
      readme,
      totalFiles: fileTree.length,
      packedSizeChars: repoPackedContent.length,
    };
  }

  /** Fallback: use GitHub REST API if clone/repomix fails */
  private async fallbackToAPI(
    owner: string,
    repo: string,
    headers: Record<string, string>,
  ): Promise<GitHubData> {
    this.logger.log('    🔄 Using GitHub API fallback...');

    let fileTree: string[] = [];
    for (const branch of ['main', 'master']) {
      try {
        const res = await fetch(
          `${GITHUB_API}/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
          { headers },
        );
        if (res.ok) {
          const data: any = await res.json();
          fileTree = (data.tree || [])
            .filter((i: any) => i.type === 'blob')
            .map((i: any) => i.path);
          break;
        }
      } catch {
        /* try next */
      }
    }

    let readme = '';
    try {
      const res = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/readme`, {
        headers,
      });
      if (res.ok) {
        const data: any = await res.json();
        readme = Buffer.from(data.content, 'base64').toString('utf-8');
      }
    } catch {
      readme = '(README not found)';
    }

    const fallbackContent = `File tree:\n${fileTree.join('\n')}\n\nREADME:\n${readme}`;

    return {
      repoPackedContent: fallbackContent,
      fileTree,
      readme,
      totalFiles: fileTree.length,
      packedSizeChars: 0,
    };
  }
}
