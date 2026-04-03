import { Test, TestingModule } from '@nestjs/testing';
import { CheckInController } from './check-in.controller';
import { CheckInService } from './check-in.service';
import { AuthGuard } from '@nestjs/passport';

const mockCheckInService = {
  scanCheckInQR: jest.fn(),
  verifyFace: jest.fn(),
  scanMealQR: jest.fn(),
  getMyCheckInQR: jest.fn(),
  getMyMealQRs: jest.fn(),
};

const mockReq = {
  user: { userId: 'u1', email: 'u@u.com', role: 'PARTICIPANT' },
} as any;

describe('CheckInController', () => {
  let controller: CheckInController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CheckInController],
      providers: [{ provide: CheckInService, useValue: mockCheckInService }],
    })
      .overrideGuard(AuthGuard('jwt'))
      .useValue({ canActivate: () => true })
      .compile();
    controller = module.get<CheckInController>(CheckInController);
  });

  afterEach(() => jest.clearAllMocks());

  // ───── POST /check-in/scan ────────────────────────────────────────
  describe('POST /check-in/scan', () => {
    it('should scan a check-in QR token', async () => {
      mockCheckInService.scanCheckInQR.mockResolvedValue({ success: true });
      const result = await controller.scanCheckIn('qrToken123');
      expect(mockCheckInService.scanCheckInQR).toHaveBeenCalledWith('qrToken123');
      expect(result).toEqual({ success: true });
    });

    it('should propagate error for invalid/expired QR token', async () => {
      mockCheckInService.scanCheckInQR.mockRejectedValue(new Error('Invalid QR'));
      await expect(controller.scanCheckIn('badToken')).rejects.toThrow('Invalid QR');
    });
  });

  // ───── POST /check-in/verify-face ────────────────────────────────
  describe('POST /check-in/verify-face', () => {
    const selfie = { buffer: Buffer.from('img') } as Express.Multer.File;

    it('should verify face with valid selfie', async () => {
      mockCheckInService.verifyFace.mockResolvedValue({ matched: true });
      const result = await controller.verifyFace('p1', selfie);
      expect(mockCheckInService.verifyFace).toHaveBeenCalledWith('p1', selfie);
      expect(result).toEqual({ matched: true });
    });

    it('should throw error if selfie is missing', async () => {
      await expect(
        controller.verifyFace('p1', undefined as any),
      ).rejects.toThrow('Selfie image is required');
    });
  });

  // ───── POST /check-in/scan-meal ───────────────────────────────────
  describe('POST /check-in/scan-meal', () => {
    it('should scan a meal QR token', async () => {
      mockCheckInService.scanMealQR.mockResolvedValue({ meal: 'lunch' });
      const result = await controller.scanMeal('mealQR');
      expect(result).toEqual({ meal: 'lunch' });
    });

    it('should propagate error for already-used meal QR', async () => {
      mockCheckInService.scanMealQR.mockRejectedValue(new Error('Already used'));
      await expect(controller.scanMeal('usedQR')).rejects.toThrow('Already used');
    });
  });

  // ───── GET /check-in/my-qr/:hackathonId ──────────────────────────
  describe('GET /check-in/my-qr/:hackathonId', () => {
    it('should return QR code for the authenticated user', async () => {
      mockCheckInService.getMyCheckInQR.mockResolvedValue({ qr: 'data:image/png;...' });
      const result = await controller.getMyQR(mockReq, 'h1');
      expect(mockCheckInService.getMyCheckInQR).toHaveBeenCalledWith('u1', 'h1');
      expect(result).toHaveProperty('qr');
    });
  });

  // ───── GET /check-in/my-meals/:hackathonId ───────────────────────
  describe('GET /check-in/my-meals/:hackathonId', () => {
    it('should return meal QRs for the authenticated user', async () => {
      mockCheckInService.getMyMealQRs.mockResolvedValue([{ meal: 'breakfast' }]);
      const result = await controller.getMyMeals(mockReq, 'h1');
      expect(result).toEqual([{ meal: 'breakfast' }]);
    });
  });
});
