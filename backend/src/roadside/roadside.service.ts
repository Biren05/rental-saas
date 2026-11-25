import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { assertVehicleAccess } from '../common/utils/vehicle-access.util';

@Injectable()
export class RoadsideService {
  constructor(private prisma: PrismaService) {}

  async requestAssistance(
    vehicleId: string,
    issueType: string,
    location: string,
    user: { id: string; role: string },
  ) {
    if (!vehicleId || !issueType?.trim() || !location?.trim()) {
      throw new BadRequestException('vehicleId, issueType, and location are required');
    }

    await assertVehicleAccess(this.prisma, vehicleId, user, true);

    return this.prisma.roadsideRequest.create({
      data: {
        vehicleId,
        issueType: issueType.trim(),
        location: location.trim(),
      },
    });
  }

  async getRequests(vehicleId: string, user: { id: string; role: string }) {
    await assertVehicleAccess(this.prisma, vehicleId, user, false);

    return this.prisma.roadsideRequest.findMany({
      where: { vehicleId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
