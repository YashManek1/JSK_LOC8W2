import { Controller, Get, Param, Post } from '@nestjs/common';

@Controller('test')
export class MockDataController {
  @Get('mock-github-data/:teamName')
  getMockGithubData(@Param('teamName') teamName: string) {
    return {
      totalCommits: 342,
      contributors: [
        {
          author: 'alice-coder',
          avatarUrl: 'https://github.com/identicons/alice.png',
          commits: 154,
          additions: 12450,
          deletions: 4320,
        },
        {
          author: 'bob-builder',
          avatarUrl: 'https://github.com/identicons/bob.png',
          commits: 180,
          additions: 18900,
          deletions: 8000,
        },
        {
          author: 'charlie-slacker',
          avatarUrl: 'https://github.com/identicons/charlie.png',
          commits: 8,
          additions: 150,
          deletions: 20,
        },
      ],
      languages: {
        TypeScript: 85000,
        Python: 12000,
        HTML: 5000,
        CSS: 3000,
      },
      timeline: Array.from({ length: 7 * 24 }, (_, i) => {
        const day = Math.floor(i / 24);
        const hour = i % 24;
        // Fake a normal distribution around 2 PM and 11 PM
        const isPeakHour = (hour > 10 && hour < 18) || (hour > 20 && hour < 26);
        const baseCommits = isPeakHour
          ? Math.floor(Math.random() * 10)
          : Math.floor(Math.random() * 2);
        return [day, hour, baseCommits];
      }),
    };
  }

  @Get('mock-ai-features/:teamName')
  getMockAiFeatures(@Param('teamName') teamName: string) {
    return {
      implementedFeatures: [
        'Full JWT Authentication with Passport Strategy',
        'Real-time Socket.io signaling for Video Chat',
        'MongoDB connection pooling',
        'Responsive Tailwind CSS Navigation Bar',
        'PDF parsing utility using pdf-parse',
      ],
      missingPitchedFeatures: [
        'Automated email notifications via SendGrid',
        'Stripe Payment Gateway Integration',
        'Multi-language i18n support',
      ],
      relevanceScore: 78,
    };
  }

  @Post('mock-spark/:userId')
  awardMockSpark(@Param('userId') userId: string) {
    return {
      success: true,
      message: `Spark successfully awarded to user ${userId}!`,
      newTotal: Math.floor(Math.random() * 50) + 1,
    };
  }
}
