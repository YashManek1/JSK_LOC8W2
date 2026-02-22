import {
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { AppService } from './app.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('ocr/aadhaar')
  @UseInterceptors(FileInterceptor('file'))
  async proxyAadhaar(@UploadedFile() file: Express.Multer.File) {
    // Acts as a proxy or mock for the Python OCR service
    return {
      status: 'success',
      data: { name: 'Hackathon Participant', aadhaar_number: 'XXXX-XXXX-1234' },
      proxyWarning: 'Python service disconnected, returning mock data',
    };
  }

  @Post('api/verify-face')
  @UseInterceptors(FileInterceptor('file'))
  async proxyVerifyFace(@UploadedFile() file: Express.Multer.File) {
    // Acts as a proxy or mock for the Python Face verification service
    return {
      status: 'success',
      verified: true,
      match_score: 0.98,
      proxyWarning: 'Python service disconnected, returning mock data',
    };
  }
}
