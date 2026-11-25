import * as crypto from 'crypto';

export class CryptoUtils {
  static generateSignature(data: string, secret: string): string {
    return crypto.createHmac('sha256', secret).update(data).digest('base64');
  }

  static generateRandomCode(length: number = 8): string {
    return crypto.randomBytes(length).toString('hex').slice(0, length).toUpperCase();
  }
}
