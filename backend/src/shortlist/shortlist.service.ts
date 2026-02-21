/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */
import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { GroqService } from './groq.service';

const SECONDS_PER_PPT = 47; // ~45s Groq + 2.5s delay

@Injectable()
export class ShortlistService {
  private readonly logger = new Logger(ShortlistService.name);
  private get db(): any {
    return this.prisma;
  }

  constructor(
    private prisma: PrismaService,
    private groq: GroqService,
    @InjectQueue('shortlistQueue') private shortlistQueue: Queue,
  ) {}

  // ─── Config ──────────────────────────────────────────────────────
  async getActiveConfig() {
    return this.db.roundConfig.findFirst({ orderBy: { createdAt: 'desc' } });
  }

  async upsertConfig(dto: any) {
    const existing = await this.getActiveConfig();
    const data = {
      targetShortlist: dto.targetShortlist ?? 10,
      maxSlides: dto.maxSlides ?? 15,
      domains: dto.domains ?? [],
      keywords: dto.keywords ?? [],
      problemStatement: dto.problemStatement ?? '',
      scoringWeights: dto.scoringWeights ?? null,
    };
    if (existing && !existing.isPublished) {
      return this.db.roundConfig.update({ where: { id: existing.id }, data });
    }
    return this.db.roundConfig.create({
      data: { ...data, isPublished: false },
    });
  }

  async newRound() {
    const prev = await this.getActiveConfig();
    return this.db.roundConfig.create({
      data: {
        targetShortlist: prev?.targetShortlist ?? 10,
        maxSlides: prev?.maxSlides ?? 15,
        domains: prev?.domains ?? [],
        keywords: prev?.keywords ?? [],
        problemStatement: prev?.problemStatement ?? '',
        scoringWeights: prev?.scoringWeights ?? null,
        isPublished: false,
      },
    });
  }

  // ─── Single Submit ────────────────────────────────────────────────
  async createSubmission(data: {
    teamName: string;
    githubUrl?: string;
    pptxPath: string;
  }) {
    const config = await this.getActiveConfig();
    if (!config)
      throw new Error(
        'No active round configuration. Admin must set one up first.',
      );

    const entry = await this.db.shortlistEntry.create({
      data: {
        configId: config.id,
        teamName: data.teamName.trim(),
        githubUrl: data.githubUrl?.trim(),
        pptxPath: data.pptxPath,
        status: 'PENDING',
      },
    });

    await this.shortlistQueue.add(
      'process',
      { entryId: entry.id },
      { attempts: 2, backoff: { type: 'fixed', delay: 10000 } },
    );
    const queueSize = await this.shortlistQueue.getWaitingCount();
    const eta = queueSize * SECONDS_PER_PPT;

    return { entryId: entry.id, status: 'PENDING', etaSeconds: eta };
  }

  // ─── Mass Upload (admin) ──────────────────────────────────────────
  async massCreateSubmissions(teams: { teamName: string; pptxPath: string }[]) {
    const config = await this.getActiveConfig();
    if (!config) throw new Error('No active round configuration.');

    const entries: any[] = [];
    for (const t of teams) {
      const entry = await this.db.shortlistEntry.create({
        data: {
          configId: config.id,
          teamName: t.teamName.trim(),
          pptxPath: t.pptxPath,
          status: 'PENDING',
        },
      });
      entries.push(entry);
    }

    this.logger.log(
      `Mass upload: stored ${entries.length} teams as PENDING (not yet queued).`,
    );
    return { count: entries.length, entryIds: entries.map((e) => e.id) };
  }

  // ─── Start Evaluation (admin triggered) ───────────────────────────
  async startMassEvaluation() {
    const pendingEntries = await this.db.shortlistEntry.findMany({
      where: { status: 'PENDING' },
      select: { id: true },
    });

    if (!pendingEntries.length) return { count: 0, etaSeconds: 0 };

    for (const entry of pendingEntries) {
      await this.shortlistQueue.add(
        'process',
        { entryId: entry.id },
        { attempts: 2, backoff: { type: 'fixed', delay: 10000 } },
      );
    }

    const pending = await this.shortlistQueue.getWaitingCount();
    const processing = await this.shortlistQueue.getActiveCount();
    const eta = (pending + processing) * SECONDS_PER_PPT;

    this.logger.log(
      `Started evaluation: queued ${pendingEntries.length} teams. ETA ~${eta}s`,
    );
    return { count: pendingEntries.length, etaSeconds: eta };
  }

  // ─── Queue Status (for live ETA) ─────────────────────────────────
  async getQueueStatus() {
    const [waiting, active, completed, failed] = await Promise.all([
      this.shortlistQueue.getWaitingCount(),
      this.shortlistQueue.getActiveCount(),
      this.shortlistQueue.getCompletedCount(),
      this.shortlistQueue.getFailedCount(),
    ]);
    const remaining = waiting + active;
    const etaSeconds = remaining * SECONDS_PER_PPT;
    return { waiting, active, completed, failed, etaSeconds };
  }

