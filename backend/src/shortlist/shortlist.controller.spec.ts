import { Test, TestingModule } from '@nestjs/testing';
import { ShortlistController } from './shortlist.controller';
import { ShortlistService } from './shortlist.service';

const mockShortlistService = {
  createSubmission: jest.fn(),
  getEntry: jest.fn(),
};

describe('ShortlistController', () => {
  let controller: ShortlistController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShortlistController],
      providers: [{ provide: ShortlistService, useValue: mockShortlistService }],
    }).compile();
    controller = module.get<ShortlistController>(ShortlistController);
  });

  afterEach(() => jest.clearAllMocks());

  // ───── POST /shortlist/submit ─────────────────────────────────────
  describe('POST /shortlist/submit', () => {
    const pptxFile = {
      path: '/uploads/file.pptx',
      originalname: 'file.pptx',
    } as Express.Multer.File;

    it('should create submission with valid file and body', async () => {
      mockShortlistService.createSubmission.mockResolvedValue({ id: 's1' });
      const result = await controller.submit(pptxFile, {
        teamName: 'Team Alpha',
        githubUrl: 'https://github.com/org/repo',
      });
      expect(mockShortlistService.createSubmission).toHaveBeenCalledWith({
        teamName: 'Team Alpha',
        githubUrl: 'https://github.com/org/repo',
        pptxPath: '/uploads/file.pptx',
      });
      expect(result).toEqual({ id: 's1' });
    });

    it('should throw if pptx file is missing', async () => {
      await expect(
        controller.submit(undefined as any, { teamName: 'Team Alpha' }),
      ).rejects.toThrow('PPTX file is required.');
    });

    it('should throw if teamName is missing', async () => {
      await expect(
        controller.submit(pptxFile, { teamName: '' }),
      ).rejects.toThrow('Team name is required.');
    });

    it('should throw if teamName is only whitespace', async () => {
      await expect(
        controller.submit(pptxFile, { teamName: '   ' }),
      ).rejects.toThrow('Team name is required.');
    });
  });

  // ───── GET /shortlist/:id ─────────────────────────────────────────
  describe('GET /shortlist/:id', () => {
    it('should return entry details for valid id', async () => {
      mockShortlistService.getEntry.mockResolvedValue({ id: 's1', score: 85 });
      const result = await controller.getEntry('s1');
      expect(result).toHaveProperty('score', 85);
    });

    it('should propagate error for invalid id', async () => {
      mockShortlistService.getEntry.mockRejectedValue(new Error('Not found'));
      await expect(controller.getEntry('bad')).rejects.toThrow('Not found');
    });
  });
});
