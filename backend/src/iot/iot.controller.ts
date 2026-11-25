import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Headers,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { IotService } from './iot.service';
import { PairDeviceDto } from './dto/pair-device.dto';
import { TelemetryPacketDto } from './dto/telemetry-packet.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { TenantGuard } from '../common/guards/tenant.guard';
import { CurrentTenant } from '../common/decorators/current-tenant.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('IoT & Fleet Telematics')
@Controller('iot')
export class IotController {
  constructor(private readonly iotService: IotService) {}

  @Post('pair')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiHeader({ name: 'x-tenant-id', required: false })
  @ApiOperation({ summary: 'Register or pair an IoT tracker with a vehicle' })
  pairDevice(@CurrentTenant('id') tenantId: string, @Body() dto: PairDeviceDto) {
    return this.iotService.pairDevice(tenantId, dto);
  }

  @Delete('unpair/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiHeader({ name: 'x-tenant-id', required: false })
  @ApiOperation({ summary: 'Unpair or delete an IoT tracking device' })
  unpairDevice(@CurrentTenant('id') tenantId: string, @Param('id') id: string) {
    return this.iotService.unpairDevice(tenantId, id);
  }

  @Get('tenant-devices')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiHeader({ name: 'x-tenant-id', required: false })
  @ApiOperation({ summary: 'List all paired IoT GPS devices for current tenant' })
  getTenantDevices(@CurrentTenant('id') tenantId: string) {
    return this.iotService.getTenantDevices(tenantId);
  }

  @Post('device/:id/engine-lock')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiHeader({ name: 'x-tenant-id', required: false })
  @ApiOperation({ summary: 'Remote engine immobilizer cut-off relay switch' })
  toggleEngineLock(
    @CurrentTenant('id') tenantId: string,
    @Param('id') id: string,
    @Body('lock') lock: boolean,
  ) {
    return this.iotService.toggleEngineLock(tenantId, id, lock);
  }

  @Get('vehicle/:vehicleId/live')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiHeader({ name: 'x-tenant-id', required: false })
  @ApiOperation({ summary: 'Get live telemetry and GPS breadcrumb trail for vehicle' })
  getVehicleTracking(
    @CurrentTenant('id') tenantId: string,
    @Param('vehicleId') vehicleId: string,
  ) {
    return this.iotService.getVehicleTracking(tenantId, vehicleId);
  }

  @Post('device/:id/simulate')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiHeader({ name: 'x-tenant-id', required: false })
  @ApiOperation({ summary: 'Simulate vehicle movement ping for live tracking demo' })
  simulateMovement(
    @CurrentTenant('id') tenantId: string,
    @Param('id') id: string,
  ) {
    return this.iotService.simulateMovement(tenantId, id);
  }

  @Public()
  @Post('telemetry')
  @ApiOperation({ summary: 'Ingest raw GPS telemetry packet from IoT device or Traccar' })
  recordTelemetry(
    @Body() dto: TelemetryPacketDto,
    @Headers('x-iot-secret') iotSecret?: string,
  ) {
    return this.iotService.recordTelemetry(dto, iotSecret);
  }
}
