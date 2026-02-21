import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // Adjust path to your PrismaService
import { CreateHackathonDto } from './dto/create-hackathon.dto';

@Injectable()
export class AdminHackathonService {
  constructor(private prisma: PrismaService) {}

  async createHackathon(adminId: string, dto: CreateHackathonDto) {
    // Optional: Double check if user is actually an admin
    const user = await this.prisma.participant.findUnique({
      where: { id: adminId },
    });
    if (!user || user.role !== 'ADMIN') {
      throw new ForbiddenException(
        'Only administrators can create hackathons.',
      );
    }

    return this.prisma.hackathon.create({
      data: {
        adminId,
        name: dto.name,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        location: dto.location,
        description: dto.description,
        posterUrl: dto.posterUrl,
        prizePool: dto.prizePool,
        totalTeams: dto.totalTeams,
        teamSize: dto.teamSize,
        totalOfflineTeams: dto.totalOfflineTeams,
        totalRemoteTeams: dto.totalRemoteTeams,
        venueMapUrl: dto.venueMapUrl,
        ndaRequired: dto.ndaRequired,
        sponsors: dto.sponsors,
        rules: dto.rules,

        // Nested relation creation
        domains: {
          create:
            dto.domains?.map((d) => ({
              name: d.name,
              problems: d.problems,
            })) || [],
        },
        rooms: {
          create:
            dto.roomsList?.map((r) => ({
              name: r.name,
              capacity: r.capacity || '—',
            })) || [],
        },
        timeline: {
          create:
            dto.timeline?.map((t) => ({
              time: t.time,
              event: t.event,
            })) || [],
        },
      },
      // Include relations in the response so frontend gets the full object back
      include: {
        domains: true,
        rooms: true,
        timeline: true,
      },
    });
  }

  async getMyHackathons(adminId: string) {
    return this.prisma.hackathon.findMany({
      where: {
        adminId: adminId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      // Select only what is needed for the dashboard cards
      select: {
        id: true,
        name: true,
        startDate: true,
        status: true,
        _count: {
          select: { domains: true },
        },
      },
    });
  }

  async getStats(adminId: string) {
    const hackathons = await this.prisma.hackathon.findMany({
      where: { adminId },
      include: {
        _count: {
          select: {
            registrations: true,
            teams: true,
            domains: true,
          },
        },
      },
    });

    const totalParticipants = await this.prisma.registration.count({
      where: {
        hackathon: {
          adminId,
        },
      },
    });

    const activeHackathons = hackathons.filter(
      (h) => h.status === 'Active',
    ).length;

    return {
      totalHackathons: hackathons.length,
      activeHackathons,
      totalParticipants,
      totalTeams: hackathons.reduce((sum, h) => sum + (h._count.teams || 0), 0),
      hackathons: hackathons.map((h) => ({
        id: h.id,
        name: h.name,
        status: h.status,
        participants: h._count.registrations,
        teams: h._count.teams,
        domains: h._count.domains,
      })),
    };
  }
}
