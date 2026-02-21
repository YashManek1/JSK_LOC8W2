import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { EvaluateController } from './evaluate.controller';
import { EvaluateService } from './evaluate.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    BullModule.registerQueue({
      name: 'evaluationQueue',
    }),
  ],
  controllers: [EvaluateController],
  providers: [EvaluateService],
})
export class EvaluateModule {}
