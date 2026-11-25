import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TENANT_ROLES_KEY } from '../decorators/tenant-roles.decorator';
import { TenantRole } from '../enums/tenant-roles.enum';

@Injectable()
export class TenantRolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<TenantRole[]>(TENANT_ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const tenantUser = request.tenantUser;

    if (!tenantUser) {
      throw new ForbiddenException('Tenant context not established');
    }

    const hasRole = requiredRoles.includes(tenantUser.role as TenantRole);
    if (!hasRole) {
      throw new ForbiddenException(`Insufficient tenant permissions. Required: [${requiredRoles.join(', ')}]`);
    }

    return true;
  }
}
