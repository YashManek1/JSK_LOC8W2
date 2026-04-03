import { Test, TestingModule } from '@nestjs/testing';
import { JudgeController } from './judge.controller';
import { JudgeService } from './judge.service';
import { UnauthorizedException } from '@nestjs/common';

const mockJudgeService = {
  getAssignedTeams: jest.fn(),
  submitScore: jest.fn(),
  submitNote: jest.fn(),
};

const judgeReq = {
  user: { sub: 'j1' },
  headers: {},
} as any;

const noUserReq = {
  user: undefined,
  headers: {},
} as any;

describe('JudgeController', () => {
  let controller: JudgeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JudgeController],
      providers: [{ provide: JudgeService, useValue: mockJudgeService }],
    }).compile();
    controller = module.get<JudgeController>(JudgeController);
  });

  afterEach(() => jest.clearAllMocks());

  // ───── GET /api/judge/teams ───────────────────────────────────────
  describe('GET /api/judge/teams', () => {
    it('should return assigned teams for authenticated judge', async () => {
      mockJudgeService.getAssignedTeams.mockResolvedValue([{ id: 't1' }]);
      const result = await controller.getAssignedTeams(judgeReq);
      expect(mockJudgeService.getAssignedTeams).toHaveBeenCalledWith('j1');
      expect(result).toEqual([{ id: 't1' }]);
    });

    it('should use x-user-id header if user sub is missing', async () => {
      mockJudgeService.getAssignedTeams.mockResolvedValue([]);
      const req = { user: undefined, headers: { 'x-user-id': 'j2' } } as any;
      await controller.getAssignedTeams(req);
      expect(mockJudgeService.getAssignedTeams).toHaveBeenCalledWith('j2');
    });

    it('should throw UnauthorizedException if no user id available', async () => {
      await expect(controller.getAssignedTeams(noUserReq)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  // ───── POST /api/judge/score/:teamId ──────────────────────────────
  describe('POST /api/judge/score/:teamId', () => {
    it('should submit scores for a team', async () => {
      mockJudgeService.submitScore.mockResolvedValue({ saved: true });
      const scores = { innovation: 9, execution: 8 } as any;
      const result = await controller.submitScore('t1', scores, judgeReq);
      expect(mockJudgeService.submitScore).toHaveBeenCalledWith('t1', 'j1', scores);
      expect(result).toEqual({ saved: true });
    });

    it('should throw UnauthorizedException if no user id available', async () => {
      await expect(
        controller.submitScore('t1', {} as any, noUserReq),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  // ───── POST /api/judge/note/:teamId ───────────────────────────────
  describe('POST /api/judge/note/:teamId', () => {
    it('should submit a note for a team', async () => {
      mockJudgeService.submitNote.mockResolvedValue({ noted: true });
      const result = await controller.submitNote('t1', 'Great work!', judgeReq);
      expect(mockJudgeService.submitNote).toHaveBeenCalledWith(
        't1',
        'j1',
        'Great work!',
      );
      expect(result).toEqual({ noted: true });
    });

    it('should throw UnauthorizedException if no user id', async () => {
      await expect(
        controller.submitNote('t1', 'note', noUserReq),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
