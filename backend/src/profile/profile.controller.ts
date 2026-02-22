import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  Param,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get(':userId')
  async getProfile(@Param('userId') userId: string) {
    return this.profileService.getProfile(userId);
  }

  @Put(':userId')
  async updateProfile(
    @Param('userId') userId: string,
    @Body() body: Record<string, unknown>,
  ) {
    return this.profileService.updateProfile(userId, body);
  }

  @Post('submit')
  async submitProfile(@Body('userId') userId: string) {
    return this.profileService.submitProfile(userId);
  }

  @Post(':userId/resume')
  @UseInterceptors(FileInterceptor('file')) // Frontend expects `file` not `resume`
  async uploadResume(
    @Param('userId') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new Error('Resume file is required');
    }
    return this.profileService.extractResumeData(userId, file);
  }
}
