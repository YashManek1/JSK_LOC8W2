import { Test, TestingModule } from '@nestjs/testing';
import { PsController } from './ps.controller';
import { PrismaService } from '../prisma/prisma.service';
import {
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

const mockPrisma = {
  hackathon: { findUnique: jest.fn() },
  team: { findFirst: jest.fn(), update: jest.fn() },
};

const pastDate = new Date(Date.now() - 1000 * 60 * 60); // 1 hr ago
const futureDate = new Date(Date.now() + 1000 * 60 * 60); // 1 hr later

const makeReq = (userId: string) => ({ user: { id: userId } } as any);

describe('PsController', () => {
  let controller: PsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PsController],
      providers: [{ provide: PrismaService, useValue: mockPrisma }],
    })
      .overrideGuard(AuthGuard('jwt'))
      .useValue({ canActivate: () => true })
      .compile();
    controller = module.get<PsController>(PsController);
  });

  afterEach(() => jest.clearAllMocks());

  // ───── GET /ps/:hackathonId ───────────────────────────────────────
  describe('GET /ps/:hackathonId', () => {
    it('should return domains when hackathon exists, PS released, user in registered team', async () => {
      mockPrisma.hackathon.findUnique.mockResolvedValue({
        id: 'h1',
        name: 'HackFest',
        psReleaseDate: pastDate,
        domains: [{ id: 'd1', name: 'AI' }],
      });
      mockPrisma.team.findFirst.mockResolvedValue({ id: 't1' });
      const result = await controller.getProblemStatements('h1', makeReq('u1'));
      expect(result).toHaveProperty('domains');
      expect(result.domains).toHaveLength(1);
    });

    it('should throw NotFoundException if hackathon not found', async () => {
      mockPrisma.hackathon.findUnique.mockResolvedValue(null);
      await expect(
        controller.getProblemStatements('bad', makeReq('u1')),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if PS not yet released', async () => {
      mockPrisma.hackathon.findUnique.mockResolvedValue({
        id: 'h1',
        psReleaseDate: futureDate,
        domains: [],
      });
      await expect(
        controller.getProblemStatements('h1', makeReq('u1')),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if user not in a registered team', async () => {
      mockPrisma.hackathon.findUnique.mockResolvedValue({
        id: 'h1',
        psReleaseDate: pastDate,
        domains: [],
      });
      mockPrisma.team.findFirst.mockResolvedValue(null);
      await expect(
        controller.getProblemStatements('h1', makeReq('u1')),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // ───── GET /ps/:hackathonId/preferences ──────────────────────────
  describe('GET /ps/:hackathonId/preferences', () => {
    it('should return preferences for registered team member', async () => {
      mockPrisma.team.findFirst.mockResolvedValue({
        psPreferences: ['d1', 'd2'],
        status: 'REGISTERED',
      });
      const result = await controller.getPreferences('h1', makeReq('u1'));
      expect(result.preferences).toEqual(['d1', 'd2']);
    });

    it('should throw ForbiddenException if no team or not registered', async () => {
      mockPrisma.team.findFirst.mockResolvedValue(null);
      await expect(
        controller.getPreferences('h1', makeReq('u1')),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // ───── PUT /ps/:hackathonId/preferences ──────────────────────────
  describe('PUT /ps/:hackathonId/preferences', () => {
    it('should save preferences for team leader', async () => {
      mockPrisma.team.findFirst.mockResolvedValue({
        id: 't1',
        leaderId: 'u1',
        status: 'REGISTERED',
      });
      mockPrisma.team.update.mockResolvedValue({ psPreferences: ['d1'] });
      const result = await controller.setPreferences(
        'h1',
        ['d1'],
        makeReq('u1'),
      );
      expect(result).toHaveProperty('message', 'Preferences updated successfully');
    });

    it('should throw BadRequestException for more than 3 preferences', async () => {
      await expect(
        controller.setPreferences('h1', ['d1', 'd2', 'd3', 'd4'], makeReq('u1')),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if preferences is not an array', async () => {
      await expect(
        controller.setPreferences('h1', 'not-an-array' as any, makeReq('u1')),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if team not found', async () => {
      mockPrisma.team.findFirst.mockResolvedValue(null);
      await expect(
        controller.setPreferences('h1', ['d1'], makeReq('u1')),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if team not registered', async () => {
      mockPrisma.team.findFirst.mockResolvedValue({
        id: 't1',
        leaderId: 'u1',
        status: 'PENDING',
      });
      await expect(
        controller.setPreferences('h1', ['d1'], makeReq('u1')),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if non-leader sets preferences', async () => {
      mockPrisma.team.findFirst.mockResolvedValue({
        id: 't1',
        leaderId: 'leaderX',
        status: 'REGISTERED',
      });
      await expect(
        controller.setPreferences('h1', ['d1'], makeReq('u2')),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
