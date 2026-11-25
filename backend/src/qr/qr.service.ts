import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CryptoUtils } from '../common/utils/crypto.util';
import { QrUtils } from '../common/utils/qr.util';
import { assertVehicleAccess } from '../common/utils/vehicle-access.util';

@Injectable()
export class QrService {
  constructor(private prisma: PrismaService) {}

  async generateQrForVehicle(vehicleId: string, user?: { id: string; role: string }) {
    await assertVehicleAccess(this.prisma, vehicleId, user, true);
    const code = `VI-${CryptoUtils.generateRandomCode(10)}`;
    const qrDataUrl = await QrUtils.generateDataUrl(code);

    const qr = await this.prisma.qrCode.upsert({
      where: { vehicleId },
      update: { code, active: true },
      create: {
        vehicleId,
        code,
        active: true,
      },
    });

    await this.prisma.vehicle.update({
      where: { id: vehicleId },
      data: { qrCodeUrl: qrDataUrl },
    });

    return { ...qr, dataUrl: qrDataUrl };
  }

  async scanQr(code: string) {
    const qr = await this.prisma.qrCode.findUnique({
      where: { code },
      include: {
        vehicle: {
          include: {
            owner: {
              select: {
                fullName: true,
                phone: true,
              },
            },
          },
        },
      },
    });

    if (!qr || !qr.active) {
      throw new NotFoundException('Invalid or inactive QR code');
    }

    return {
      plateNumber: qr.vehicle.plateNumber,
      vehicleType: qr.vehicle.vehicleType,
      brand: qr.vehicle.brand,
      model: qr.vehicle.model,
      color: qr.vehicle.color,
      ownerName: qr.vehicle.owner.fullName,
      ownerContact: qr.vehicle.owner.phone,
    };
  }
}
