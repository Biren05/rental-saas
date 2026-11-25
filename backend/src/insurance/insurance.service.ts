import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { assertVehicleAccess } from '../common/utils/vehicle-access.util';

@Injectable()
export class InsuranceService {
  constructor(private prisma: PrismaService) {}

  async createPolicy(
    vehicleId: string,
    providerName: string,
    policyNumber: string,
    startDate: string,
    endDate: string,
    premiumAmount: number,
    user?: { id: string; role: string },
  ) {
    await assertVehicleAccess(this.prisma, vehicleId, user, true);
    return this.prisma.insurancePolicy.create({
      data: {
        vehicleId,
        providerName,
        policyNumber,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        premiumAmount,
      },
    });
  }

  async getPolicyByVehicle(vehicleId: string, user?: { id: string; role: string }) {
    await assertVehicleAccess(this.prisma, vehicleId, user, false);
    return this.prisma.insurancePolicy.findFirst({
      where: { vehicleId },
      orderBy: { endDate: 'desc' },
    });
  }
}