  // ─── Leaderboard ─────────────────────────────────────────────────
  /** EVALUATED entries sorted by: finalScore DESC → pptScores aggregate DESC → createdAt ASC (tiebreaker) */
  async getLeaderboard() {
    const entries = await this.db.shortlistEntry.findMany({
      where: { status: 'EVALUATED' },
      orderBy: [
        { finalScore: 'desc' },
        { createdAt: 'asc' }, // tiebreaker: earlier submission wins
      ],
      include: {
        config: { select: { isPublished: true, scoringWeights: true } },
      },
    });

    // Add virtual rank + resolve adminOverride
    return entries
      .map((e: any, idx: number) => ({
        ...e,
        effectiveScore: e.adminOverride ?? e.finalScore,
        rank: idx + 1,
      }))
      .sort(
        (a: any, b: any) => (b.effectiveScore ?? 0) - (a.effectiveScore ?? 0),
      )
      .map((e: any, idx: number) => ({ ...e, rank: idx + 1 }));
  }

  // ─── All Entries (admin) ──────────────────────────────────────────
  async getAllEntries() {
    return this.db.shortlistEntry.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        config: { select: { isPublished: true, targetShortlist: true } },
      },
    });
  }

  // ─── Single Entry (participant — no adminNote) ────────────────────
  async getEntry(id: string) {
    const entry = await this.db.shortlistEntry.findUnique({
      where: { id },
      include: {
        config: { select: { isPublished: true, targetShortlist: true } },
      },
    });
    if (!entry) return null;
    // NEVER expose adminNote to participant
    const { adminNote: _n, ...safe } = entry;
    return safe;
  }

  // ─── Eliminate / Restore ─────────────────────────────────────────
  async eliminateEntry(id: string) {
    return this.db.shortlistEntry.update({
      where: { id },
      data: { status: 'ELIMINATED' },
    });
  }

  async restoreEntry(id: string) {
    return this.db.shortlistEntry.update({
      where: { id },
      data: { status: 'EVALUATED' },
    });
  }

  // ─── Admin Note ───────────────────────────────────────────────────
  async setAdminNote(id: string, note: string) {
    return this.db.shortlistEntry.update({
      where: { id },
      data: { adminNote: note },
    });
  }

  // ─── Admin Score Override ─────────────────────────────────────────
  async overrideScore(id: string, score: number, note: string) {
    return this.db.shortlistEntry.update({
      where: { id },
      data: { adminOverride: score, adminNote: note },
    });
  }

  // ─── Re-queue Failed Entry ────────────────────────────────────────
  async requeueEntry(id: string) {
    await this.db.shortlistEntry.update({
      where: { id },
      data: { status: 'PENDING', failReason: null },
    });
    await this.shortlistQueue.add('process', { entryId: id }, { attempts: 2 });
    const pending = await this.shortlistQueue.getWaitingCount();
    return { queued: true, etaSeconds: pending * SECONDS_PER_PPT };
  }

  // ─── Publish: compute ranks + expose to participants ──────────────
  async publishLeaderboard() {
    const config = await this.getActiveConfig();
    if (!config) return null;

    // Compute ranks from EVALUATED entries
    const evaluated = await this.getLeaderboard();
    let rank = 1;
    for (const entry of evaluated) {
      await this.db.shortlistEntry.update({
        where: { id: entry.id },
        data: { rank },
      });
      rank++;
    }

    return this.db.roundConfig.update({
      where: { id: config.id },
      data: { isPublished: true },
    });
  }

  // ─── Re-score all entries when admin changes weights ──────────────
  async rescoreAll() {
    const config = await this.getActiveConfig();
    if (!config) throw new Error('No config found.');
    const weights: Record<string, number> = config.scoringWeights || {};

    const evaluated = await this.db.shortlistEntry.findMany({
      where: { status: { in: ['EVALUATED', 'ELIMINATED'] } },
    });

    let updated = 0;
    for (const entry of evaluated) {
      if (!entry.pptScores) continue;
      const newScore = this.groq.recomputeFinalScore(entry.pptScores, weights);
      await this.db.shortlistEntry.update({
        where: { id: entry.id },
        data: { finalScore: newScore },
      });
      updated++;
    }
    return { updated };
  }

  // ─── Funnel Stats ─────────────────────────────────────────────────
  async getStats() {
    const [total, pending, processing, evaluated, eliminated, failed] =
      await Promise.all([
        this.db.shortlistEntry.count(),
        this.db.shortlistEntry.count({ where: { status: 'PENDING' } }),
        this.db.shortlistEntry.count({ where: { status: 'PROCESSING' } }),
        this.db.shortlistEntry.count({ where: { status: 'EVALUATED' } }),
        this.db.shortlistEntry.count({ where: { status: 'ELIMINATED' } }),
        this.db.shortlistEntry.count({ where: { status: 'FAILED' } }),
      ]);
    return { total, pending, processing, evaluated, eliminated, failed };
  }
}
