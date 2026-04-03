import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from './admin.controller';
import { ShortlistService } from './shortlist.service';

const mockShortlistService = {
  getActiveConfig: jest.fn(),
  upsertConfig: jest.fn(),
  newRound: jest.fn(),
  massCreateSubmissions: jest.fn(),
  startMassEvaluation: jest.fn(),
  getLeaderboard: jest.fn(),
  getAllEntries: jest.fn(),
  getQueueStatus: jest.fn(),
  getStats: jest.fn(),
  eliminateEntry: jest.fn(),
  restoreEntry: jest.fn(),
  requeueEntry: jest.fn(),
  setAdminNote: jest.fn(),
  overrideScore: jest.fn(),
  publishLeaderboard: jest.fn(),
  rescoreAll: jest.fn(),
};

describe('Shortlist AdminController', () => {
  let controller: AdminController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [{ provide: ShortlistService, useValue: mockShortlistService }],
    }).compile();
    controller = module.get<AdminController>(AdminController);
  });

  afterEach(() => jest.clearAllMocks());

  // ───── GET /admin/config ──────────────────────────────────────────
  describe('GET /admin/config', () => {
    it('should return active config', async () => {
      mockShortlistService.getActiveConfig.mockResolvedValue({ maxRounds: 3 });
      const result = await controller.getConfig();
      expect(result).toEqual({ maxRounds: 3 });
    });
  });

  // ───── POST /admin/config ─────────────────────────────────────────
  describe('POST /admin/config', () => {
    it('should save config', async () => {
      mockShortlistService.upsertConfig.mockResolvedValue({ maxRounds: 5 });
      const result = await controller.saveConfig({ maxRounds: 5 });
      expect(result).toEqual({ maxRounds: 5 });
    });
  });

  // ───── POST /admin/new-round ──────────────────────────────────────
  describe('POST /admin/new-round', () => {
    it('should start a new round', async () => {
      mockShortlistService.newRound.mockResolvedValue({ round: 2 });
      const result = await controller.newRound();
      expect(result).toEqual({ round: 2 });
    });
  });

  // ───── POST /admin/mass-upload ────────────────────────────────────
  describe('POST /admin/mass-upload', () => {
    it('should return zero count when no files provided', async () => {
      const result = await controller.massUpload([]);
      expect(result).toEqual({ count: 0, etaSeconds: 0 });
    });

    it('should create submissions for uploaded files', async () => {
      mockShortlistService.massCreateSubmissions.mockResolvedValue({ queued: 2 });
      const files = [
        { originalname: 'team-alpha.pptx', path: '/up/a.pptx' },
        { originalname: 'team_beta.pptx', path: '/up/b.pptx' },
      ] as Express.Multer.File[];
      const result = await controller.massUpload(files);
      expect(result).toEqual({ queued: 2 });
    });
  });

  // ───── GET /admin/leaderboard ─────────────────────────────────────
  describe('GET /admin/leaderboard', () => {
    it('should return leaderboard data', async () => {
      mockShortlistService.getLeaderboard.mockResolvedValue([{ rank: 1, team: 'A' }]);
      const result = await controller.leaderboard();
      expect(result).toHaveLength(1);
    });
  });

  // ───── POST /admin/entries/:id/eliminate ─────────────────────────
  describe('POST /admin/entries/:id/eliminate', () => {
    it('should eliminate an entry', async () => {
      mockShortlistService.eliminateEntry.mockResolvedValue({ eliminated: true });
      const result = await controller.eliminate('e1');
      expect(result).toEqual({ eliminated: true });
    });
  });

  // ───── POST /admin/entries/:id/restore ───────────────────────────
  describe('POST /admin/entries/:id/restore', () => {
    it('should restore an eliminated entry', async () => {
      mockShortlistService.restoreEntry.mockResolvedValue({ restored: true });
      const result = await controller.restore('e1');
      expect(result).toEqual({ restored: true });
    });
  });

  // ───── PATCH /admin/entries/:id/note ─────────────────────────────
  describe('PATCH /admin/entries/:id/note', () => {
    it('should set admin note on an entry', async () => {
      mockShortlistService.setAdminNote.mockResolvedValue({ noted: true });
      const result = await controller.setNote('e1', { note: 'Very good!' });
      expect(mockShortlistService.setAdminNote).toHaveBeenCalledWith(
        'e1',
        'Very good!',
      );
      expect(result).toEqual({ noted: true });
    });
  });

  // ───── PATCH /admin/entries/:id/override ─────────────────────────
  describe('PATCH /admin/entries/:id/override', () => {
    it('should override score', async () => {
      mockShortlistService.overrideScore.mockResolvedValue({ overridden: true });
      const result = await controller.override('e1', { score: 95 });
      expect(mockShortlistService.overrideScore).toHaveBeenCalledWith(
        'e1',
        95,
        '',
      );
      expect(result).toEqual({ overridden: true });
    });

    it('should pass optional note to overrideScore', async () => {
      mockShortlistService.overrideScore.mockResolvedValue({ overridden: true });
      await controller.override('e1', { score: 95, note: 'Manual review' });
      expect(mockShortlistService.overrideScore).toHaveBeenCalledWith(
        'e1',
        95,
        'Manual review',
      );
    });
  });

  // ───── POST /admin/publish ────────────────────────────────────────
  describe('POST /admin/publish', () => {
    it('should publish leaderboard', async () => {
      mockShortlistService.publishLeaderboard.mockResolvedValue({ published: true });
      const result = await controller.publish();
      expect(result).toEqual({ published: true });
    });
  });

  // ───── POST /admin/rescore ────────────────────────────────────────
  describe('POST /admin/rescore', () => {
    it('should rescore all entries', async () => {
      mockShortlistService.rescoreAll.mockResolvedValue({ rescored: 10 });
      const result = await controller.rescore();
      expect(result).toEqual({ rescored: 10 });
    });
  });
});
