import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('api/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('commits/:teamId')
  async getTeamCommits(@Param('teamId') teamId: string) {
    const data = await this.dashboardService.getTeamCommits(teamId);
    if (!data) {
      throw new NotFoundException('Team commits not found');
    }
    return data;
  }

  @Get('ppt-scores/:teamId')
  async getPPTScores(@Param('teamId') teamId: string) {
    const data = await this.dashboardService.getPPTScores(teamId);
    if (!data) {
      throw new NotFoundException('PPT scores not found');
    }
    return data;
  }

  @Get('summary/:teamId')
  async getTeamSummary(@Param('teamId') teamId: string) {
    const commits = await this.dashboardService.getTeamCommits(teamId);
    const scores = await this.dashboardService.getPPTScores(teamId);

    return {
      teamId,
      commits: commits || { total: 0, contributors: [] },
      pptScores: scores || { overall: 0, breakdown: {} },
    };
  }
}
