import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export async function assertVehicleAccess(
  prisma: PrismaService,
  vehicleId: string,
  user?: { id: string; role: string },
  requireWrite = false,
) {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: vehicleId },
    select: { id: true, ownerId: true, tenantId: true },
  });

  if (!vehicle) {
    throw new NotFoundException('Vehicle not found');
  }

  if (!user) {
    throw new ForbiddenException('Authentication required');
  }

  if (user.role === 'ADMIN' || vehicle.ownerId === user.id) {
    return vehicle;
  }

  if (vehicle.tenantId) {
    const membership = await prisma.tenantUser.findUnique({
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

  throw new ForbiddenException(
    'You do not have permission to access or modify this vehicle',
  );
}
