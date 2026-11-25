import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User must be authenticated to access tenant resources');
    }

    const tenantIdHeader = request.headers['x-tenant-id'] as string;
    const tenantSlugHeader = request.headers['x-tenant-slug'] as string;

    if (!tenantIdHeader && !tenantSlugHeader) {
      throw new BadRequestException('Missing x-tenant-id or x-tenant-slug header');
    }

    const tenant = await this.prisma.tenant.findFirst({
      where: {
        OR: [
          tenantIdHeader ? { id: tenantIdHeader } : undefined,
          tenantSlugHeader ? { slug: tenantSlugHeader } : undefined,
        ].filter(Boolean) as any,
      },
      include: {
        subscriptions: {
          include: { plan: true },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant organization not found');
    }

    if (tenant.status === 'SUSPENDED') {
      throw new ForbiddenException('Tenant organization is currently suspended');
    }

    // Global Admin bypass
    if (user.role === 'ADMIN') {
      request.tenant = tenant;
      request.tenantUser = { role: 'OWNER', status: 'ACTIVE' };
      return true;
    }

    const membership = await this.prisma.tenantUser.findUnique({
      where: {
        tenantId_userId: {
          tenantId: tenant.id,
          userId: user.id,
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException('You do not belong to this tenant organization');
    }

    request.tenant = tenant;
    request.tenantUser = membership;
    return true;
  }
}
