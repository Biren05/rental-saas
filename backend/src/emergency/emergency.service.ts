import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmergencyDto } from './dto/create-emergency.dto';
import { assertVehicleAccess } from '../common/utils/vehicle-access.util';

@Injectable()
export class EmergencyService {
  constructor(private prisma: PrismaService) {}

  async triggerSos(user: { id: string; role: string }, dto: CreateEmergencyDto) {
    await assertVehicleAccess(this.prisma, dto.vehicleId, user, false);

    return this.prisma.notification.create({
      data: {
        userId: user.id,
        type: 'EMERGENCY_SOS',
        title: `SOS Alert - Priority ${dto.priority}`,
        message: `Emergency reported for vehicle ${dto.vehicleId} at ${dto.location}. Note: ${dto.message || 'Immediate help needed'}`,
      },
    });
  }

  async getUserEmergencyLogs(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId, type: 'EMERGENCY_SOS' },
      orderBy: { createdAt: 'desc' },
    });
  }
}
