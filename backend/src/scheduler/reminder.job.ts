import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../notifications/email/email.service';

@Injectable()
export class ReminderJob {
  private readonly logger = new Logger(ReminderJob.name);

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async handleDailyReminders() {
    this.logger.log('Executing daily subscription & trial expiry reminder checks...');
    try {
      const result = await this.checkExpiringSubscriptions();
      this.logger.log(
        `Daily expiry check completed: ${result.notificationsSent} reminder notices dispatched out of ${result.totalExpiring} expiring subscriptions.`,
      );
    } catch (err: any) {
      this.logger.error(`Failed executing daily expiry reminder check: ${err.message}`, err.stack);
    }
  }

  /**
   * Scans all tenant subscriptions and identifies any that expire within 2 days (48 hours)
   * or have already expired. Dispatches warning emails and records in-app notifications.
   */
  async checkExpiringSubscriptions() {
    const now = new Date();
    // 2 days (48 hours) threshold
    const twoDaysFromNow = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);

    const subscriptions = await this.prisma.tenantSubscription.findMany({
      where: {
        status: { in: ['TRIALING', 'ACTIVE', 'PAST_DUE'] },
        endDate: { lte: twoDaysFromNow },
      },
      include: {
        plan: true,
        tenant: {
          include: {
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    fullName: true,
                    email: true,
                    phone: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const results: Array<{
      tenantId: string;
      tenantName: string;
      daysLeft: number;
      emailSent: boolean;
      recipient: string;
      reason?: string;
    }> = [];

    let notificationsSent = 0;

    for (const sub of subscriptions) {
      const diffMs = sub.endDate.getTime() - now.getTime();
      const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      const isTrial = sub.plan.price === 0 || sub.status === 'TRIALING';

      // Identify owner member or first member with valid user account
      const ownerMember =
        sub.tenant.members.find((m) => m.role === 'OWNER') ||
        sub.tenant.members[0];

      const recipientEmail =
        ownerMember?.user?.email || sub.tenant.email || '';
      const ownerName =
        ownerMember?.user?.fullName || sub.tenant.name || 'Valued Partner';
      const ownerUserId = ownerMember?.user?.id;

      if (!recipientEmail) {
        results.push({
          tenantId: sub.tenantId,
          tenantName: sub.tenant.name,
          daysLeft,
          emailSent: false,
          recipient: '',
          reason: 'No valid recipient email found on tenant or members',
        });
        continue;
      }

      // Throttle: avoid sending duplicate emails within 20 hours to the same user
      if (ownerUserId) {
        const recentNotice = await this.prisma.notification.findFirst({
          where: {
            userId: ownerUserId,
            type: 'EXPIRY_REMINDER',
            createdAt: { gte: new Date(now.getTime() - 20 * 60 * 60 * 1000) },
          },
        });

        if (recentNotice) {
          results.push({
            tenantId: sub.tenantId,
            tenantName: sub.tenant.name,
            daysLeft,
            emailSent: false,
            recipient: recipientEmail,
            reason: 'Already notified within the last 20 hours',
          });
          continue;
        }
      }

      // Dispatch automated notice via EmailService
      try {
        await this.emailService.sendSubscriptionExpiryNotice(
          recipientEmail,
          ownerName,
          sub.tenant.name,
          daysLeft,
          sub.endDate,
          isTrial,
          sub.plan.name,
        );

        // Record in database notifications table if user exists
        if (ownerUserId) {
          await this.prisma.notification.create({
            data: {
              userId: ownerUserId,
              type: 'EXPIRY_REMINDER',
              title:
                daysLeft <= 0
                  ? 'AutoRent Package Expired'
                  : `AutoRent Package Expires in ${daysLeft} Day${daysLeft === 1 ? '' : 's'}`,
              message:
                daysLeft <= 0
                  ? `Your ${sub.plan.name} package for ${sub.tenant.name} has expired. Please renew your plan to prevent disruption.`
                  : `Your ${sub.plan.name} package for ${sub.tenant.name} will expire in ${daysLeft} day(s) on ${sub.endDate.toLocaleDateString()}. Please renew your subscription.`,
            },
          });
        }

        // If expired and was trialing, update status to EXPIRED
        if (daysLeft <= 0 && sub.status === 'TRIALING') {
          await this.prisma.tenantSubscription.update({
            where: { id: sub.id },
            data: { status: 'EXPIRED' },
          });
        }

        notificationsSent++;
        results.push({
          tenantId: sub.tenantId,
          tenantName: sub.tenant.name,
          daysLeft,
          emailSent: true,
          recipient: recipientEmail,
        });
      } catch (err: any) {
        this.logger.error(
          `Failed sending expiry reminder to ${recipientEmail} for tenant ${sub.tenant.name}: ${err.message}`,
        );
        results.push({
          tenantId: sub.tenantId,
          tenantName: sub.tenant.name,
          daysLeft,
          emailSent: false,
          recipient: recipientEmail,
          reason: err.message,
        });
      }
    }

    return {
      totalExpiring: subscriptions.length,
      notificationsSent,
      results,
    };
  }
}
