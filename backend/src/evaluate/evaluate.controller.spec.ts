import { Test, TestingModule } from '@nestjs/testing';
import { EvaluateController } from './evaluate.controller';
import { EvaluateService } from './evaluate.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

const mockEvaluateService = {
  createEvaluation: jest.fn(),
  getEvaluation: jest.fn(),
  saveJudgeScores: jest.fn(),
};

describe('EvaluateController', () => {
  let controller: EvaluateController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EvaluateController],
      providers: [{ provide: EvaluateService, useValue: mockEvaluateService }],
    }).compile();
    controller = module.get<EvaluateController>(EvaluateController);
  });

  afterEach(() => jest.clearAllMocks());

  // ───── POST /evaluate ─────────────────────────────────────────────
  describe('POST /evaluate', () => {
    const validFile = { path: '/uploads/test.pptx' } as Express.Multer.File;

    it('should create evaluation with valid file and body', async () => {
      mockEvaluateService.createEvaluation.mockResolvedValue({ id: 'e1' });
      const result = await controller.evaluate(
        validFile,
        'TeamAlpha',
        'https://github.com/org/repo',
      );
      expect(result).toEqual({ id: 'e1' });
    });

    it('should throw BadRequestException if teamName is missing', async () => {
      await expect(
        controller.evaluate(validFile, '', 'https://github.com/org/repo'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if githubUrl is missing', async () => {
      await expect(
        controller.evaluate(validFile, 'TeamAlpha', ''),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if file is missing', async () => {
      await expect(
        controller.evaluate(undefined as any, 'TeamAlpha', 'https://github.com/org/repo'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid GitHub URL', async () => {
      await expect(
        controller.evaluate(validFile, 'TeamAlpha', 'https://notgithub.com/repo'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for github.com URL without repo path', async () => {
      await expect(
        controller.evaluate(validFile, 'TeamAlpha', 'https://github.com/'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ───── GET /evaluate/:id ──────────────────────────────────────────
  describe('GET /evaluate/:id', () => {
    it('should return evaluation for valid id', async () => {
      mockEvaluateService.getEvaluation.mockResolvedValue({ id: 'e1', status: 'DONE' });
      const result = await controller.getEvaluation('e1');
      expect(result).toHaveProperty('status', 'DONE');
    });

    it('should throw NotFoundException if evaluation not found', async () => {
      mockEvaluateService.getEvaluation.mockResolvedValue(null);
      await expect(controller.getEvaluation('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ───── POST /evaluate/score ───────────────────────────────────────
  describe('POST /evaluate/score', () => {
    it('should save judge scores', async () => {
      mockEvaluateService.saveJudgeScores.mockResolvedValue({ saved: true });
      const result = await controller.saveScores({
        evaluationId: 'e1',
        scores: { clarity: 8 },
        judgeId: 'j1',
      });
      expect(result).toEqual({ saved: true });
    });

    it('should throw BadRequestException if evaluationId is missing', async () => {
      await expect(
        controller.saveScores({ evaluationId: '', scores: { clarity: 8 } }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if scores are missing', async () => {
      await expect(
        controller.saveScores({ evaluationId: 'e1', scores: undefined as any }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
