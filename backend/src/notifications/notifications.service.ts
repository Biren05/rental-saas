import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FirebaseService } from './firebase/firebase.service';
import { SmsService } from './sms/sms.service';
import { EmailService } from './email/email.service';
import { NotificationType } from '@prisma/client';

@Injectable()
export class NotificationsService {
  constructor(
    private prisma: PrismaService,
    private firebaseService: FirebaseService,
    private smsService: SmsService,
    private emailService: EmailService,
  ) {}

  async sendNotification(userId: string, type: NotificationType, title: string, message: string) {
    const notification = await this.prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
      },
    });

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (user) {
      if (user.email) await this.emailService.sendEmail(user.email, title, message);
      if (user.phone) await this.smsService.sendSms(user.phone, `${title}: ${message}`);
    }

    return notification;
  }

  async getUserNotifications(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
