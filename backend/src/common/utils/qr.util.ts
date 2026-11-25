import * as QRCode from 'qrcode';

export class QrUtils {
  static async generateDataUrl(payload: string): Promise<string> {
    return QRCode.toDataURL(payload);
  }
}
