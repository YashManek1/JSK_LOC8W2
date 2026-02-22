import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { MailService } from '../../mail/mail.service';

@Processor('mailQueue')
export class MailProcessor extends WorkerHost {
  private readonly logger = new Logger(MailProcessor.name);

  constructor(private readonly mailService: MailService) {
    super();
  }

  async process(job: Job): Promise<any> {
    this.logger.debug(`Processing mail job ${job.id} of type ${job.name}`);

    try {
      switch (job.name) {
        case 'registration_complete': {
          const d = job.data as Record<string, string>;
          await this.mailService.sendTeamRegistrationComplete(
            d.email,
            d.leaderName,
            d.teamName,
            d.hackathonName,
          );
          break;
        }

        case 'shortlist_congrats': {
          const d = job.data as Record<string, string>;
          // We will need to add this method to MailService
          await this.mailService.sendShortlistCongrats(
            d.email,
            d.leaderName,
            d.teamName,
            d.hackathonName,
          );
          break;
        }

        case 'checkin_qr': {
          const d = job.data as Record<string, string>;
          await this.mailService.sendCheckInQR(
            d.email,
            d.participantName,
            d.hackathonName,
            d.qrToken,
          );
          break;
        }

        default:
          this.logger.warn(`Unknown mail job name: ${job.name}`);
      }
    } catch (error) {
      this.logger.error(
        `Failed to process mail job ${job.id}: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }
}
