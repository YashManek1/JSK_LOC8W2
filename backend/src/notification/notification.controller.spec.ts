import { Test, TestingModule } from '@nestjs/testing';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { AuthGuard } from '@nestjs/passport';

const mockNotificationService = {
  subscribe: jest.fn(),
};

const mockReq = { user: { id: 'u1', sub: undefined } } as any;

describe('NotificationController', () => {
  let controller: NotificationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationController],
      providers: [
        { provide: NotificationService, useValue: mockNotificationService },
      ],
    })
      .overrideGuard(AuthGuard('jwt'))
      .useValue({ canActivate: () => true })
      .compile();
    controller = module.get<NotificationController>(NotificationController);
  });

  afterEach(() => jest.clearAllMocks());

  // ───── POST /notifications/subscribe ──────────────────────────────
  describe('POST /notifications/subscribe', () => {
    const subscriptionBody = {
      endpoint: 'https://push.example.com/sub123',
      keys: { p256dh: 'BKEY...', auth: 'AUTH...' },
    };

    it('should save push subscription and return success message', async () => {
      mockNotificationService.subscribe.mockResolvedValue(undefined);
      const result = await controller.subscribe(mockReq, subscriptionBody);
      expect(mockNotificationService.subscribe).toHaveBeenCalledWith(
        'u1',
        subscriptionBody,
      );
      expect(result).toEqual({ message: 'Push subscription saved' });
    });

    it('should use sub field if id is missing', async () => {
      mockNotificationService.subscribe.mockResolvedValue(undefined);
      const req = { user: { id: undefined, sub: 'u2' } } as any;
      await controller.subscribe(req, subscriptionBody);
      expect(mockNotificationService.subscribe).toHaveBeenCalledWith(
        'u2',
        subscriptionBody,
      );
    });

    it('should fall back to empty string if both id and sub are absent', async () => {
      mockNotificationService.subscribe.mockResolvedValue(undefined);
      const req = { user: {} } as any;
      await controller.subscribe(req, subscriptionBody);
      expect(mockNotificationService.subscribe).toHaveBeenCalledWith(
        '',
        subscriptionBody,
      );
    });
  });
});
