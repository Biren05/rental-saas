import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader, ApiQuery } from '@nestjs/swagger';
import { RentalsService } from './rentals.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { SaveInspectionDto } from './dto/save-inspection.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { TenantGuard } from '../common/guards/tenant.guard';
import { TenantRolesGuard } from '../common/guards/tenant-roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CurrentTenant } from '../common/decorators/current-tenant.decorator';
import { TenantRoles } from '../common/decorators/tenant-roles.decorator';
import { TenantRole } from '../common/enums/tenant-roles.enum';
import { BookingStatus } from '@prisma/client';
import { RecordTenantPaymentDto } from './dto/record-tenant-payment.dto';
import { CreatePromoDto } from './dto/create-promo.dto';
import { ApplyLateFeeDto } from './dto/apply-late-fee.dto';

@ApiTags('Rentals & Bookings (SaaS)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard)
@ApiHeader({ name: 'x-tenant-id', required: false })
@ApiHeader({ name: 'x-tenant-slug', required: false })
@Controller('rentals')
export class RentalsController {
  constructor(private readonly rentalsService: RentalsService) {}

  private assertTenantMatch(activeTenantId: string, paramTenantId: string) {
    if (activeTenantId !== paramTenantId) {
      throw new ForbiddenException('Access denied: tenant mismatch');
    }
  }

  @Post('bookings')
  @ApiOperation({ summary: 'Create a new vehicle rental booking' })
  createBooking(
    @CurrentTenant('id') tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateBookingDto,
  ) {
    return this.rentalsService.createBooking(tenantId, userId, dto);
  }

  @Get('bookings')
  @ApiQuery({ name: 'status', enum: BookingStatus, required: false })
  @ApiOperation({ summary: 'List all rental bookings for current tenant' })
  getTenantBookings(
    @CurrentTenant('id') tenantId: string,
    @Query('status') status?: BookingStatus,
  ) {
    return this.rentalsService.getTenantBookings(tenantId, status);
  }

  @Get('bookings/:id')
  @ApiOperation({ summary: 'Get rental booking details by ID' })
  getBookingById(
    @CurrentTenant('id') tenantId: string,
    @Param('id') bookingId: string,
  ) {
    return this.rentalsService.getBookingById(tenantId, bookingId);
  }

  @Patch('bookings/:id/status')
  @UseGuards(TenantRolesGuard)
  @TenantRoles(TenantRole.OWNER, TenantRole.ADMIN, TenantRole.MANAGER, TenantRole.STAFF)
  @ApiOperation({ summary: 'Update rental booking status (Confirm, Handover, Return, Cancel)' })
  updateBookingStatus(
    @CurrentTenant('id') tenantId: string,
    @Param('id') bookingId: string,
    @Body() dto: UpdateBookingStatusDto,
  ) {
    return this.rentalsService.updateBookingStatus(tenantId, bookingId, dto.status);
  }

  @Patch('bookings/:id/inspection')
  @UseGuards(TenantRolesGuard)
  @TenantRoles(TenantRole.OWNER, TenantRole.ADMIN, TenantRole.MANAGER, TenantRole.STAFF)
  @ApiOperation({ summary: 'Save pickup or return vehicle inspection checklist and photos' })
  saveBookingInspection(
    @CurrentTenant('id') tenantId: string,
    @Param('id') bookingId: string,
    @Body() dto: SaveInspectionDto,
  ) {
    return this.rentalsService.saveBookingInspection(tenantId, bookingId, dto);
  }

  @Get('availability')
  @ApiQuery({ name: 'startDate', type: String, example: '2026-09-21T10:00:00.000Z' })
  @ApiQuery({ name: 'endDate', type: String, example: '2026-09-24T18:00:00.000Z' })
  @ApiOperation({ summary: 'Search available rental vehicles for a date range' })
  checkAvailability(
    @CurrentTenant('id') tenantId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.rentalsService.checkAvailability(tenantId, startDate, endDate);
  }

  // ==========================================
  // PAYMENTS & UDHARO (STATEMENTS & COLLECTION)
  // ==========================================

  @Get('payments')
  @ApiOperation({ summary: 'Get all payment transactions / statements for tenant' })
  getTenantPayments(@CurrentTenant('id') tenantId: string) {
    return this.rentalsService.getTenantPayments(tenantId);
  }

  @Get(':tenantId/payments')
  @ApiOperation({ summary: 'Get all payment transactions / statements for tenant (explicit tenantId)' })
  getTenantPaymentsById(
    @CurrentTenant('id') activeTenantId: string,
    @Param('tenantId') tenantId: string,
  ) {
    this.assertTenantMatch(activeTenantId, tenantId);
    return this.rentalsService.getTenantPayments(tenantId);
  }

  @Get('payments/stats')
  @ApiOperation({ summary: 'Get summary statistics of revenue, cash, online, and udharo' })
  getPaymentStats(@CurrentTenant('id') tenantId: string) {
    return this.rentalsService.getTenantPaymentStats(tenantId);
  }

  @Get(':tenantId/payments/stats')
  @ApiOperation({ summary: 'Get summary statistics of revenue, cash, online, and udharo (explicit tenantId)' })
  getPaymentStatsById(
    @CurrentTenant('id') activeTenantId: string,
    @Param('tenantId') tenantId: string,
  ) {
    this.assertTenantMatch(activeTenantId, tenantId);
    return this.rentalsService.getTenantPaymentStats(tenantId);
  }

  @Get('payments/udharo')
  @ApiOperation({ summary: 'Get customer udharo (credit / due) ledger with breakdown' })
  getUdharoLedger(@CurrentTenant('id') tenantId: string) {
    return this.rentalsService.getTenantUdharoLedger(tenantId);
  }

  @Get(':tenantId/payments/udharo')
  @ApiOperation({ summary: 'Get customer udharo (credit / due) ledger (explicit tenantId)' })
  getUdharoLedgerById(
    @CurrentTenant('id') activeTenantId: string,
    @Param('tenantId') tenantId: string,
  ) {
    this.assertTenantMatch(activeTenantId, tenantId);
    return this.rentalsService.getTenantUdharoLedger(tenantId);
  }

  @Post('payments')
  @UseGuards(TenantRolesGuard)
  @TenantRoles(TenantRole.OWNER, TenantRole.ADMIN, TenantRole.MANAGER, TenantRole.STAFF)
  @ApiOperation({ summary: 'Record payment (Cash / eSewa / Khalti / Fonepay) for a booking' })
  recordPayment(
    @CurrentTenant('id') tenantId: string,
    @Body() dto: RecordTenantPaymentDto,
  ) {
    return this.rentalsService.recordTenantPayment(tenantId, dto);
  }

  @Post(':tenantId/payments')
  @UseGuards(TenantRolesGuard)
  @TenantRoles(TenantRole.OWNER, TenantRole.ADMIN, TenantRole.MANAGER, TenantRole.STAFF)
  @ApiOperation({ summary: 'Record payment for a booking (explicit tenantId)' })
  recordPaymentById(
    @CurrentTenant('id') activeTenantId: string,
    @Param('tenantId') tenantId: string,
    @Body() dto: RecordTenantPaymentDto,
  ) {
    this.assertTenantMatch(activeTenantId, tenantId);
    return this.rentalsService.recordTenantPayment(tenantId, dto);
  }

  // ==========================================
  // PROMO CODES (TENANT DISCOUNTS)
  // ==========================================

  @Get('promos')
  @ApiOperation({ summary: 'List promotional discount codes for current tenant' })
  getTenantPromos(@CurrentTenant('id') tenantId: string) {
    return this.rentalsService.getTenantPromos(tenantId);
  }

  @Post('promos')
  @UseGuards(TenantRolesGuard)
  @TenantRoles(TenantRole.OWNER, TenantRole.ADMIN, TenantRole.MANAGER)
  @ApiOperation({ summary: 'Create a promotional discount code' })
  createTenantPromo(
    @CurrentTenant('id') tenantId: string,
    @Body() body: CreatePromoDto,
  ) {
    return this.rentalsService.createTenantPromo(tenantId, body);
  }

  @Delete('promos/:id')
  @UseGuards(TenantRolesGuard)
  @TenantRoles(TenantRole.OWNER, TenantRole.ADMIN, TenantRole.MANAGER)
  @ApiOperation({ summary: 'Delete a promotional discount code' })
  deleteTenantPromo(
    @CurrentTenant('id') tenantId: string,
    @Param('id') promoId: string,
  ) {
    return this.rentalsService.deleteTenantPromo(tenantId, promoId);
  }

  // ==========================================
  // OPERATIONAL ALERTS (OVERDUE & EXPIRY)
  // ==========================================

  @Get('alerts')
  @ApiOperation({ summary: 'Get overdue booking alerts and vehicle bluebook/insurance/servicing expiry alerts' })
  getOperationalAlerts(@CurrentTenant('id') tenantId: string) {
    return this.rentalsService.getTenantOperationalAlerts(tenantId);
  }

  @Post('bookings/:id/late-fee')
  @UseGuards(TenantRolesGuard)
  @TenantRoles(TenantRole.OWNER, TenantRole.ADMIN, TenantRole.MANAGER, TenantRole.STAFF)
  @ApiOperation({ summary: 'Apply a late-return fee to an overdue booking' })
  applyLateFee(
    @CurrentTenant('id') tenantId: string,
    @Param('id') bookingId: string,
    @Body() dto: ApplyLateFeeDto,
  ) {
    return this.rentalsService.applyLateFee(tenantId, bookingId, dto.amount);
  }
}

