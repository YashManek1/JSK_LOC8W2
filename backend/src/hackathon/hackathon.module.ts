import { Module } from '@nestjs/common';
import { HackathonController } from './hackathon.controller';
import { HackathonService } from './hackathon.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [HackathonController],
  providers: [HackathonService],
})
export class HackathonModule {}
