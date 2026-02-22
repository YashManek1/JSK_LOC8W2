import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
  Param,
} from '@nestjs/common';
import { AdminHackathonService } from './admin-hackathon.service';
import { CreateHackathonDto } from './dto/create-hackathon.dto';
import { AuthGuard } from '@nestjs/passport'; // Or your custom JwtAuthGuard

interface RequestWithUser {
  user: { userId: string; email: string };
}

@Controller('admin/hackathons')
@UseGuards(AuthGuard('jwt')) // Ensure user is authenticated
export class AdminHackathonController {
  constructor(private readonly adminHackathonService: AdminHackathonService) {}

  @Post()
  async createHackathon(
    @Req() req: RequestWithUser,
    @Body() dto: CreateHackathonDto,
  ) {
    // req.user.id comes from your JWT payload
    return this.adminHackathonService.createHackathon(req.user.userId, dto);
  }

  @Get()
  async getMyHackathons(@Req() req: RequestWithUser) {
    return this.adminHackathonService.getMyHackathons(req.user.userId);
  }

  @Get('stats')
  async getStats(@Req() req: RequestWithUser) {
    return this.adminHackathonService.getStats(req.user.userId);
  }

  @Post(':id/allocate-ps')
  async allocatePS(
    @Req() req: RequestWithUser,
    @Param('id') hackathonId: string,
    @Body()
    dto: {
      maxTeamsPerDomain?: number;
      minTeamsPerDomain?: number;
      dynamicCapacities?: Record<string, number>;
    },
  ) {
    return this.adminHackathonService.allocateProblemStatements(
      req.user.userId,
      hackathonId,
      dto,
    );
  }
}
