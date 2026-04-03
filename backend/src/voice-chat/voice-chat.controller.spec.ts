import { Test, TestingModule } from '@nestjs/testing';
import { VoiceChatController } from './voice-chat.controller';
import { VoiceChatService } from './voice-chat.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

const mockVoiceChatService = {
  startSession: jest.fn(),
  processAudioMessage: jest.fn(),
  processTextMessage: jest.fn(),
  getSession: jest.fn(),
  verifyIdentity: jest.fn(),
};

describe('VoiceChatController', () => {
  let controller: VoiceChatController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VoiceChatController],
      providers: [
        { provide: VoiceChatService, useValue: mockVoiceChatService },
      ],
    }).compile();
    controller = module.get<VoiceChatController>(VoiceChatController);
  });

  afterEach(() => jest.clearAllMocks());

  // ───── POST /api/chat/start ───────────────────────────────────────
  describe('POST /api/chat/start', () => {
    it('should start a session for valid email', async () => {
      mockVoiceChatService.startSession.mockResolvedValue({ sessionId: 'sess1' });
      const result = await controller.startSession('test@test.com');
      expect(mockVoiceChatService.startSession).toHaveBeenCalledWith('test@test.com');
      expect(result).toEqual({ sessionId: 'sess1' });
    });

    it('should throw BadRequestException for empty email', async () => {
      await expect(controller.startSession('')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for whitespace-only email', async () => {
      await expect(controller.startSession('   ')).rejects.toThrow(BadRequestException);
    });
  });

  // ───── POST /api/chat/message ─────────────────────────────────────
  describe('POST /api/chat/message', () => {
    it('should process a text message', async () => {
      mockVoiceChatService.processTextMessage.mockResolvedValue({
        reply: 'Hello!',
      });
      const result = await controller.processMessage('sess1', 'Hi there');
      expect(mockVoiceChatService.processTextMessage).toHaveBeenCalledWith(
        'sess1',
        'Hi there',
      );
      expect(result).toEqual({ reply: 'Hello!' });
    });

    it('should throw BadRequestException if sessionId is missing', async () => {
      await expect(controller.processMessage('', 'Hello')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if message is empty', async () => {
      await expect(controller.processMessage('sess1', '')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if message is only whitespace', async () => {
      await expect(controller.processMessage('sess1', '   ')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  // ───── GET /api/chat/:sessionId ───────────────────────────────────
  describe('GET /api/chat/:sessionId', () => {
    it('should return a session for valid sessionId', async () => {
      mockVoiceChatService.getSession.mockResolvedValue({
        sessionId: 'sess1',
        status: 'active',
      });
      const result = await controller.getSession('sess1');
      expect(result).toHaveProperty('status', 'active');
    });

    it('should throw NotFoundException if session not found', async () => {
      mockVoiceChatService.getSession.mockResolvedValue(null);
      await expect(controller.getSession('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ───── POST /api/chat/verify-identity ────────────────────────────
  describe('POST /api/chat/verify-identity', () => {
    const aadhaar = [{ buffer: Buffer.from('') }] as Express.Multer.File[];
    const idCard = [{ buffer: Buffer.from('') }] as Express.Multer.File[];
    const selfie = [{ buffer: Buffer.from('') }] as Express.Multer.File[];

    it('should verify identity with all files provided', async () => {
      mockVoiceChatService.verifyIdentity.mockResolvedValue({ verified: true });
      const result = await controller.verifyIdentity(
        { aadhaar, idCard, selfie },
        'u@u.com',
      );
      expect(result).toEqual({ verified: true });
    });

    it('should throw BadRequestException if email is missing', async () => {
      await expect(
        controller.verifyIdentity({ aadhaar, idCard, selfie }, ''),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if aadhaar is missing', async () => {
      await expect(
        controller.verifyIdentity({ idCard, selfie }, 'u@u.com'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if idCard is missing', async () => {
      await expect(
        controller.verifyIdentity({ aadhaar, selfie }, 'u@u.com'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if selfie is missing', async () => {
      await expect(
        controller.verifyIdentity({ aadhaar, idCard }, 'u@u.com'),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
