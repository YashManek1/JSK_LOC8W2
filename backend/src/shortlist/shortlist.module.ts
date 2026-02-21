import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ShortlistController } from './shortlist.controller';
import { AdminController } from './admin.controller';
import { ShortlistService } from './shortlist.service';
import { ShortlistProcessor } from './shortlist.processor';
import { GroqService } from './groq.service';
import { ShortlistPptService } from './shortlist-ppt.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule, BullModule.registerQueue({ name: 'shortlistQueue' })],
  controllers: [ShortlistController, AdminController],
  providers: [
    ShortlistService,
    ShortlistProcessor,
    GroqService,
    ShortlistPptService,
  ],
})
export class ShortlistModule {}
