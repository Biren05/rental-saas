import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionPlanDto } from './dto/create-plan.dto';
import { SubscribePlanDto } from './dto/subscribe.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { TenantGuard } from '../common/guards/tenant.guard';
import { TenantRolesGuard } from '../common/guards/tenant-roles.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CurrentTenant } from '../common/decorators/current-tenant.decorator';
import { TenantRoles } from '../common/decorators/tenant-roles.decorator';
import { TenantRole } from '../common/enums/tenant-roles.enum';
import { Role } from '../common/enums/roles.enum';
import { Public } from '../common/decorators/public.decorator';
import { AdminService } from '../admin/admin.service';

@ApiTags('Subscriptions & SaaS Plans')
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(
    private readonly subscriptionsService: SubscriptionsService,
    private readonly adminService: AdminService,
  ) {}

  @Public()
  @Get('plans')
  @ApiOperation({ summary: 'List all available SaaS subscription plans' })
  getAllPlans() {
    return this.subscriptionsService.getAllPlans();
  }

  @Public()
  @Get('payment-config')
  @ApiOperation({ summary: 'Get public platform payment QR codes and gateway information' })
  getPaymentConfig() {
    return this.adminService.getPublicPaymentConfig();
  }

  @Post('plans')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create a new SaaS subscription plan (Super Admin only)' })
  createPlan(@Body() dto: CreateSubscriptionPlanDto) {
    return this.subscriptionsService.createPlan(dto);
  }

  @Patch('plans/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update a SaaS subscription plan (Super Admin only)' })
  updatePlan(@Param('id') id: string, @Body() dto: Partial<CreateSubscriptionPlanDto>) {
    return this.subscriptionsService.updatePlan(id, dto);
  }

  @Patch('plans/:id/toggle')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Toggle plan active status (Super Admin only)' })
  togglePlanActive(@Param('id') id: string) {
    return this.subscriptionsService.togglePlanActive(id);
  }

  @Delete('plans/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete a SaaS subscription plan (Super Admin only)' })
  deletePlan(@Param('id') id: string) {
    return this.subscriptionsService.deletePlan(id);
  }

  @Get('current')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiHeader({ name: 'x-tenant-id', required: false })
  @ApiHeader({ name: 'x-tenant-slug', required: false })
  @ApiOperation({ summary: 'Get current tenant subscription details, usage & quotas' })
  getCurrentSubscription(@CurrentTenant('id') tenantId: string) {
    return this.subscriptionsService.getCurrentSubscription(tenantId);
  }

  @Post('check-expiries')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Manually trigger subscription & trial expiry reminder scans' })
  checkExpiries() {
    return this.subscriptionsService.triggerExpiryChecks();
  }

  @Post('subscribe')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, TenantGuard, TenantRolesGuard)
  @TenantRoles(TenantRole.OWNER, TenantRole.ADMIN)
  @ApiHeader({ name: 'x-tenant-id', required: false })
  @ApiHeader({ name: 'x-tenant-slug', required: false })
  @ApiOperation({ summary: 'Subscribe or upgrade tenant SaaS plan' })
  subscribe(
    @CurrentTenant('id') tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: SubscribePlanDto,
  ) {
    return this.subscriptionsService.subscribe(tenantId, userId, dto);
  }
}
