import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { AuthGuard } from '@nestjs/passport';

interface RequestWithUser {
  user: { id?: string; sub?: string };
}

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  /**
   * POST /notifications/subscribe
   * Body: { endpoint: string, keys: { p256dh: string, auth: string } }
   */
  @Post('subscribe')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(200)
  async subscribe(
    @Req() req: RequestWithUser,
    @Body() body: { endpoint: string; keys: { p256dh: string; auth: string } },
  ) {
    const userId = req.user?.id || req.user?.sub || '';
    await this.notificationService.subscribe(userId, body);
    return { message: 'Push subscription saved' };
  }
}
