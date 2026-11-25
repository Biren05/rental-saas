import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class KhaltiService {
  private readonly logger = new Logger(KhaltiService.name);

  constructor(private configService: ConfigService) {}

  async initiateKhaltiPayment(amount: number, purchaseOrderId: string, purchaseOrderName: string) {
    this.logger.log(`Initiating Khalti payment for order: ${purchaseOrderId}`);
    return {
      pidx: `khalti_pidx_${Date.now()}`,
      payment_url: 'https://test-pay.khalti.com/',
      expires_at: new Date(Date.now() + 1000 * 60 * 15).toISOString(),
    };
  }

  async verifyKhaltiPayment(pidx: string) {
    this.logger.log(`Verifying Khalti payment with pidx: ${pidx}`);
    return { status: 'Completed', pidx };
  }
}
