import { Module } from '@nestjs/common';
import { GithubAnalyticsService } from './github-analytics.service';
import { GithubAnalyticsController } from './github-analytics.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { QueueModule } from '../queue/queue.module';
import { GroqSecondaryService } from '../queue/groq-secondary/groq-secondary.service';

@Module({
  imports: [PrismaModule, QueueModule],
  controllers: [GithubAnalyticsController],
  providers: [GithubAnalyticsService, GroqSecondaryService],
  exports: [GithubAnalyticsService],
})
export class GithubAnalyticsModule {}
