import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BullModule } from '@nestjs/bullmq';
import { EvaluateModule } from './evaluate/evaluate.module';
import { QueueModule } from './queue/queue.module';
import { VoiceChatModule } from './voice-chat/voice-chat.module';
import { ShortlistModule } from './shortlist/shortlist.module';
import { GithubAnalyticsModule } from './github-analytics/github-analytics.module';
import { MockDataController } from './test/mock-data.controller';
import * as dotenv from 'dotenv';

dotenv.config();

const redisUrl = process.env.REDIS_URL ? new URL(process.env.REDIS_URL) : null;

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: redisUrl?.hostname || process.env.REDIS_HOST || '127.0.0.1',
        port: redisUrl?.port
          ? parseInt(redisUrl.port, 10)
          : parseInt(process.env.REDIS_PORT || '6379', 10),
        username: redisUrl?.username || undefined,
        password: redisUrl?.password || undefined,
      },
    }),
    EvaluateModule,
    QueueModule,
    VoiceChatModule,
    ShortlistModule,
    GithubAnalyticsModule,
  ],
  controllers: [AppController, MockDataController],
  providers: [AppService],
})
export class AppModule { }
