import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ParkVehicleDto } from './dto/park-vehicle.dto';
import { assertVehicleAccess } from '../common/utils/vehicle-access.util';

@Injectable()
export class ParkingService {
  constructor(private prisma: PrismaService) {}

  async parkVehicle(dto: ParkVehicleDto, user: { id: string; role: string }) {
    await assertVehicleAccess(this.prisma, dto.vehicleId, user, true);

    return this.prisma.parkingLog.create({
      data: {
        vehicleId: dto.vehicleId,
        spotName: dto.spotName,
        entryTime: new Date(),
      },
    });
  }

  async exitParking(parkingLogId: string, user: { id: string; role: string }) {
    const log = await this.prisma.parkingLog.findUnique({
      where: { id: parkingLogId },
    });
    if (!log) {
      throw new NotFoundException('Parking log not found');
    }

    await assertVehicleAccess(this.prisma, log.vehicleId, user, true);

    if (log.exitTime) {
      throw new BadRequestException('Vehicle already exited');
    }

    const exitTime = new Date();
    const durationHours = Math.max(1, Math.ceil((exitTime.getTime() - log.entryTime.getTime()) / (1000 * 60 * 60)));
    const feeAmount = durationHours * 50; // NRS 50 per hour

    return this.prisma.parkingLog.update({
      where: { id: parkingLogId },
      data: {
        exitTime,
        feeAmount,
      },
    });
  }

  async getVehicleHistory(vehicleId: string, user: { id: string; role: string }) {
    await assertVehicleAccess(this.prisma, vehicleId, user, false);

    return this.prisma.parkingLog.findMany({
      where: { vehicleId },
      orderBy: { entryTime: 'desc' },
    });
  }
}
