import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HackathonService {
  constructor(private prisma: PrismaService) {}

  async getHackathonTime(id: string) {
    const hackathon = await this.prisma.hackathon.findUnique({
      where: { id },
      select: { startDate: true, endDate: true },
    });

    if (!hackathon) {
      throw new NotFoundException('Hackathon not found');
    }

    return hackathon;
  }
}
