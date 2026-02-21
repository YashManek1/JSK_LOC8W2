import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { GithubAnalyticsService } from './github-analytics.service';

@Controller('github')
export class GithubAnalyticsController {
    constructor(private readonly githubService: GithubAnalyticsService) { }

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
}
