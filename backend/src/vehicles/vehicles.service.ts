import { Injectable, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';

@Injectable()
export class VehiclesService {
  constructor(
    private prisma: PrismaService,
    private subscriptionsService: SubscriptionsService,
  ) {}

  private async assertVehicleAccess(
    vehicleId: string,
    user?: { id: string; role: string },
    requireWrite = false,
  ) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: vehicleId },
      include: { owner: true, qrCode: true, documents: true, tenant: true },
    });
    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    if (!user || user.role === 'ADMIN' || vehicle.ownerId === user.id) {
      return vehicle;
    }

    if (vehicle.tenantId) {
      const membership = await this.prisma.tenantUser.findUnique({
        where: {
          tenantId_userId: {
            tenantId: vehicle.tenantId,
            userId: user.id,
          },
        },
      });
      const allowedRoles = requireWrite
        ? ['OWNER', 'ADMIN', 'MANAGER', 'STAFF']
        : ['OWNER', 'ADMIN', 'MANAGER', 'STAFF', 'DRIVER'];
      if (membership && allowedRoles.includes(membership.role)) {
        return vehicle;
      }
    }

    throw new ForbiddenException('You do not have permission to access or modify this vehicle');
  }

  async create(
    ownerId: string,
    dto: CreateVehicleDto,
    tenantId?: string,
    user?: { id: string; role: string },
  ) {
    if (tenantId && user && user.role !== 'ADMIN') {
      const membership = await this.prisma.tenantUser.findUnique({
        where: {
          tenantId_userId: { tenantId, userId: user.id },
        },
      });
      if (!membership || !['OWNER', 'ADMIN', 'MANAGER', 'STAFF'].includes(membership.role)) {
        throw new ForbiddenException('You do not belong to this tenant fleet');
      }
    }

    const existing = await this.prisma.vehicle.findUnique({
      where: { plateNumber: dto.plateNumber },
    });
    if (existing) {
      throw new ConflictException('Vehicle with this plate number already exists');
    }

    // If registered under a SaaS tenant, verify quota limit
    if (tenantId) {
      await this.subscriptionsService.checkVehicleLimit(tenantId);
    }

    return this.prisma.vehicle.create({
      data: {
        ...dto,
        ownerId,
        tenantId,
      },
      include: {
        tenant: {
          select: { id: true, name: true, slug: true },
        },
      },
    });
  }

  async findAllTenantVehicles(tenantId: string) {
    return this.prisma.vehicle.findMany({
      where: { tenantId },
      include: { qrCode: true, documents: true, reminders: true, iotDevice: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAllUserVehicles(ownerId: string) {
    return this.prisma.vehicle.findMany({
      where: { ownerId },
      include: { qrCode: true, documents: true, reminders: true, tenant: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, tenantId?: string, user?: { id: string; role: string }) {
    const vehicle = await this.assertVehicleAccess(id, user, false);
    if (tenantId && vehicle.tenantId !== tenantId) {
      throw new NotFoundException('Vehicle not found in this tenant');
    }
    return vehicle;
  }

  async update(id: string, dto: UpdateVehicleDto, tenantId?: string, user?: { id: string; role: string }) {
    await this.assertVehicleAccess(id, user, true);
    if (tenantId) {
      await this.findOne(id, tenantId, user);
    }
    return this.prisma.vehicle.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string, tenantId?: string, user?: { id: string; role: string }) {
    await this.assertVehicleAccess(id, user, true);
    if (tenantId) {
      await this.findOne(id, tenantId, user);
    }
    return this.prisma.vehicle.delete({
      where: { id },
    });
  }
}
