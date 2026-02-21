import { Module } from '@nestjs/common';
import { AdminHackathonController } from './admin-hackathon.controller';
import { AdminHackathonService } from './admin-hackathon.service';
import { PrismaModule } from '../prisma/prisma.module'; // Adjust path

@Module({
  imports: [PrismaModule],
  controllers: [AdminHackathonController],
  providers: [AdminHackathonService],
})
export class AdminHackathonModule {}
