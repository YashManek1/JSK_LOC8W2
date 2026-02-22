import { Controller, Get, Param } from '@nestjs/common';
import { HackathonService } from './hackathon.service';

@Controller('api/hackathon')
export class HackathonController {
  constructor(private readonly hackathonService: HackathonService) {}

  @Get(':id/time')
  getHackathonTime(@Param('id') id: string) {
    return this.hackathonService.getHackathonTime(id);
  }
}
