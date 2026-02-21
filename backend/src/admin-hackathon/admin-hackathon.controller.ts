import { Controller, Post, Get, Body, UseGuards, Req } from '@nestjs/common';
import { AdminHackathonService } from './admin-hackathon.service';
import { CreateHackathonDto } from './dto/create-hackathon.dto';
import { AuthGuard } from '@nestjs/passport'; // Or your custom JwtAuthGuard

@Controller('admin/hackathons')
@UseGuards(AuthGuard('jwt')) // Ensure user is authenticated
export class AdminHackathonController {
  constructor(private readonly adminHackathonService: AdminHackathonService) {}

  @Post()
  async createHackathon(@Req() req, @Body() dto: CreateHackathonDto) {
    // req.user.id comes from your JWT payload
    return this.adminHackathonService.createHackathon(req.user.id, dto);
  }

  @Get()
  async getMyHackathons(@Req() req) {
    return this.adminHackathonService.getMyHackathons(req.user.id);
  }
}
