import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EsewaService } from './esewa/esewa.service';
import { KhaltiService } from './khalti/khalti.service';
import { FonepayService } from './fonepay/fonepay.service';
import { PaymentMethod } from '@prisma/client';

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private esewaService: EsewaService,
    private khaltiService: KhaltiService,
    private fonepayService: FonepayService,
  ) {}

  async initiatePayment(userId: string, amount: number, method: PaymentMethod) {
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new BadRequestException('Payment amount must be greater than zero');
    }

    const payment = await this.prisma.payment.create({
      data: {
        userId,
        amount,
        paymentMethod: method,
        status: 'PENDING',
      },
    });

    if (method === PaymentMethod.ESEWA) {
      const esewaData = await this.esewaService.generatePaymentPayload(amount, payment.id);
      return { paymentId: payment.id, provider: 'ESEWA', payload: esewaData };
    } else if (method === PaymentMethod.KHALTI) {
      const khaltiData = await this.khaltiService.initiateKhaltiPayment(
        amount,
        payment.id,
        'Vehicle Service Fee',
      );
      return { paymentId: payment.id, provider: 'KHALTI', payload: khaltiData };
    } else if (method === PaymentMethod.FONEPAY) {
      const fonepayData = await this.fonepayService.generateFonepayQr(
        amount,
        `Vehicle Payment #${payment.id}`,
      );
      return { paymentId: payment.id, provider: 'FONEPAY', payload: fonepayData };
    }

    throw new BadRequestException('Unsupported payment gateway');
  }

  async getUserPayments(userId: string) {
    return this.prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
