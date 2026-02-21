import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Put,
  Param,
  Delete,
  Get,
} from '@nestjs/common';
import { RegistrationService } from './registration.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateTeamDto } from './dto/create-team.dto';
import { JoinTeamDto } from './dto/join-team.dto';
import { RegisterSoloDto } from './dto/register-solo.dto';
import { Request } from 'express';

interface RequestWithUser extends Request {
  user: {
    userId: string;
    email: string;
  };
}

@Controller('registration')
@UseGuards(AuthGuard('jwt'))
export class RegistrationController {
  constructor(private readonly registrationService: RegistrationService) {}

  @Post('team')
  async createTeam(@Req() req: RequestWithUser, @Body() dto: CreateTeamDto) {
    const userId = req.user.userId;
    const email = req.user.email;
    return this.registrationService.createTeam(userId, email, dto);
  }

  @Post('join')
  async joinTeam(@Req() req: RequestWithUser, @Body() dto: JoinTeamDto) {
    const userId = req.user.userId;
    const email = req.user.email;
    return this.registrationService.joinTeam(userId, email, dto);
  }

  @Post('solo')
  async registerSolo(
    @Req() req: RequestWithUser,
    @Body() dto: RegisterSoloDto,
  ) {
    const userId = req.user.userId;
    return this.registrationService.registerSolo(userId, dto);
  }

  @Get('community/:hackathonId')
  async getCommunity(@Param('hackathonId') hackathonId: string) {
    return this.registrationService.getCommunity(hackathonId);
  }

  @Put('team/:teamId')
  async updateTeam(
    @Req() req: RequestWithUser,
    @Param('teamId') teamId: string,
    @Body('teamName') teamName: string,
  ) {
    const userId = req.user.userId;
    return this.registrationService.updateTeam(userId, teamId, teamName);
  }

  @Delete('team/:teamId')
  async deleteTeam(
    @Req() req: RequestWithUser,
    @Param('teamId') teamId: string,
  ) {
    const userId = req.user.userId;
    return this.registrationService.deleteTeam(userId, teamId);
  }
}
