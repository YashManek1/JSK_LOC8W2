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

  async allocateProblemStatements(
    adminId: string,
    hackathonId: string,
    config: {
      maxTeamsPerDomain?: number;
      minTeamsPerDomain?: number; // purely informational for now, max limits FCFS
      dynamicCapacities?: Record<string, number>; // { domainId: maxCapacity }
    },
  ) {
    // 1. Verify Hackathon and Admin
    const hackathon = await this.prisma.hackathon.findUnique({
      where: { id: hackathonId, adminId },
      include: { domains: true },
    });

    if (!hackathon) {
      throw new ForbiddenException(
        'Hackathon not found or you are not the admin.',
      );
    }

    if (!hackathon.domains || hackathon.domains.length === 0) {
      throw new Error('This hackathon has no domains setup.');
    }

    // 2. Fetch all fully REGISTERED teams, ordered by createdAt ASC (FCFS)
    const teams = await this.prisma.team.findMany({
      where: { hackathonId, status: 'REGISTERED' },
      orderBy: { createdAt: 'asc' },
    });

    if (teams.length === 0) {
      return { message: 'No registered teams to allocate.', allocated: 0 };
    }

    // 3. Track capacities
    const defaultMax = config.maxTeamsPerDomain || 999999;
    const domainCapacities: Record<string, number> = {};
    const domainUsage: Record<string, number> = {};

    for (const domain of hackathon.domains) {
      domainUsage[domain.id] = 0;
      domainCapacities[domain.id] =
        config.dynamicCapacities?.[domain.id] ?? defaultMax;
    }

    let allocatedCount = 0;
    const updates: any[] = [];

    // 4. Allocate (FCFS loop)
    for (const team of teams) {
      // Skip if already manually allocated
      if (team.allocatedDomainId) continue;

      const preferences = (team.psPreferences as string[]) || [];

      let assignedDomainId: string | null = null;

      // Try preferences in order
      for (const prefId of preferences) {
        if (
          domainCapacities[prefId] !== undefined &&
          domainUsage[prefId] < domainCapacities[prefId]
        ) {
          assignedDomainId = prefId;
          break;
        }
      }

      // If preferences fail / are full, assign to the first available domain
      if (!assignedDomainId) {
        for (const domain of hackathon.domains) {
          if (domainUsage[domain.id] < domainCapacities[domain.id]) {
            assignedDomainId = domain.id;
            break;
          }
        }
      }

      // If absolutely everything is full (edge case where max limits < total teams)
      // We will override capacity and assign to the domain with the least teams
      if (!assignedDomainId) {
        let leastUsedId = hackathon.domains[0].id;
        for (const domain of hackathon.domains) {
          if (domainUsage[domain.id] < domainUsage[leastUsedId]) {
            leastUsedId = domain.id;
          }
        }
        assignedDomainId = leastUsedId;
      }

      if (assignedDomainId) {
        // Mark assigned
        domainUsage[assignedDomainId]++;
        updates.push(
          this.prisma.team.update({
            where: { id: team.id },
            data: { allocatedDomainId: assignedDomainId },
          }),
        );
        allocatedCount++;
      }
    }

    // 5. Execute DB updates in transaction
    if (updates.length > 0) {
      await this.prisma.$transaction(updates);
    }

    return {
      message: 'Initial problem statement allocation completed successfully.',
      allocatedTeams: allocatedCount,
      domainDistribution: domainUsage,
    };
  }
}
