import { Module } from '@nestjs/common';
import { AdminHackathonController } from './admin-hackathon.controller';
import { AdminHackathonService } from './admin-hackathon.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [AdminHackathonController],
  providers: [AdminHackathonService],
})
export class AdminHackathonModule {}
