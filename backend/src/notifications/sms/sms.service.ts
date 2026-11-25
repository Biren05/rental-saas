import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  constructor(private configService: ConfigService) {}

  async sendSms(phone: string, message: string) {
    this.logger.log(`Sending SMS to ${phone}: ${message}`);
    return { success: true, phone, sentAt: new Date() };
  }
}
