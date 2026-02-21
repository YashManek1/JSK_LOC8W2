import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { JoinTeamDto } from './dto/join-team.dto';
import { RegisterSoloDto } from './dto/register-solo.dto';
import { randomBytes } from 'crypto';

@Injectable()
export class RegistrationService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  // Helper: Generates a 6-character alphanumeric invite code
  private generateInviteCode(): string {
    return randomBytes(3).toString('hex').toUpperCase();
  }

  // Helper: Checks if hackathon allows registration and validates dynamic fields
  private async validateHackathonAndFields(
    hackathonId: string,
    dynamicAnswers?: Record<string, any>,
  ) {
    const hackathon = await this.prisma.hackathon.findUnique({
      where: { id: hackathonId },
    });

    if (!hackathon) {
      throw new NotFoundException('Hackathon not found');
    }

    if (
      hackathon.registrationDeadline &&
      new Date() > new Date(hackathon.registrationDeadline)
    ) {
      throw new ForbiddenException('Registration deadline has passed');
    }

    // Validate required fields if any
    const requiredFields = (hackathon.requiredFields as string[]) || [];
    if (requiredFields.length > 0) {
      if (!dynamicAnswers) {
        throw new BadRequestException(
          `Missing required fields: ${requiredFields.join(', ')}`,
        );
      }
      for (const field of requiredFields) {
        if (!dynamicAnswers[field]) {
          throw new BadRequestException(`Missing required field: ${field}`);
        }
      }
    }

    return hackathon;
  }

  async createTeam(userId: string, email: string, dto: CreateTeamDto) {
    // 1. Validate Hackathon & Fields
    await this.validateHackathonAndFields(dto.hackathonId, dto.dynamicAnswers);

    // 2. Check if user is already registered for this hackathon
    const existingRegistration = await this.prisma.registration.findUnique({
      where: {
        participantId_hackathonId: {
          participantId: userId,
          hackathonId: dto.hackathonId,
        },
      },
    });

    if (existingRegistration) {
      throw new BadRequestException(
        'You are already registered for this hackathon.',
      );
    }

    // 3. Check team name uniqueness
    const existingTeam = await this.prisma.team.findFirst({
      where: { teamName: dto.teamName, hackathonId: dto.hackathonId },
    });

    if (existingTeam) {
      throw new BadRequestException(
        'Team name already exists in this hackathon.',
      );
    }

    // 4. Create Team and Registration in a transaction
    return this.prisma.$transaction(async (tx) => {
      const inviteCode = this.generateInviteCode();

      const team = await tx.team.create({
        data: {
          teamName: dto.teamName,
          leadEmail: email,
          memberEmails: [email],
          hackathonId: dto.hackathonId,
          leaderId: userId,
          inviteCode,
          status: 'INCOMPLETE', // Default status
          participants: {
            connect: [{ id: userId }],
          },
        },
      });

      const registration = await tx.registration.create({
        data: {
          participantId: userId,
          hackathonId: dto.hackathonId,
          dynamicAnswers: dto.dynamicAnswers || {},
          status: 'IN_TEAM',
        },
      });

      return { team, registration };
    });
  }

  async joinTeam(userId: string, email: string, dto: JoinTeamDto) {
    // 1. Find Team by Invite Code
    const team = await this.prisma.team.findUnique({
      where: { inviteCode: dto.inviteCode },
      include: { hackathon: true, participants: true },
    });

    if (!team || !team.hackathonId) {
      throw new NotFoundException('Invalid invite code');
    }

    // 2. Validate Hackathon & Fields
    const hackathon = await this.validateHackathonAndFields(
      team.hackathonId,
      dto.dynamicAnswers,
    );

    // 3. Check if team is full
    if (team.participants.length >= hackathon.teamSize) {
      throw new BadRequestException('Team is already full.');
    }

    // 4. Check if user is already registered
    const existingRegistration = await this.prisma.registration.findUnique({
      where: {
        participantId_hackathonId: {
          participantId: userId,
          hackathonId: team.hackathonId,
        },
      },
    });

    if (existingRegistration) {
      throw new BadRequestException(
        'You are already registered for this hackathon.',
      );
    }

    // 5. Join Team & Create Registration
    return this.prisma.$transaction(async (tx) => {
      const updatedTeam = await tx.team.update({
        where: { id: team.id },
        data: {
          memberEmails: { push: email },
          participants: { connect: [{ id: userId }] },
        },
        include: { participants: true },
      });

      const registration = await tx.registration.create({
        data: {
          participantId: userId,
          hackathonId: team.hackathonId!,
          dynamicAnswers: dto.dynamicAnswers || {},
          status: 'IN_TEAM',
        },
      });

      // 6. If team size reached, update status and send email
      if (updatedTeam.participants.length >= hackathon.teamSize) {
        await tx.team.update({
          where: { id: team.id },
          data: { status: 'REGISTERED' },
        });
        updatedTeam.status = 'REGISTERED';

        // Fire-and-forget: send registration success email to team leader
        this.mailService
          .sendTeamRegistrationSuccess(
            team.leadEmail,
            team.teamName,
            hackathon.name,
          )
          .catch(() => {}); // never block the response
      }

      return { team: updatedTeam, registration };
    });
  }

  async registerSolo(userId: string, dto: RegisterSoloDto) {
    // 1. Validate Hackathon & Fields
    await this.validateHackathonAndFields(dto.hackathonId, dto.dynamicAnswers);

    // 2. Check if user is already registered
    const existingRegistration = await this.prisma.registration.findUnique({
      where: {
        participantId_hackathonId: {
          participantId: userId,
          hackathonId: dto.hackathonId,
        },
      },
    });

    if (existingRegistration) {
      throw new BadRequestException(
        'You are already registered for this hackathon.',
      );
    }

    // 3. Create SOLO Registration
    const registration = await this.prisma.registration.create({
      data: {
        participantId: userId,
        hackathonId: dto.hackathonId,
        dynamicAnswers: dto.dynamicAnswers || {},
        status: 'SOLO',
      },
    });

    return {
      message: 'Successfully registered to the community pool',
      registration,
    };
  }

  async getCommunity(hackathonId: string) {
    return this.prisma.registration.findMany({
      where: {
        hackathonId,
        status: 'SOLO',
      },
      include: {
        participant: {
          select: {
            id: true,
            fullName: true,
            email: true,
            primarySkillset: true,
            tagline: true,
            githubUrl: true,
            linkedinUrl: true,
          },
        },
      },
    });
  }

  async updateTeam(userId: string, teamId: string, teamName: string) {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) throw new NotFoundException('Team not found');
    if (team.leaderId !== userId) {
      throw new ForbiddenException('Only the team leader can update the team.');
    }

    return this.prisma.team.update({
      where: { id: teamId },
      data: { teamName },
    });
  }

  async deleteTeam(userId: string, teamId: string) {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      include: { participants: true },
    });

    if (!team) throw new NotFoundException('Team not found');
    if (team.leaderId !== userId) {
      throw new ForbiddenException('Only the team leader can delete the team.');
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Update all participants' registrations to SOLO
      if (team.hackathonId) {
        await tx.registration.updateMany({
          where: {
            hackathonId: team.hackathonId,
            participantId: { in: team.participants.map((p) => p.id) },
          },
          data: { status: 'SOLO' },
        });
      }

      // 2. Delete team
      await tx.team.delete({
        where: { id: teamId },
      });

      return {
        message: 'Team deleted successfully. Members moved to community pool.',
      };
    });
  }

  /**
   * Leader invites a SOLO participant into their team.
   * Moves the user from SOLO -> IN_TEAM and connects them to the team.
   */
  async inviteSoloUser(leaderId: string, teamId: string, targetUserId: string) {
    // 1. Verify team exists and caller is the leader
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      include: { hackathon: true, participants: true },
    });

    if (!team) throw new NotFoundException('Team not found');
    if (team.leaderId !== leaderId) {
      throw new ForbiddenException('Only the team leader can invite members.');
    }
    if (!team.hackathonId) {
      throw new BadRequestException('Team is not linked to a hackathon.');
    }

    // 2. Check team capacity
    const hackathon = team.hackathon!;
    if (team.participants.length >= hackathon.teamSize) {
      throw new BadRequestException('Team is already full.');
    }

    // 3. Verify the target user has a SOLO registration for this hackathon
    const soloRegistration = await this.prisma.registration.findUnique({
      where: {
        participantId_hackathonId: {
          participantId: targetUserId,
          hackathonId: team.hackathonId,
        },
      },
      include: { participant: true },
    });

    if (!soloRegistration || soloRegistration.status !== 'SOLO') {
      throw new BadRequestException(
        'User is not in the community pool for this hackathon.',
      );
    }

    // 4. Move the user into the team
    return this.prisma.$transaction(async (tx) => {
      // Update registration status
      await tx.registration.update({
        where: { id: soloRegistration.id },
        data: { status: 'IN_TEAM' },
      });

      // Connect participant to team
      const updatedTeam = await tx.team.update({
        where: { id: teamId },
        data: {
          memberEmails: { push: soloRegistration.participant.email },
          participants: { connect: [{ id: targetUserId }] },
        },
        include: { participants: true },
      });

      // Auto-register if team hits min size
      if (updatedTeam.participants.length >= hackathon.teamSize) {
        await tx.team.update({
          where: { id: teamId },
          data: { status: 'REGISTERED' },
        });
        updatedTeam.status = 'REGISTERED';

        this.mailService
          .sendTeamRegistrationSuccess(
            team.leadEmail,
            team.teamName,
            hackathon.name,
          )
          .catch(() => {});
      }

      return {
        message: `${soloRegistration.participant.fullName || soloRegistration.participant.email} has been added to ${team.teamName}`,
        team: updatedTeam,
      };
    });
  }

  /**
   * Leader manually finalizes a team.
   * Checks min team size (defaults to hackathon.teamSize) and marks team as REGISTERED.
   */
  async finalizeTeam(leaderId: string, teamId: string) {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      include: { hackathon: true, participants: true },
    });

    if (!team) throw new NotFoundException('Team not found');
    if (team.leaderId !== leaderId) {
      throw new ForbiddenException(
        'Only the team leader can finalize the team.',
      );
    }
    if (!team.hackathonId || !team.hackathon) {
      throw new BadRequestException('Team is not linked to a hackathon.');
    }

    if (team.status === 'REGISTERED') {
      throw new BadRequestException('Team is already registered.');
    }

    // Check minimum size — at least teamSize members required
    const minSize = team.hackathon.teamSize;
    if (team.participants.length < minSize) {
      throw new BadRequestException(
        `Team needs at least ${minSize} members to finalize. Currently has ${team.participants.length}.`,
      );
    }

    // Mark as REGISTERED
    const updatedTeam = await this.prisma.team.update({
      where: { id: teamId },
      data: { status: 'REGISTERED' },
      include: { participants: true },
    });

    // Send registration email
    this.mailService
      .sendTeamRegistrationSuccess(
        team.leadEmail,
        team.teamName,
        team.hackathon.name,
      )
      .catch(() => {});

    return {
      message: `Team "${team.teamName}" is now REGISTERED for ${team.hackathon.name}!`,
      team: updatedTeam,
    };
  }
}
