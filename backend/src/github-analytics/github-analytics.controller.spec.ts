import { Test, TestingModule } from '@nestjs/testing';
import { GithubAnalyticsController } from './github-analytics.controller';
import { GithubAnalyticsService } from './github-analytics.service';

const mockGithubService = {
  syncRepoStats: jest.fn(),
  getRepoStats: jest.fn(),
};

describe('GithubAnalyticsController', () => {
  let controller: GithubAnalyticsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GithubAnalyticsController],
      providers: [
        { provide: GithubAnalyticsService, useValue: mockGithubService },
      ],
    }).compile();
    controller = module.get<GithubAnalyticsController>(GithubAnalyticsController);
  });

  afterEach(() => jest.clearAllMocks());

  // ───── POST /github/sync/:shortlistId ────────────────────────────
  describe('POST /github/sync/:shortlistId', () => {
    it('should trigger force sync for a shortlist entry', async () => {
      mockGithubService.syncRepoStats.mockResolvedValue({ synced: true });
      const result = await controller.forceSync('sl1', 'https://github.com/org/repo');
      expect(mockGithubService.syncRepoStats).toHaveBeenCalledWith(
        'sl1',
        'https://github.com/org/repo',
      );
      expect(result).toEqual({ synced: true });
    });

    it('should decode URL-encoded shortlistId', async () => {
      mockGithubService.syncRepoStats.mockResolvedValue({ synced: true });
      await controller.forceSync('team%20alpha', undefined);
      expect(mockGithubService.syncRepoStats).toHaveBeenCalledWith(
        'team alpha',
        undefined,
      );
    });
  });

  // ───── GET /github/stats/:shortlistId ────────────────────────────
  describe('GET /github/stats/:shortlistId', () => {
    it('should return cached repo stats', async () => {
      mockGithubService.getRepoStats.mockResolvedValue({ commits: 50 });
      const result = await controller.getStats('sl1');
      expect(result).toEqual({ commits: 50 });
    });

    it('should return null if no stats found', async () => {
      mockGithubService.getRepoStats.mockResolvedValue(null);
      const result = await controller.getStats('unknown');
      expect(result).toBeNull();
    });
  });

  // ───── GET /github/commits/:teamName ─────────────────────────────
  describe('GET /github/commits/:teamName', () => {
    it('should return commits mapped from repo stats', async () => {
      mockGithubService.getRepoStats.mockResolvedValue({
        totalCommits: 25,
        contributors: [{ login: 'dev1' }],
        lastUpdated: new Date('2025-01-01'),
      });
      const result = await controller.getCommitsByTeam('TeamAlpha');
      expect(result).toMatchObject({ total: 25, teamName: 'TeamAlpha' });
      expect(result.contributors).toHaveLength(1);
    });

    it('should return defaults if stats is null', async () => {
      mockGithubService.getRepoStats.mockResolvedValue(null);
      const result = await controller.getCommitsByTeam('UnknownTeam');
      expect(result).toEqual({ total: 0, contributors: [] });
    });
  });
});
