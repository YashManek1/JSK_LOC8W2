import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unused-vars */
import { Logger } from '@nestjs/common';
import * as fs from 'fs/promises';
import { PrismaService } from '../../prisma/prisma.service';
import { PptxService } from '../pptx/pptx.service';
import { GithubService } from '../github/github.service';
import { GeminiService } from '../gemini/gemini.service';

@Processor('evaluationQueue', {
  concurrency: 2,
  limiter: { max: 10, duration: 60_000 },
})
export class QueueProcessor extends WorkerHost {
  private readonly logger = new Logger(QueueProcessor.name);

  constructor(
    private prisma: PrismaService,
    private pptxService: PptxService,
    private githubService: GithubService,
    private geminiService: GeminiService,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const { evaluationId, projectId, githubUrl, pptxPath } = job.data;
    const startTime = Date.now();

    this.logger.log(`\n${'═'.repeat(60)}`);
    this.logger.log(`⚙️  Processing evaluation ${evaluationId}`);
    this.logger.log(`${'═'.repeat(60)}`);

    try {
      await this.prisma.evaluation.update({
        where: { id: evaluationId },
        data: { status: 'PROCESSING' },
      });

      // 1. Extract PPTX
      this.logger.log('\n  📄 STEP 1: Extracting PPTX...');
      const pptxStart = Date.now();
      const pptx = await this.pptxService.extractPptx(pptxPath);
      this.logger.log(
        `  📄 Done in ${Date.now() - pptxStart}ms — ${pptx.text.length} chars text, ${pptx.images.length} images`,
      );

      // 2. Fetch GitHub data via Repomix
      this.logger.log(
        '\n  🐙 STEP 2: Fetching & packing codebase (Repomix)...',
      );
      const ghStart = Date.now();
      const github = await this.githubService.fetchGitHubData(githubUrl);
      this.logger.log(
        `  🐙 Done in ${Date.now() - ghStart}ms — ${github.totalFiles} files, ${github.packedSizeChars} chars packed`,
      );

      // 3. Call Gemini with full packed codebase
      this.logger.log(
        '\n  🤖 STEP 3: Evaluating with Gemini (full codebase)...',
      );
      const aiStart = Date.now();
      const result = await this.geminiService.evaluateWithGemini({
        pptText: pptx.text,
        pptImages: pptx.images,
        repoPackedContent: github.repoPackedContent,
        fileTree: github.fileTree,
        readme: github.readme,
      });
      this.logger.log(
        `  🤖 Done in ${Date.now() - aiStart}ms — Score: ${result.score}/100`,
      );

      const totalTime = Date.now() - startTime;

      // Count verified vs failed claims
      const claimsData = Array.isArray(result.claimsVerified)
        ? result.claimsVerified
        : [];
      const verified = claimsData.filter((c) => c.verified).length;
      const failed = claimsData.filter((c) => !c.verified).length;

      this.logger.log(
        `  📋 claimsVerified: ${claimsData.length} items (${verified}✓ / ${failed}✗)`,
      );
      if (claimsData.length > 0) {
        this.logger.log(`  📋 First claim: ${JSON.stringify(claimsData[0])}`);
      }

      // Ensure JSON-safe serialisation for Prisma
      const safeExaggerations = JSON.parse(
        JSON.stringify(result.exaggerations || []),
      );
      const safeClaimsVerified = JSON.parse(JSON.stringify(claimsData));

      // 4. Save everything
      await this.prisma.evaluation.update({
        where: { id: evaluationId },
        data: {
          status: 'COMPLETED',
          score: result.score,
          exaggerations: safeExaggerations,
          claimsVerified: safeClaimsVerified,
          reality: result.reality,
          pptContent: pptx.text.slice(0, 50000),
          slideImageCount: pptx.images.length,
          githubFileTree: github.fileTree,
          githubReadme: github.readme.slice(0, 50000),
          repoStats: {
            totalFiles: github.totalFiles,
            packedSizeChars: github.packedSizeChars,
            method: github.packedSizeChars > 0 ? 'repomix' : 'api-fallback',
          },
          promptSent: result.prompt.slice(0, 100000),
          rawAiResponse: result.rawResponse.slice(0, 50000),
          processingTimeMs: totalTime,
        } as any,
      });

      this.logger.log(`\n  ${'─'.repeat(50)}`);
      this.logger.log(
        `  ✅ COMPLETED — Score: ${result.score}/100 in ${(totalTime / 1000).toFixed(1)}s`,
      );
      this.logger.log(
        `  📊 Claims: ✅ ${verified} verified, ❌ ${failed} failed`,
      );
      this.logger.log(`  📊 Exaggerations: ${result.exaggerations.length}`);
      this.logger.log(
        `  📦 Codebase: ${github.totalFiles} files, ${(github.packedSizeChars / 1024).toFixed(0)}KB packed`,
      );
      this.logger.log(`  ${'─'.repeat(50)}\n`);

      try {
        await fs.unlink(pptxPath);
      } catch {
        /* ignore */
      }
    } catch (err: any) {
      const totalTime = Date.now() - startTime;
      this.logger.error(
        `\n  ❌ FAILED after ${(totalTime / 1000).toFixed(1)}s:`,
        err.message,
      );
      await this.prisma.evaluation.update({
        where: { id: evaluationId },
        data: {
          status: 'FAILED',
          reality: err.message,
          processingTimeMs: totalTime,
        },
      });
    }
  }
}
