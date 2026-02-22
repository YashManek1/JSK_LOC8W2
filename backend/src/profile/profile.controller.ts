import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  Param,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) { }

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

  // UPDATED: Accepts the full profile payload and extracts userId
  @Post('submit')
  async submitProfile(@Body() body: Record<string, any>) {
    const { userId, ...profileData } = body;

    if (!userId) {
      throw new BadRequestException('userId is required to submit the profile');
    }

    return this.profileService.submitProfile(userId, profileData);
  }

  @Post(':userId/resume')
  @UseInterceptors(FileInterceptor('file')) // Frontend expects `file` not `resume`
  async uploadResume(
    @Param('userId') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Resume file is required');
    }
    return this.profileService.extractResumeData(userId, file);
  }
}