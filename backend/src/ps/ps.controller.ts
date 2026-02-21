/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
import {
  Controller,
  Get,
  Param,
  Req,
  UseGuards,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PrismaService } from '../prisma/prisma.service';

@Controller('ps')
export class PsController {
  constructor(private prisma: PrismaService) {}

  /**
   * GET /ps/:hackathonId
   * Returns problem statements (domains) only if the user is in a REGISTERED team
   * AND the psReleaseDate has passed.
   */
  @Get(':hackathonId')
  @UseGuards(AuthGuard('jwt'))
  async getProblemStatements(
    @Param('hackathonId') hackathonId: string,
    @Req() req: any,
  ) {
    const userId = req.user?.id || req.user?.sub;

    // 1. Fetch hackathon
    const hackathon = await this.prisma.hackathon.findUnique({
      where: { id: hackathonId },
      include: { domains: true },
    });

    if (!hackathon) {
      throw new NotFoundException('Hackathon not found');
    }

    // 2. Check if PS release date has passed
    if (!hackathon.psReleaseDate || new Date() < hackathon.psReleaseDate) {
      throw new ForbiddenException(
        'Problem statements have not been released yet.',
      );
    }

    // 3. Check if user is in a REGISTERED team for this hackathon
    const team = await this.prisma.team.findFirst({
      where: {
        hackathonId,
        status: 'REGISTERED',
        participants: { some: { id: userId } },
      },
    });

    if (!team) {
      throw new ForbiddenException(
        'You must be in a registered team to view problem statements.',
      );
    }

    // 4. Return domains/problems
    return {
      hackathonName: hackathon.name,
      psReleaseDate: hackathon.psReleaseDate,
      domains: hackathon.domains,
    };
  }
}
