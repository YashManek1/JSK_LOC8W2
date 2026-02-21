/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import * as fs from 'fs/promises';
import { PrismaService } from '../prisma/prisma.service';
import { GroqService } from './groq.service';
import { ShortlistPptService } from './shortlist-ppt.service';

const GROQ_RATE_DELAY_MS = 2500; // 2.5s between Groq calls — stays well within 30 RPM

@Processor('shortlistQueue', { concurrency: 1 })  // single concurrency — Groq rate-limit protection
export class ShortlistProcessor extends WorkerHost {
  private readonly logger = new Logger(ShortlistProcessor.name);

    /** Cast to any so TS doesn't complain about new Prisma models before restart */
    private get db(): any { return this.prisma; }

    constructor(
        private prisma: PrismaService,
        private groq: GroqService,
        private pptSvc: ShortlistPptService,
    ) {
        super();
    }

  async process(job: Job<any, any, string>): Promise<any> {
    const { entryId } = job.data;
    const startTime = Date.now();

        this.logger.log(`${'═'.repeat(60)}`);
        this.logger.log(`🏁 ShortlistProcessor: entry ${entryId}`);
        this.logger.log(`${'═'.repeat(60)}`);

        // ── Fetch entry + config ─────────────────────────────────────
        const entry = await this.db.shortlistEntry.findUnique({
            where: { id: entryId },
            include: { config: true },
        });

    if (!entry) {
      this.logger.error(`Entry ${entryId} not found!`);
      return;
    }

        const config = entry.config;
        const weights: Record<string, number> =
            (config.scoringWeights as Record<string, number>) || {};
        const problemStatement: string = config.problemStatement || '';

        try {
            // Mark as PROCESSING
            await this.db.shortlistEntry.update({
                where: { id: entryId },
                data: { status: 'PROCESSING' },
            });

            // ── Validate: must have a PPTX ───────────────────────────
            if (!entry.pptxPath) {
                throw new Error('No PPTX file attached to this entry.');
            }

            // ── Extract PPT text + images ────────────────────────────
            this.logger.log(`  📂 Extracting PPT for team: ${entry.teamName}`);
            const pptContent = await this.pptSvc.extractWithCount(entry.pptxPath);
            const slideCount = pptContent.slideCount;

            this.logger.log(`  📑 Slides extracted: ${slideCount}`);

            // ── Edge case: 0-slide PPT ────────────────────────────────
            if (slideCount === 0) {
                await this.db.shortlistEntry.update({
                    where: { id: entryId },
                    data: {
                        status: 'FAILED',
                        failReason: 'PPT has 0 slides — nothing to evaluate.',
                        slideCount: 0,
                        processingTimeMs: Date.now() - startTime,
                    },
                });
                this.logger.warn(`  ⚠ Team ${entry.teamName}: 0 slides — FAILED`);
                return;
            }

            // ── Max slides check (soft warn, still evaluate) ─────────
            if (slideCount > config.maxSlides) {
                this.logger.warn(
                    `  ⚠ Team ${entry.teamName}: ${slideCount} slides (max ${config.maxSlides}) — evaluating anyway, penalized in slideQuality`,
                );
            }

            // ── Rate-limit delay before Groq call ───────────────────
            this.logger.log(`  ⏳ Rate-limit delay ${GROQ_RATE_DELAY_MS}ms before Groq…`);
            await new Promise(r => setTimeout(r, GROQ_RATE_DELAY_MS));

            // ── Groq Evaluation ──────────────────────────────────────
            this.logger.log(`  🤖 Calling Groq for ${entry.teamName}…`);

            // WRAP IN TIMEOUT — do not let this hang forever
            const evalPromise = this.groq.evaluatePpt({
                pptText: pptContent.text,
                images: pptContent.images.slice(0, 3),
                problemStatement,
                scoringWeights: weights,
                domains: config.domains,
                teamName: entry.teamName,
            });

            const timeoutPromise = new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error('Groq evaluation timed out after 60 seconds.')), 60000)
            );

            const evalResult = await Promise.race([evalPromise, timeoutPromise]) as any;

            const processingTimeMs = Date.now() - startTime;
            this.logger.log(
                `  ✅ ${entry.teamName} scored: ${evalResult.finalScore}/100 in ${(processingTimeMs / 1000).toFixed(1)}s`,
            );

            // ── Save EVALUATED ────────────────────────────────────────
            await this.db.shortlistEntry.update({
                where: { id: entryId },
                data: {
                    status: 'EVALUATED',
                    slideCount,
                    pptScores: JSON.parse(JSON.stringify(evalResult.scores)),
                    pptXaiReasons: JSON.parse(JSON.stringify(
                        Object.fromEntries(
                            Object.entries(evalResult.scores).map(([k, v]: [string, any]) => [k, v.reason])
                        )
                    )),
                    finalScore: evalResult.finalScore,
                    rawGroqResponse: evalResult.rawText.slice(0, 50000),
                    processingTimeMs,
                },
            });

            // Cleanup PPTX file to save disk space
            try { await fs.unlink(entry.pptxPath); } catch { /* ignore */ }

        } catch (err: any) {
            const processingTimeMs = Date.now() - startTime;
            this.logger.error(`  ❌ ${entry.teamName} FAILED after ${(processingTimeMs / 1000).toFixed(1)}s: ${err.message}`);

            await this.db.shortlistEntry.update({
                where: { id: entryId },
                data: {
                    status: 'FAILED',
                    failReason: err.message?.slice(0, 500) || 'Unknown error during evaluation.',
                    processingTimeMs,
                },
            });
        }
    }
}

