import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/roles.enum';

export function Auth(...roles: Role[]) {
  return applyDecorators(
    Roles(...roles),
    UseGuards(JwtAuthGuard, RolesGuard),
    ApiBearerAuth(),
  );
}
