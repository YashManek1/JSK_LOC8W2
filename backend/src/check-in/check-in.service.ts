import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { NotificationService } from '../notification/notification.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class CheckInService {
  private readonly logger = new Logger(CheckInService.name);

  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
    private notificationService: NotificationService,
    @InjectQueue('mailQueue') private mailQueue: Queue,
  ) {}

  // ─── Cron: Generate check-in QRs 1 day before hackathon ───
  @Cron(CronExpression.EVERY_30_MINUTES)
  async cronGenerateCheckInQRs() {
    const now = new Date();
    const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // Find hackathons starting within the next 24 hours where QRs haven't been generated
    const hackathons = await this.prisma.hackathon.findMany({
      where: {
        startDate: { lte: oneDayFromNow },
        qrGenerated: false,
        status: 'Active',
      },
    });

    for (const hackathon of hackathons) {
      this.logger.log(`Generating check-in QRs for: ${hackathon.name}`);
      await this.generateCheckInQRs(hackathon.id);
    }
  }

  // ─── Cron: Generate meal QRs 1 hour before meal time ───
  @Cron(CronExpression.EVERY_10_MINUTES)
  async cronGenerateMealQRs() {
    const now = new Date();

    const hackathons = await this.prisma.hackathon.findMany({
      where: {
        startDate: { lte: now },
        endDate: { gte: now },
        status: 'Active',
      },
    });

    for (const hackathon of hackathons) {
      const mealTimes = hackathon.mealTimes as Record<string, string> | null;
      if (!mealTimes) continue;

      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      for (const [mealType, timeStr] of Object.entries(mealTimes)) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        const mealDateTime = new Date(today);
        mealDateTime.setHours(hours, minutes, 0, 0);

        // Generate if within 1 hour before meal time
        const oneHourBefore = new Date(mealDateTime.getTime() - 60 * 60 * 1000);
        if (now >= oneHourBefore && now <= mealDateTime) {
          await this.generateMealQRs(
            hackathon.id,
            mealType.toUpperCase(),
            mealDateTime,
          );
        }
      }
    }
  }

  // ─── Generate check-in QRs for all registered participants ───
  async generateCheckInQRs(hackathonId: string) {
    const hackathon = await this.prisma.hackathon.findUnique({
      where: { id: hackathonId },
      include: {
        teams: {
          where: { status: 'REGISTERED' },
          include: { participants: true },
        },
      },
    });

    if (!hackathon) return;

    const participants = hackathon.teams.flatMap((t) => t.participants);
    let created = 0;

    for (const participant of participants) {
      try {
        await this.prisma.checkInQR.create({
          data: {
            participantId: participant.id,
            hackathonId,
          },
        });
        created++;
      } catch {
        // Already exists (unique constraint) — skip
      }
    }

    // Send emails
    const qrs = await this.prisma.checkInQR.findMany({
      where: { hackathonId, emailSent: false },
      include: { participant: true },
    });

    for (const qr of qrs) {
      await this.mailQueue.add(
        'checkin_qr',
        {
          email: qr.participant.email,
          participantName: qr.participant.fullName || 'Participant',
          hackathonName: hackathon.name,
          qrToken: qr.qrToken,
        },
        { attempts: 3, backoff: { type: 'exponential', delay: 5000 } },
      );

      await this.prisma.checkInQR.update({
        where: { id: qr.id },
        data: { emailSent: true },
      });
    }

    // Mark hackathon as QR-generated
    await this.prisma.hackathon.update({
      where: { id: hackathonId },
      data: { qrGenerated: true },
    });

    this.logger.log(
      `Created ${created} check-in QRs for ${hackathon.name}, emailed ${qrs.length}`,
    );
  }

  // ─── Generate meal QRs for checked-in participants ───
  async generateMealQRs(hackathonId: string, mealType: string, mealDate: Date) {
    // Only generate for participants who are already checked in
    const checkedIn = await this.prisma.checkInQR.findMany({
      where: { hackathonId, isCheckedIn: true },
    });

    let created = 0;
    for (const qr of checkedIn) {
      try {
        await this.prisma.mealQR.create({
          data: {
            participantId: qr.participantId,
            hackathonId,
            mealType,
            mealDate,
          },
        });
        created++;
      } catch {
        // Already exists — skip
      }
    }

    if (created > 0) {
      this.logger.log(
        `Created ${created} ${mealType} meal QRs for hackathon ${hackathonId}`,
      );
    }
  }

  // ─── Admin: Scan check-in QR ───
  async scanCheckInQR(qrToken: string) {
    const qr = await this.prisma.checkInQR.findUnique({
      where: { qrToken },
      include: {
        participant: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            college: true,
            liveSelfieUrl: true,
            faceEmbedding: true,
          },
        },
        hackathon: { select: { id: true, name: true } },
      },
    });

    if (!qr) {
      throw new NotFoundException('Invalid QR code');
    }

    // Mark as checked in if not already
    if (!qr.isCheckedIn) {
      await this.prisma.checkInQR.update({
        where: { id: qr.id },
        data: { isCheckedIn: true, checkedInAt: new Date() },
      });
    }

    return {
      isCheckedIn: true,
      wasAlreadyCheckedIn: qr.isCheckedIn,
      checkedInAt: qr.isCheckedIn ? qr.checkedInAt : new Date(),
      participant: qr.participant,
      hackathon: qr.hackathon,
    };
  }

  // ─── Admin: Verify face against stored embedding ───
  async verifyFace(participantId: string, selfieFile: Express.Multer.File) {
    const participant = await this.prisma.participant.findUnique({
      where: { id: participantId },
      select: { liveSelfieUrl: true, faceEmbedding: true, fullName: true },
    });

    if (!participant) {
      throw new NotFoundException('Participant not found');
    }

    if (!participant.liveSelfieUrl) {
      throw new BadRequestException(
        'Participant has no selfie on file for verification',
      );
    }

    // Call the identity service
    const identityServiceUrl =
      process.env.IDENTITY_SERVICE_URL || 'http://127.0.0.1:8000';

    // Download the stored selfie
    const storedSelfieResponse = await fetch(participant.liveSelfieUrl);
    if (!storedSelfieResponse.ok) {
      throw new BadRequestException('Could not fetch stored selfie');
    }
    const storedSelfieBlob = await storedSelfieResponse.blob();

    // Build multipart form
    const formData = new FormData();
    formData.append(
      'selfie',
      new Blob([new Uint8Array(selfieFile.buffer)], {
        type: selfieFile.mimetype,
      }),
      selfieFile.originalname,
    );
    formData.append('document', storedSelfieBlob, 'stored_selfie.jpg');

    let verifyResponse: Response;
    try {
      verifyResponse = await fetch(`${identityServiceUrl}/verify/face`, {
        method: 'POST',
        body: formData,
      });
    } catch {
      throw new BadRequestException('Identity service is unavailable');
    }

    if (!verifyResponse.ok) {
      const detail = await verifyResponse.text();
      throw new BadRequestException(`Face verification failed: ${detail}`);
    }

    const result = (await verifyResponse.json()) as {
      isMatch: boolean;
      distance: number;
      model: string;
    };

    return {
      participantName: participant.fullName,
      isMatch: result.isMatch,
      distance: result.distance,
      model: result.model,
    };
  }

  // ─── Admin: Scan one-time meal QR ───
  async scanMealQR(qrToken: string) {
    const qr = await this.prisma.mealQR.findUnique({
      where: { qrToken },
      include: {
        participant: {
          select: { id: true, fullName: true, email: true },
        },
      },
    });

    if (!qr) {
      throw new NotFoundException('Invalid meal QR code');
    }

    if (qr.isScanned) {
      throw new ForbiddenException(
        `This ${qr.mealType} QR has already been used at ${qr.scannedAt?.toISOString()}`,
      );
    }

    // Mark as scanned (one-time use)
    await this.prisma.mealQR.update({
      where: { id: qr.id },
      data: { isScanned: true, scannedAt: new Date() },
    });

    return {
      message: `${qr.mealType} meal claimed successfully`,
      mealType: qr.mealType,
      participant: qr.participant,
      scannedAt: new Date(),
    };
  }

  // ─── Student: Get my check-in QR ───
  async getMyCheckInQR(participantId: string, hackathonId: string) {
    const qr = await this.prisma.checkInQR.findUnique({
      where: {
        participantId_hackathonId: { participantId, hackathonId },
      },
    });

    if (!qr) {
      throw new NotFoundException('No check-in QR found for this hackathon');
    }

    return {
      qrToken: qr.qrToken,
      isCheckedIn: qr.isCheckedIn,
      checkedInAt: qr.checkedInAt,
    };
  }

  // ─── Student: Get my meal QRs (only within 1hr window) ───
  async getMyMealQRs(participantId: string, hackathonId: string) {
    const hackathon = await this.prisma.hackathon.findUnique({
      where: { id: hackathonId },
    });

    if (!hackathon || !hackathon.mealTimes) {
      return [];
    }

    const now = new Date();
    const mealTimes = hackathon.mealTimes as Record<string, string>;
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Determine which meals are within the 1-hour visibility window
    const visibleMealTypes: string[] = [];
    for (const [mealType, timeStr] of Object.entries(mealTimes)) {
      const [hours, minutes] = timeStr.split(':').map(Number);
      const mealDateTime = new Date(today);
      mealDateTime.setHours(hours, minutes, 0, 0);

      const oneHourBefore = new Date(mealDateTime.getTime() - 60 * 60 * 1000);
      if (now >= oneHourBefore && now <= mealDateTime) {
        visibleMealTypes.push(mealType.toUpperCase());
      }
    }

    if (visibleMealTypes.length === 0) {
      return [];
    }

    const qrs = await this.prisma.mealQR.findMany({
      where: {
        participantId,
        hackathonId,
        mealType: { in: visibleMealTypes },
        mealDate: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
      },
    });

    return qrs.map((qr) => ({
      qrToken: qr.qrToken,
      mealType: qr.mealType,
      isScanned: qr.isScanned,
      scannedAt: qr.scannedAt,
    }));
  }
}
