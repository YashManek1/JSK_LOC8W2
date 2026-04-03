import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { Aes256Service } from '../security/aes256.service';
import { BadRequestException } from '@nestjs/common';

const mockAuthService = {
  signup: jest.fn(),
  login: jest.fn(),
  sendOtp: jest.fn(),
  verifyOtp: jest.fn(),
  generateTokens: jest.fn(),
};

const mockPrismaService = {
  participant: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
};

const mockAes256Service = {
  encrypt: jest.fn(),
};

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: Aes256Service, useValue: mockAes256Service },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  afterEach(() => jest.clearAllMocks());

  // ───── POST /auth/signup ──────────────────────────────────────────
  describe('POST /auth/signup', () => {
    const aadhaarFile = { originalname: 'aadhaar.jpg' } as Express.Multer.File;
    const idCardFile = { originalname: 'id.jpg' } as Express.Multer.File;

    it('should call AuthService.signup with valid files for participant', async () => {
      mockAuthService.signup.mockResolvedValue({ id: '1', email: 'a@b.com' });
      const body = { email: 'a@b.com', password: 'pass', role: 'PARTICIPANT' };
      const result = await controller.signup(body, {
        aadhaar: [aadhaarFile],
        idCard: [idCardFile],
      });
      expect(mockAuthService.signup).toHaveBeenCalledWith(body, aadhaarFile, idCardFile);
      expect(result).toEqual({ id: '1', email: 'a@b.com' });
    });

    it('should throw BadRequestException if aadhaar missing for participant', async () => {
      const body = { email: 'a@b.com', password: 'pass', role: 'PARTICIPANT' };
      await expect(
        controller.signup(body, { idCard: [idCardFile] }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if idCard missing for participant', async () => {
      const body = { email: 'a@b.com', password: 'pass', role: 'PARTICIPANT' };
      await expect(
        controller.signup(body, { aadhaar: [aadhaarFile] }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should NOT require files for ADMIN role', async () => {
      mockAuthService.signup.mockResolvedValue({ id: '2', role: 'ADMIN' });
      const body = { email: 'admin@b.com', password: 'pass', role: 'ADMIN' };
      await controller.signup(body, {});
      expect(mockAuthService.signup).toHaveBeenCalledWith(body, undefined, undefined);
    });
  });

  // ───── POST /auth/login ───────────────────────────────────────────
  describe('POST /auth/login', () => {
    it('should return tokens on valid credentials', async () => {
      mockAuthService.login.mockResolvedValue({ accessToken: 'tkn' });
      const result = await controller.login({
        email: 'test@test.com',
        password: 'pass',
        role: 'PARTICIPANT',
      });
      expect(result).toEqual({ accessToken: 'tkn' });
    });

    it('should forward login call to AuthService', async () => {
      const body = { email: 'x@x.com', password: 'secret', role: 'ADMIN' };
      mockAuthService.login.mockResolvedValue({ accessToken: 'abc' });
      await controller.login(body);
      expect(mockAuthService.login).toHaveBeenCalledWith(body);
    });
  });

  // ───── POST /auth/send-otp ────────────────────────────────────────
  describe('POST /auth/send-otp', () => {
    it('should send OTP with email', async () => {
      mockAuthService.sendOtp.mockResolvedValue({ message: 'OTP sent' });
      const result = await controller.sendOtp({ email: 'a@b.com' });
      expect(mockAuthService.sendOtp).toHaveBeenCalledWith('a@b.com', undefined);
      expect(result).toEqual({ message: 'OTP sent' });
    });

    it('should throw BadRequestException when neither email nor phone provided', async () => {
      await expect(controller.sendOtp({ email: '' })).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  // ───── POST /auth/verify-otp ──────────────────────────────────────
  describe('POST /auth/verify-otp', () => {
    it('should verify OTP successfully', async () => {
      mockAuthService.verifyOtp.mockResolvedValue({ verified: true });
      const result = await controller.verifyOtp({
        email: 'a@b.com',
        otp: '123456',
      });
      expect(result).toEqual({ verified: true });
    });

    it('should throw BadRequestException if email and phone are both missing', () => {
      expect(() =>
        controller.verifyOtp({ email: '', otp: '000' }),
      ).toThrow(BadRequestException);
    });

    it('should throw BadRequestException if OTP is missing', () => {
      expect(() =>
        controller.verifyOtp({ email: 'a@b.com', otp: '' }),
      ).toThrow(BadRequestException);
    });
  });
});
