import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StudentService {
  constructor(private prisma: PrismaService) {}

  async getStudentScore(userId: string) {
    const participant = await this.prisma.participant.findUnique({
      where: { id: userId },
      include: {
        team: {
          include: {
            evaluations: {
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        },
      },
    });

    if (!participant) throw new NotFoundException('User not found');

    const team = participant.team;
    if (!team) return { score: 0, status: 'NO_TEAM' };

    const latestEval = team.evaluations?.[0];
    if (!latestEval) return { score: 0, status: 'PENDING' };

    return {
      score: latestEval.totalScore,
      status: 'EVALUATED',
      details: latestEval,
    };
  }

  async getStudentMeals(userId: string) {
    const meals = await this.prisma.mealQR.findMany({
      where: { participantId: userId },
      orderBy: { scannedAt: 'desc' },
    });
    return { mealsConsumed: meals.length, history: meals };
  }
}
