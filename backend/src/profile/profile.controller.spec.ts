import { Test, TestingModule } from '@nestjs/testing';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { BadRequestException } from '@nestjs/common';

const mockProfileService = {
  getProfile: jest.fn(),
  updateProfile: jest.fn(),
  submitProfile: jest.fn(),
  extractResumeData: jest.fn(),
};

describe('ProfileController', () => {
  let controller: ProfileController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfileController],
      providers: [{ provide: ProfileService, useValue: mockProfileService }],
    }).compile();
    controller = module.get<ProfileController>(ProfileController);
  });

  afterEach(() => jest.clearAllMocks());

  // ───── GET /profile/:userId ───────────────────────────────────────
  describe('GET /profile/:userId', () => {
    it('should return profile for a valid userId', async () => {
      mockProfileService.getProfile.mockResolvedValue({ userId: 'u1', name: 'Alice' });
      const result = await controller.getProfile('u1');
      expect(mockProfileService.getProfile).toHaveBeenCalledWith('u1');
      expect(result).toHaveProperty('name', 'Alice');
    });

    it('should propagate error for invalid userId', async () => {
      mockProfileService.getProfile.mockRejectedValue(new Error('Not found'));
      await expect(controller.getProfile('bad')).rejects.toThrow('Not found');
    });
  });

  // ───── PUT /profile/:userId ───────────────────────────────────────
  describe('PUT /profile/:userId', () => {
    it('should update profile with provided body', async () => {
      mockProfileService.updateProfile.mockResolvedValue({ updated: true });
      const result = await controller.updateProfile('u1', { phone: '1234567890' });
      expect(mockProfileService.updateProfile).toHaveBeenCalledWith('u1', {
        phone: '1234567890',
      });
      expect(result).toEqual({ updated: true });
    });
  });

  // ───── POST /profile/submit ───────────────────────────────────────
  describe('POST /profile/submit', () => {
    it('should submit profile with userId in body', async () => {
      mockProfileService.submitProfile.mockResolvedValue({ submitted: true });
      const body = { userId: 'u1', college: 'MIT', skills: ['JS'] };
      const result = await controller.submitProfile(body);
      expect(mockProfileService.submitProfile).toHaveBeenCalledWith('u1', {
        college: 'MIT',
        skills: ['JS'],
      });
      expect(result).toEqual({ submitted: true });
    });

    it('should throw BadRequestException if userId is missing', async () => {
      await expect(
        controller.submitProfile({ college: 'MIT' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ───── POST /profile/:userId/resume ──────────────────────────────
  describe('POST /profile/:userId/resume', () => {
    it('should upload resume and extract data', async () => {
      mockProfileService.extractResumeData.mockResolvedValue({ skills: ['JS'] });
      const file = { originalname: 'resume.pdf', buffer: Buffer.from('') } as Express.Multer.File;
      const result = await controller.uploadResume('u1', file);
      expect(mockProfileService.extractResumeData).toHaveBeenCalledWith('u1', file);
      expect(result).toHaveProperty('skills');
    });

    it('should throw BadRequestException if file is missing', async () => {
      await expect(
        controller.uploadResume('u1', undefined as any),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
