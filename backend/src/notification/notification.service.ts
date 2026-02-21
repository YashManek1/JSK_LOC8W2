import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaClient } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import * as webPush from 'web-push';

interface PushSub {
  id: string;
  participantId: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  createdAt: Date;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private readonly db: PrismaClient;

  constructor(private prisma: PrismaService) {
    this.db = prisma as PrismaClient;

    const vapidPublic = process.env.VAPID_PUBLIC_KEY;
    const vapidPrivate = process.env.VAPID_PRIVATE_KEY;
    const vapidEmail = process.env.VAPID_EMAIL || 'mailto:admin@hackathon.dev';

    if (vapidPublic && vapidPrivate) {
      webPush.setVapidDetails(vapidEmail, vapidPublic, vapidPrivate);
      this.logger.log('VAPID keys configured for Web Push');
    } else {
      this.logger.warn(
        'VAPID keys not found in .env — web push will be logged to console only',
      );
    }
  }

  /**
   * Save a browser push subscription for a participant
   */
  async subscribe(
    participantId: string,
    subscription: { endpoint: string; keys: { p256dh: string; auth: string } },
  ): Promise<PushSub> {
    return await this.db.pushSubscription.upsert({
      where: { endpoint: subscription.endpoint },
      update: {
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        participantId,
      },
      create: {
        participantId,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      },
    });
  }

  /**
   * Cron job: Every 5 minutes, check if any hackathon's PS release date has passed
   * and send push notifications to registered participants
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async checkAndDispatchPsNotifications() {
    const now = new Date();

    // Find hackathons where PS release date has passed but notifications haven't been sent
    const hackathons = await this.db.hackathon.findMany({
      where: {
        psReleaseDate: { lte: now },
        psReleasedPushSent: false,
      },
    });

    if (hackathons.length === 0) return;

    for (const hackathon of hackathons) {
      this.logger.log(
        `PS release triggered for hackathon: ${hackathon.name} (${hackathon.id})`,
      );

      // Find all push subscriptions for participants whose team status is REGISTERED
      const subscriptions: PushSub[] = await this.db.pushSubscription.findMany({
        where: {
          participant: {
            team: {
              hackathonId: hackathon.id,
              status: 'REGISTERED',
            },
          },
        },
      });

      this.logger.log(
        `Dispatching PS release push to ${subscriptions.length} subscribers for ${hackathon.name}`,
      );

      const payload = JSON.stringify({
        title: `🚀 Problem Statements Released!`,
        body: `Problem statements for ${hackathon.name} are now live. Check them out!`,
        url: `/hackathon/${hackathon.id}/problems`,
      });

      // Send pushes in parallel, ignore individual failures
      const results = await Promise.allSettled(
        subscriptions.map((sub: PushSub) =>
          this.sendPush(sub.endpoint, sub.p256dh, sub.auth, payload),
        ),
      );

      const succeeded = results.filter((r) => r.status === 'fulfilled').length;
      const failed = results.filter((r) => r.status === 'rejected').length;
      this.logger.log(
        `Push results for ${hackathon.name}: ${succeeded} sent, ${failed} failed`,
      );

      // Mark hackathon as notified
      await this.db.hackathon.update({
        where: { id: hackathon.id },
        data: { psReleasedPushSent: true },
      });
    }
  }

  private async sendPush(
    endpoint: string,
    p256dh: string,
    auth: string,
    payload: string,
  ) {
    if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
      this.logger.log(`[DEV] Would send push to ${endpoint}: ${payload}`);
      return;
    }

    await webPush.sendNotification(
      {
        endpoint,
        keys: { p256dh, auth },
      },
      payload,
    );
  }
}
