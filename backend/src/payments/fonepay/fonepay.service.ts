import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FonepayService {
  private readonly logger = new Logger(FonepayService.name);

  constructor(private configService: ConfigService) {}

  async generateFonepayQr(amount: number, remarks: string) {
    this.logger.log(`Generating Fonepay dynamic QR for amount: ${amount}`);
    return {
      qrData: `fonepay://pay?merchant=TEST&amount=${amount}&remarks=${encodeURIComponent(remarks)}`,
      traceId: `fp-${Date.now()}`,
    };
  }
}
