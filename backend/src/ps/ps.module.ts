import { Module } from '@nestjs/common';
import { PsController } from './ps.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PsController],
})
export class PsModule {}
