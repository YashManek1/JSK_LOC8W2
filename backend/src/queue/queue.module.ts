import { Module } from '@nestjs/common';
import { GithubService } from './github/github.service';
import { GeminiService } from './gemini/gemini.service';
import { PptxService } from './pptx/pptx.service';
import { QueueProcessor } from './queue/queue.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [QueueProcessor, GithubService, GeminiService, PptxService],
  exports: [QueueProcessor, GithubService, GeminiService, PptxService],
})
export class QueueModule {}
