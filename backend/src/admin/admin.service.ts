import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcryptjs';
import { Role, UserStatus } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getUsers() {
    return this.prisma.participant.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });
  }

  async createUser(dto: CreateUserDto) {
    // Generate simple hashed password in real app or use 'password' mock
    const hashedPassword = await bcrypt.hash(
      dto.passwordHash || 'password',
      10,
    );
    return this.prisma.participant.create({
      data: {
        email: dto.email,
        fullName: dto.fullName,
        password: hashedPassword,
        role: dto.role || Role.PARTICIPANT,
      },
      select: { id: true, email: true, role: true },
    });
  }

  async updateUserStatus(userId: string, targetStatus: string) {
    // Validate if it's a known Enum (could just cast implicitly but Prisma enforces it)
    let finalStatus: UserStatus = UserStatus.ACTIVE;
    if (targetStatus === 'SUSPENDED') {
      finalStatus = UserStatus.SUSPENDED;
    }

    return this.prisma.participant.update({
      where: { id: userId },
      data: { status: finalStatus },
      select: { id: true, status: true },
    });
  }

  async updateUserRole(userId: string, targetRole: string) {
    const roleKeys = Object.values(Role) as string[];
    if (!roleKeys.includes(targetRole.toUpperCase())) {
      throw new NotFoundException('Role not found');
    }

    return this.prisma.participant.update({
      where: { id: userId },
      data: { role: targetRole.toUpperCase() as Role },
      select: { id: true, role: true },
    });
  }

  async getParticipants() {
    // Returns participants joined w/ check-in info
    // For admin UI to see who arrived vs who is registered.
    const participants = await this.prisma.participant.findMany();

    const checkIns = await this.prisma.checkInQR.findMany();
    const checkInMap = new Set(checkIns.map((ci) => ci.participantId));

    return participants.map((p) => ({
      id: p.id,
      fullName: p.fullName,
      email: p.email,
      college: p.college,
      hasCheckedIn: checkInMap.has(p.id),
      status: p.status || 'UNKNOWN',
    }));
  }

  async getStatsOverview() {
    const totalUsers = await this.prisma.participant.count();
    const totalTeams = await this.prisma.team.count();
    const totalCheckIns = await this.prisma.checkInQR.count();
    const totalProjects = await this.prisma.project.count();

    return {
      status: 'success',
      data: {
        users: totalUsers,
        teams: totalTeams,
        checkIns: totalCheckIns,
        projects: totalProjects,
      },
    };
  }
}
