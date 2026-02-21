import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import {
  FileInterceptor,
  FileFieldsInterceptor,
} from '@nestjs/platform-express';
import { extname } from 'path';
import * as fs from 'fs';
import { VoiceChatService } from './voice-chat.service';

@Controller('api/chat')
export class VoiceChatController {
  constructor(private readonly voiceChatService: VoiceChatService) {}

  @Post('start')
  async startSession(@Body('email') email: string) {
    if (!email || !email.trim()) {
      throw new BadRequestException('Email is required.');
    }
    return this.voiceChatService.startSession(email.trim());
  }

  @Post('voice')
  @UseInterceptors(
    FileInterceptor('audio', {
      fileFilter: (req, file, cb) => {
        const ext = extname(file.originalname).toLowerCase();
        const allowed = ['.webm', '.wav', '.mp3', '.ogg', '.m4a'];
        if (!allowed.includes(ext)) {
          return cb(
            new BadRequestException('Only audio files are allowed.'),
            false,
          );
        }
        cb(null, true);
      },
      limits: { fileSize: 25 * 1024 * 1024 },
    }),
  )
  async processVoice(
    @UploadedFile() file: Express.Multer.File,
    @Body('sessionId') sessionId: string,
  ) {
    if (!sessionId) {
      throw new BadRequestException('sessionId is required.');
    }
    if (!file) {
      throw new BadRequestException('Audio file is required.');
    }
    const audioBuffer = file.buffer || fs.readFileSync(file.path);
    return this.voiceChatService.processAudioMessage(
      sessionId,
      audioBuffer.toString('base64'),
    );
  }

  @Post('message')
  async processMessage(
    @Body('sessionId') sessionId: string,
    @Body('message') message: string,
  ) {
    if (!sessionId) {
      throw new BadRequestException('sessionId is required.');
    }
    if (!message || !message.trim()) {
      throw new BadRequestException('message is required.');
    }
    return this.voiceChatService.processTextMessage(sessionId, message.trim());
  }

  @Get(':sessionId')
  async getSession(@Param('sessionId') sessionId: string) {
    const session = await this.voiceChatService.getSession(sessionId);
    if (!session) {
      throw new NotFoundException('Session not found.');
    }
    return session;
  }

  @Post('verify-identity')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'aadhaar', maxCount: 1 },
      { name: 'idCard', maxCount: 1 },
      { name: 'selfie', maxCount: 1 },
    ]),
  )
  async verifyIdentity(
    @UploadedFiles()
    files: {
      aadhaar?: Express.Multer.File[];
      idCard?: Express.Multer.File[];
      selfie?: Express.Multer.File[];
    },
    @Body('email') email: string,
  ) {
    if (!email) throw new BadRequestException('Email is required.');
    if (!files.aadhaar || !files.aadhaar[0])
      throw new BadRequestException('Aadhaar image is required.');
    if (!files.idCard || !files.idCard[0])
      throw new BadRequestException('ID Card image is required.');
    if (!files.selfie || !files.selfie[0])
      throw new BadRequestException('Selfie image is required.');

    return this.voiceChatService.verifyIdentity(
      email,
      files.aadhaar[0],
      files.idCard[0],
      files.selfie[0],
    );
  }
}
