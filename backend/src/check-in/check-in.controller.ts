import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { CheckInService } from './check-in.service';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';

interface RequestWithUser {
  user: { userId: string; email: string; role: string };
}

@Controller('check-in')
@UseGuards(AuthGuard('jwt'))
export class CheckInController {
  constructor(private readonly checkInService: CheckInService) {}

  // ─── Admin APIs ───

  @Post('scan')
  async scanCheckIn(@Body('qrToken') qrToken: string) {
    return this.checkInService.scanCheckInQR(qrToken);
  }

  @Post('verify-face')
  @UseInterceptors(FileInterceptor('selfie'))
  async verifyFace(
    @Body('participantId') participantId: string,
    @UploadedFile() selfie: Express.Multer.File,
  ) {
    if (!selfie) {
      throw new Error('Selfie image is required');
    }
    return this.checkInService.verifyFace(participantId, selfie);
  }

  @Post('scan-meal')
  async scanMeal(@Body('qrToken') qrToken: string) {
    return this.checkInService.scanMealQR(qrToken);
  }

  // ─── Student APIs ───

  @Get('my-qr/:hackathonId')
  async getMyQR(
    @Req() req: RequestWithUser,
    @Param('hackathonId') hackathonId: string,
  ) {
    return this.checkInService.getMyCheckInQR(req.user.userId, hackathonId);
  }

  @Get('my-meals/:hackathonId')
  async getMyMeals(
    @Req() req: RequestWithUser,
    @Param('hackathonId') hackathonId: string,
  ) {
    return this.checkInService.getMyMealQRs(req.user.userId, hackathonId);
  }
}
