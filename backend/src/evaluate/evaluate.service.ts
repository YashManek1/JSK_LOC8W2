import { Queue } from 'bullmq';
/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */
import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EvaluateService {
  constructor(
    private prisma: PrismaService,
    @InjectQueue('evaluationQueue') private evaluationQueue: Queue,
  ) {}

  async createEvaluation(
    teamName: string,
    githubUrl: string,
    pptxPath: string,
  ) {
    const project = await this.prisma.project.create({
      data: {
        teamName: teamName.trim(),
        githubUrl: githubUrl.trim(),
        evaluations: {
          create: { status: 'PENDING' },
        },
      },
      include: { evaluations: true },
    });

    const evaluation = project.evaluations[0];

    await this.evaluationQueue.add('evaluate', {
      evaluationId: evaluation.id,
      projectId: project.id,
      githubUrl: project.githubUrl,
      pptxPath,
    });

    return {
      evaluationId: evaluation.id,
      status: evaluation.status,
    };
  }

  private extractClaimsFromRaw(rawAiResponse: string) {
    if (!rawAiResponse) return null;
    try {
      let parsed: any = null;
      try {
        parsed = JSON.parse(rawAiResponse.trim());
      } catch {
        /* */
      }
      if (!parsed) {
        const fenceMatch = rawAiResponse.match(
          /```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/i,
        );
        if (fenceMatch) {
          try {
            parsed = JSON.parse(fenceMatch[1].trim());
          } catch {
            /* */
          }
        }
      }
      if (!parsed) {
        const braceMatch = rawAiResponse.match(/\{[\s\S]*\}/);
        if (braceMatch) {
          try {
            parsed = JSON.parse(braceMatch[0]);
          } catch {
            /* */
          }
        }
      }
      if (parsed && Array.isArray(parsed.claimsVerified)) {
        return parsed.claimsVerified;
      }
    } catch {
      /* ignore */
    }
    return null;
  }

  async getEvaluation(id: string) {
    const evaluation = await this.prisma.evaluation.findUnique({
      where: { id },
      include: { project: true },
    });

    if (!evaluation) return null;

    let claimsVerified = (evaluation as any).claimsVerified;
    if (
      (!claimsVerified ||
        (Array.isArray(claimsVerified) && claimsVerified.length === 0)) &&
      evaluation.rawAiResponse
    ) {
      const fallback = this.extractClaimsFromRaw(evaluation.rawAiResponse);
      if (fallback && fallback.length > 0) {
        claimsVerified = fallback;
        this.prisma.evaluation
          .update({
            where: { id: evaluation.id },
            data: { claimsVerified: fallback } as any,
          })
          .catch(() => {
            /* ignore */
          });
      }
    }

    let score = evaluation.score;
    let exaggerations = evaluation.exaggerations;
    let reality = evaluation.reality;

    if ((score === null || score === 0) && evaluation.rawAiResponse) {
      try {
        let parsed: any = null;
        try {
          parsed = JSON.parse(evaluation.rawAiResponse.trim());
        } catch {
          /* */
        }
        if (!parsed) {
          const m = evaluation.rawAiResponse.match(/\{[\s\S]*\}/);
          if (m)
            try {
              parsed = JSON.parse(m[0]);
            } catch {
              /* */
            }
        }
        if (parsed) {
          if (typeof parsed.score === 'number' && parsed.score > 0)
            score = parsed.score;
          if (
            Array.isArray(parsed.exaggerations) &&
            parsed.exaggerations.length > 0
          )
            exaggerations = parsed.exaggerations;
          if (parsed.reality) reality = parsed.reality;
        }
      } catch {
        /* ignore */
      }
    }

    return {
      id: evaluation.id,
      status: evaluation.status,
      teamName: evaluation.project.teamName,
      githubUrl: evaluation.project.githubUrl,
      score,
      exaggerations,
      claimsVerified,
      reality,
      // Intermediate data
      pptContent: evaluation.pptContent,
      slideImageCount: evaluation.slideImageCount,
      githubFileTree: evaluation.githubFileTree,
      githubReadme: evaluation.githubReadme,
      repoStats: (evaluation as any).repoStats,
      promptSent: evaluation.promptSent,
      rawAiResponse: evaluation.rawAiResponse,
      processingTimeMs: evaluation.processingTimeMs,
      createdAt: evaluation.createdAt,
    };
  }
}
