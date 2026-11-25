import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFleetDto } from './dto/create-fleet.dto';
import { AssignVehicleDto } from './dto/assign-vehicle.dto';
import { assertVehicleAccess } from '../common/utils/vehicle-access.util';

@Injectable()
export class FleetService {
  constructor(private prisma: PrismaService) {}

  async createFleet(managerId: string, dto: CreateFleetDto) {
    return this.prisma.fleet.create({
      data: {
        name: dto.name,
        managerId,
      },
    });
  }

  async getManagerFleets(managerId: string) {
    return this.prisma.fleet.findMany({
      where: { managerId },
    });
  }

  async assignVehicle(dto: AssignVehicleDto, user: { id: string; role: string }) {
    const fleet = await this.prisma.fleet.findUnique({ where: { id: dto.fleetId } });
    if (!fleet) throw new NotFoundException('Fleet organization not found');

    if (user.role !== 'ADMIN' && fleet.managerId !== user.id) {
      throw new ForbiddenException('You do not manage this fleet organization');
    }

    await assertVehicleAccess(this.prisma, dto.vehicleId, user, true);

    return { success: true, fleetId: dto.fleetId, vehicleId: dto.vehicleId };
  }
}
