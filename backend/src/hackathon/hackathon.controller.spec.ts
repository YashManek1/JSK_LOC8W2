import { Test, TestingModule } from '@nestjs/testing';
import { HackathonController } from './hackathon.controller';
import { HackathonService } from './hackathon.service';

const mockHackathonService = {
  getHackathonTime: jest.fn(),
};

describe('HackathonController', () => {
  let controller: HackathonController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HackathonController],
      providers: [{ provide: HackathonService, useValue: mockHackathonService }],
    }).compile();
    controller = module.get<HackathonController>(HackathonController);
  });

  afterEach(() => jest.clearAllMocks());

  // ───── GET /api/hackathon/:id/time ───────────────────────────────
  describe('GET /api/hackathon/:id/time', () => {
    it('should return hackathon time info for a valid id', async () => {
      mockHackathonService.getHackathonTime.mockResolvedValue({
        startTime: new Date('2025-01-01'),
        endTime: new Date('2025-01-02'),
      });
      const result = await controller.getHackathonTime('h1');
      expect(mockHackathonService.getHackathonTime).toHaveBeenCalledWith('h1');
      expect(result).toHaveProperty('startTime');
    });

    it('should propagate error for invalid/nonexistent hackathon id', async () => {
      mockHackathonService.getHackathonTime.mockRejectedValue(
        new Error('Not found'),
      );
      await expect(controller.getHackathonTime('invalid-id')).rejects.toThrow(
        'Not found',
      );
    });
  });
});
