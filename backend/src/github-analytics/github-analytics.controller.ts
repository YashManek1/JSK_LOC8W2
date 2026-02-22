/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { GithubAnalyticsService } from './github-analytics.service';

@Controller('github')
export class GithubAnalyticsController {
  constructor(private readonly githubService: GithubAnalyticsService) {}

  /**
   * Triggers a fresh synchronization of GitHub stats for a shortlist entry.
   * Useful when an Admin wants to force-refresh the dashboard.
   */
  @Post('sync/:shortlistId')
  async forceSync(
    @Param('shortlistId') shortlistId: string,
    @Body('githubUrl') githubUrl?: string,
  ) {
    return this.githubService.syncRepoStats(
      decodeURIComponent(shortlistId),
      githubUrl,
    );
  }

  /**
   * Retrieves the cached GitHub statistics for a given shortlist entry.
   * This is what the Frontend Gamified Dashboard and Admin Overwatch use.
   */
  @Get('stats/:shortlistId')
  async getStats(@Param('shortlistId') shortlistId: string) {
    return this.githubService.getRepoStats(decodeURIComponent(shortlistId));
  }

  /**
   * Proxies commits and stats mapped to the requested team name.
   */
  @Get('commits/:teamName')
  async getCommitsByTeam(@Param('teamName') teamName: string) {
    // Just map it using the backend GithubService logic
    // Frontend expects commits array and total count
    const stats = await this.githubService.getRepoStats(
      decodeURIComponent(teamName),
    );
    if (!stats) return { total: 0, contributors: [] };

    // Convert to what DashboardService/frontend expects
    return {
      total: stats.totalCommits || 0,
      contributors: stats.contributors || [],
      lastUpdated: stats.lastUpdated,
      teamName,
    };
  }
}
