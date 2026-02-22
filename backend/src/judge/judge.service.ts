import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ScoreDto } from './dto/score.dto';

@Injectable()
export class JudgeService {
  constructor(private prisma: PrismaService) {}

  async getAssignedTeams(judgeId: string) {
    // Find evaluated teams that exist in shortlist
    // For now, since hackathon doesn't strictly lock a single judge to a team, return all evaluated or submitted teams broadly
    const entries = await this.prisma.shortlistEntry.findMany({
      where: {
        status: { in: ['EVALUATED'] },
      },
      select: {
        id: true,
        teamName: true,
        finalScore: true,
        pptScores: true,
        githubUrl: true,
      },
    });

    // Also get existing judge scores
    const judgeEvals = await this.prisma.judgeEvaluation.findMany({
      where: { judgeId },
    });

    const evalMap = new Map(judgeEvals.map((ev) => [ev.teamId, ev]));

    return entries.map((entry) => ({
      ...entry,
      judgeEvaluation: evalMap.get(entry.id) || null,
    }));
  }

  async submitScore(teamId: string, judgeId: string, scores: ScoreDto) {
    const totalScore =
      (scores.innovation || 0) +
      (scores.feasibility || 0) +
      (scores.techDepth || 0) +
      (scores.clarity || 0) +
      (scores.impact || 0);

    // Find if evaluation already exists for this judge+team
    const existing = await this.prisma.judgeEvaluation.findFirst({
      where: { teamId, judgeId },
    });

    if (existing) {
      return this.prisma.judgeEvaluation.update({
        where: { id: existing.id },
        data: {
          innovationScore: scores.innovation || 0,
          feasibilityScore: scores.feasibility || 0,
          techDepthScore: scores.techDepth || 0,
          clarityScore: scores.clarity || 0,
          impactScore: scores.impact || 0,
          totalScore,
        },
      });
    }

    // Try finding the actual team id from shortlist or Team model
    const team = await this.prisma.team.findFirst({ where: { id: teamId } });
    let finalTeamId = teamId;
    if (!team) {
      // if they passed ShortlistEntry ID instead, find the linked team.
      const entry = await this.prisma.shortlistEntry.findFirst({
        where: { id: teamId },
      });
      if (!entry) throw new NotFoundException('Team not found');
      // This is a naive workaround: if actual teamID is needed but only name exists.
      const realTeam = await this.prisma.team.findFirst({
        where: { teamName: entry.teamName },
      });
      if (realTeam) finalTeamId = realTeam.id;
    }

    return this.prisma.judgeEvaluation.create({
      data: {
        judgeId,
        teamId: finalTeamId,
        innovationScore: scores.innovation || 0,
        feasibilityScore: scores.feasibility || 0,
        techDepthScore: scores.techDepth || 0,
        clarityScore: scores.clarity || 0,
        impactScore: scores.impact || 0,
        totalScore,
      },
    });
  }

  async submitNote(teamId: string, judgeId: string, note: string) {
    const existing = await this.prisma.judgeEvaluation.findFirst({
      where: { teamId, judgeId },
    });

    if (existing) {
      return this.prisma.judgeEvaluation.update({
        where: { id: existing.id },
        data: { note },
      });
    }

    const team = await this.prisma.team.findFirst({ where: { id: teamId } });
    let finalTeamId = teamId;
    if (!team) {
      const entry = await this.prisma.shortlistEntry.findFirst({
        where: { id: teamId },
      });
      if (!entry) throw new NotFoundException('Team not found');
      const realTeam = await this.prisma.team.findFirst({
        where: { teamName: entry.teamName },
      });
      if (realTeam) finalTeamId = realTeam.id;
    }

    return this.prisma.judgeEvaluation.create({
      data: {
        judgeId,
        teamId: finalTeamId,
        note,
      },
    });
  }
}
