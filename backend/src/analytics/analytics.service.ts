import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getVehicleTypeDistribution() {
    const vehicles = await this.prisma.vehicle.groupBy({
      by: ['vehicleType'],
      _count: { id: true },
    });
    return vehicles;
  }

  async getMonthlyRegistrations() {
    return {
      period: '2026-Q3',
      newUsers: 150,
      newVehicles: 320,
    };
  }
}
