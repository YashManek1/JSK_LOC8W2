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

  @Get(':id')
  async getProfile(@Param('id') id: string) {
    return this.profileService.getProfile(id);
  }

  @Put(':id')
  async updateProfile(
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
  ) {
    return this.profileService.updateProfile(id, body);
  }

  @Post(':id/resume')
  @UseInterceptors(FileInterceptor('resume'))
  async uploadResume(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new Error('Resume file is required');
    }
    return this.profileService.extractResumeData(id, file);
  }
}
