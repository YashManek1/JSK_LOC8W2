import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });
      this.logger.log('SMTP transporter configured');
    } else {
      this.logger.warn(
        'SMTP credentials not found in .env — emails will be logged to console only',
      );
      // Fallback: log emails to console (dev mode)
      this.transporter = nodemailer.createTransport({
        jsonTransport: true,
      });
    }
  }

  async sendTeamRegistrationSuccess(
    leaderEmail: string,
    teamName: string,
    hackathonName: string,
  ): Promise<void> {
    const subject = `🎉 Team "${teamName}" is now REGISTERED for ${hackathonName}!`;

    const html = `
      <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <h1 style="color: #6c63ff;">Congratulations! 🚀</h1>
        <p>Your team <strong>${teamName}</strong> has met the minimum team size requirement and is now officially <strong>REGISTERED</strong> for <strong>${hackathonName}</strong>.</p>
        <p>Your teammates can still join using the same invite code until the team is full.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
        <p style="color: #888; font-size: 12px;">This is an automated email from the Hackathon Platform.</p>
      </div>
    `;

    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const info: { messageId?: string } = await this.transporter.sendMail({
        from:
          process.env.SMTP_FROM ||
          '"Hackathon Platform" <noreply@hackathon.dev>',
        to: leaderEmail,
        subject,
        html,
      });

      if (process.env.SMTP_HOST) {
        this.logger.log(`Registration email sent to ${leaderEmail}`);
      } else {
        this.logger.log(
          `[DEV] Email would be sent to ${leaderEmail}: ${String(info.messageId || subject)}`,
        );
      }
    } catch (error) {
      this.logger.error(`Failed to send email to ${leaderEmail}`, error);
    }
  }

  async sendCheckInQR(
    email: string,
    participantName: string,
    hackathonName: string,
    qrToken: string,
  ): Promise<void> {
    const subject = `🎫 Your Check-In QR for ${hackathonName}`;

    const html = `
      <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <h1 style="color: #6c63ff;">Hey ${participantName}! 🎉</h1>
        <p>Your hackathon is starting soon! Here's your unique check-in code for <strong>${hackathonName}</strong>:</p>
        <div style="background: #f4f4f8; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
          <p style="font-size: 14px; color: #666; margin: 0 0 8px;">Your Check-In Token</p>
          <p style="font-size: 28px; font-weight: bold; color: #6c63ff; letter-spacing: 4px; margin: 0;">${qrToken}</p>
        </div>
        <p>Show this QR code or token at the venue registration desk. An admin will scan it to check you in.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
        <p style="color: #888; font-size: 12px;">This is an automated email from the Hackathon Platform.</p>
      </div>
    `;

    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const info: { messageId?: string } = await this.transporter.sendMail({
        from:
          process.env.SMTP_FROM ||
          '"Hackathon Platform" <noreply@hackathon.dev>',
        to: email,
        subject,
        html,
      });

      if (process.env.SMTP_HOST) {
        this.logger.log(`Check-in QR email sent to ${email}`);
      } else {
        this.logger.log(
          `[DEV] QR email would be sent to ${email}: ${String(info.messageId || subject)}`,
        );
      }
    } catch (error) {
      this.logger.error(`Failed to send QR email to ${email}`, error);
    }
  }

  async sendTeamRegistrationComplete(
    to: string,
    leaderName: string,
    teamName: string,
    hackathonName: string,
  ) {
    const subject = `Team Registration Complete - ${hackathonName}`;
    const html = `
      <h2>Hi ${leaderName},</h2>
      <p>Your team <strong>${teamName}</strong> has been successfully registered for <strong>${hackathonName}</strong>!</p>
      <p>Your registration is now complete and confirmed. We will notify you when the problem statements are released.</p>
      <br/>
      <p>Good luck!</p>
    `;

    return this.sendMail(to, subject, html);
  }

  private async sendMail(to: string, subject: string, html: string) {
    try {
      if (process.env.SMTP_HOST) {
        await this.transporter.sendMail({
          from:
            process.env.SMTP_FROM ||
            '"Hackathon Platform" <noreply@hackathon.dev>',
          to,
          subject,
          html,
        });
        this.logger.log(`Email sent to ${to}: ${subject}`);
      } else {
        this.logger.log(`[DEV] Email would be sent to ${to}: ${subject}`);
      }
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}: ${subject}`, error);
    }
  }

  async sendShortlistCongrats(
    to: string,
    participantName: string,
    teamName: string,
    hackathonName: string,
  ) {
    const subject = `Congratulations! Your team is shortlisted for ${hackathonName} 🎉`;
    const html = `
      <h2>Hi ${participantName},</h2>
      <p>Great news! Your team <strong>${teamName}</strong> has been shortlisted for the next round of <strong>${hackathonName}</strong>!</p>
      <p>Please check your dashboard for further instructions and make sure you are ready for the upcoming rounds.</p>
      <br/>
      <p>Congratulations and best of luck!</p>
    `;

    return this.sendMail(to, subject, html);
  }
}
