import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from '../prisma/prisma.module';
import { MailModule } from '../mail/mail.module';
import { NotificationModule } from '../notification/notification.module';
import { CheckInService } from './check-in.service';
import { CheckInController } from './check-in.controller';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    PrismaModule,
    MailModule,
    NotificationModule,
  ],
  controllers: [CheckInController],
  providers: [CheckInService],
  exports: [CheckInService],
})
export class CheckInModule {}
