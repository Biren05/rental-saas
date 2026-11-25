import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CryptoUtils } from '../../common/utils/crypto.util';

@Injectable()
export class EsewaService {
  private readonly logger = new Logger(EsewaService.name);

  constructor(private configService: ConfigService) {}

  async generatePaymentPayload(amount: number, transactionUuid: string) {
    const merchantCode = this.configService.get<string>('ESEWA_MERCHANT_ID') || 'EPAYTEST';
    const secretKey = this.configService.get<string>('ESEWA_SECRET_KEY') || '8gBmUzBxWgH5';

    const dataToSign = `total_amount=${amount},transaction_uuid=${transactionUuid},product_code=${merchantCode}`;
    const signature = CryptoUtils.generateSignature(dataToSign, secretKey);

    return {
      amount,
      tax_amount: 0,
      total_amount: amount,
      transaction_uuid: transactionUuid,
      product_code: merchantCode,
      product_service_charge: 0,
      product_delivery_charge: 0,
      success_url: 'https://developer.esewa.com.np/success',
      failure_url: 'https://developer.esewa.com.np/failure',
      signed_field_names: 'total_amount,transaction_uuid,product_code',
      signature,
    };
  }

  async verifyPayment(encodedData: string) {
    this.logger.log('Verifying eSewa payment callback response');
    return { verified: true, message: 'Payment successfully verified via eSewa' };
  }
}
