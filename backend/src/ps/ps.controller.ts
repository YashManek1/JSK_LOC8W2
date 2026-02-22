/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
import {
  Controller,
  Get,
  Param,
  Req,
  UseGuards,
  ForbiddenException,
  NotFoundException,
  Put,
  Body,
  BadRequestException,
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

  /**
   * GET /ps/:hackathonId/preferences
   * Returns the current team's PS preferences.
   */
  @Get(':hackathonId/preferences')
  @UseGuards(AuthGuard('jwt'))
  async getPreferences(
    @Param('hackathonId') hackathonId: string,
    @Req() req: any,
  ) {
    const userId = req.user?.id || req.user?.sub;

    const team = await this.prisma.team.findFirst({
      where: {
        hackathonId,
        participants: { some: { id: userId } },
      },
      select: { psPreferences: true, status: true },
    });

    if (!team || team.status !== 'REGISTERED') {
      throw new ForbiddenException(
        'Not in a registered team for this hackathon.',
      );
    }

    return { preferences: team.psPreferences || [] };
  }

  /**
   * PUT /ps/:hackathonId/preferences
   * Saves the team's top 3 PS preferences (Team Leader only).
   */
  @Put(':hackathonId/preferences')
  @UseGuards(AuthGuard('jwt'))
  async setPreferences(
    @Param('hackathonId') hackathonId: string,
    @Body('preferences') preferences: string[],
    @Req() req: any,
  ) {
    const userId = req.user?.id || req.user?.sub;

    if (!Array.isArray(preferences) || preferences.length > 3) {
      throw new BadRequestException(
        'Preferences must be an array of up to 3 domain IDs.',
      );
    }

    const team = await this.prisma.team.findFirst({
      where: {
        hackathonId,
        participants: { some: { id: userId } },
      },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    if (team.status !== 'REGISTERED') {
      throw new ForbiddenException(
        'Team must be fully registered to set preferences.',
      );
    }

    if (team.leaderId !== userId) {
      throw new ForbiddenException(
        'Only the team leader can set problem statement preferences.',
      );
    }

    const updatedTeam = await this.prisma.team.update({
      where: { id: team.id },
      data: { psPreferences: preferences },
    });

    return {
      message: 'Preferences updated successfully',
      preferences: updatedTeam.psPreferences,
    };
  }
}
