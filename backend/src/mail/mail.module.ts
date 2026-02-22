import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { MailService } from './mail.service';
import { MailProcessor } from '../queue/mail/mail.processor';

@Module({
  imports: [BullModule.registerQueue({ name: 'mailQueue' })],
  providers: [MailService, MailProcessor],
  exports: [MailService, BullModule],
})
export class MailModule {}
