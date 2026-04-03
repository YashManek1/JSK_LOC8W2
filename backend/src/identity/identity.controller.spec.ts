import { Test, TestingModule } from '@nestjs/testing';
import { IdentityController } from './identity.controller';
import { IdentityService } from './identity.service';
import { BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

const mockIdentityService = {
  verifyIdentity: jest.fn(),
};

const mockReq = { user: { id: 'u1' } } as any;

describe('IdentityController', () => {
  let controller: IdentityController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IdentityController],
      providers: [{ provide: IdentityService, useValue: mockIdentityService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();
    controller = module.get<IdentityController>(IdentityController);
  });

  afterEach(() => jest.clearAllMocks());

  // ───── POST /api/identity/verify ─────────────────────────────────
  describe('POST /api/identity/verify', () => {
    const idCard = [{ path: '/uploads/identity/idCard-1234.jpg' }] as Express.Multer.File[];
    const liveSelfie = [{ path: '/uploads/identity/selfie-5678.jpg' }] as Express.Multer.File[];

    it('should verify identity with both files provided', async () => {
      mockIdentityService.verifyIdentity.mockResolvedValue({ verified: true });
      const result = await controller.verifyIdentity(mockReq, {
        idCard,
        liveSelfie,
      });
      expect(mockIdentityService.verifyIdentity).toHaveBeenCalledWith(
        'u1',
        idCard[0].path,
        liveSelfie[0].path,
      );
      expect(result).toEqual({ verified: true });
    });

    it('should throw BadRequestException if idCard is missing', async () => {
      await expect(
        controller.verifyIdentity(mockReq, { liveSelfie }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if liveSelfie is missing', async () => {
      await expect(
        controller.verifyIdentity(mockReq, { idCard }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if both files are missing', async () => {
      await expect(
        controller.verifyIdentity(mockReq, {}),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
