import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TraccarProvider } from './providers/traccar.provider';
import { assertVehicleAccess } from '../common/utils/vehicle-access.util';

@Injectable()
export class GpsService {
  constructor(
    private prisma: PrismaService,
    private traccarProvider: TraccarProvider,
  ) {}

  async recordTelemetry(
    vehicleId: string,
    latitude: number,
    longitude: number,
    speed?: number,
    user?: { id: string; role: string },
  ) {
    await assertVehicleAccess(this.prisma, vehicleId, user, true);
    return this.prisma.gpsLog.create({
      data: {
        vehicleId,
        latitude,
        longitude,
        speed: speed || 0,
      },
    });
  }

  async getLatestLocation(vehicleId: string, user?: { id: string; role: string }) {
    await assertVehicleAccess(this.prisma, vehicleId, user, false);
    return this.prisma.gpsLog.findFirst({
      where: { vehicleId },
      orderBy: { recordedAt: 'desc' },
    });
  }
}
