import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FirebaseService {
  private readonly logger = new Logger(FirebaseService.name);

  constructor(private configService: ConfigService) {}

  async sendPushNotification(token: string, title: string, body: string) {
    this.logger.log(`Sending FCM push notification to ${token}: [${title}] ${body}`);
    return { success: true, messageId: `fcm-${Date.now()}` };
  }
}
