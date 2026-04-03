import { Test, TestingModule } from '@nestjs/testing';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { NotFoundException } from '@nestjs/common';

const mockDashboardService = {
  getTeamCommits: jest.fn(),
  getPPTScores: jest.fn(),
};

describe('DashboardController', () => {
  let controller: DashboardController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [{ provide: DashboardService, useValue: mockDashboardService }],
    }).compile();
    controller = module.get<DashboardController>(DashboardController);
  });

  afterEach(() => jest.clearAllMocks());

  // ───── GET /api/dashboard/commits/:teamId ─────────────────────────
  describe('GET /api/dashboard/commits/:teamId', () => {
    it('should return commits for a valid team', async () => {
      mockDashboardService.getTeamCommits.mockResolvedValue({
        total: 10,
        contributors: [],
      });
      const result = await controller.getTeamCommits('t1');
      expect(result).toHaveProperty('total', 10);
    });

    it('should throw NotFoundException if data is null', async () => {
      mockDashboardService.getTeamCommits.mockResolvedValue(null);
      await expect(controller.getTeamCommits('t999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ───── GET /api/dashboard/ppt-scores/:teamId ──────────────────────
  describe('GET /api/dashboard/ppt-scores/:teamId', () => {
    it('should return PPT scores for a valid team', async () => {
      mockDashboardService.getPPTScores.mockResolvedValue({
        overall: 88,
        breakdown: {},
      });
      const result = await controller.getPPTScores('t1');
      expect(result).toHaveProperty('overall', 88);
    });

    it('should throw NotFoundException if no scores exist', async () => {
      mockDashboardService.getPPTScores.mockResolvedValue(null);
      await expect(controller.getPPTScores('t999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ───── GET /api/dashboard/summary/:teamId ─────────────────────────
  describe('GET /api/dashboard/summary/:teamId', () => {
    it('should return combined summary with both commits and scores', async () => {
      mockDashboardService.getTeamCommits.mockResolvedValue({
        total: 5,
        contributors: [],
      });
      mockDashboardService.getPPTScores.mockResolvedValue({
        overall: 75,
        breakdown: {},
      });
      const result = await controller.getTeamSummary('t1');
      expect(result).toMatchObject({
        teamId: 't1',
        commits: { total: 5 },
        pptScores: { overall: 75 },
      });
    });

    it('should return defaults if commits and scores are null', async () => {
      mockDashboardService.getTeamCommits.mockResolvedValue(null);
      mockDashboardService.getPPTScores.mockResolvedValue(null);
      const result = await controller.getTeamSummary('t999');
      expect(result).toMatchObject({
        teamId: 't999',
        commits: { total: 0, contributors: [] },
        pptScores: { overall: 0, breakdown: {} },
      });
    });
  });
});
