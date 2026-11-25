import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { GpsService } from './gps.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('GPS')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('gps')
export class GpsController {
  constructor(private readonly gpsService: GpsService) {}

  @Post('telemetry')
  @ApiOperation({ summary: 'Log GPS telemetry location' })
  recordTelemetry(
    @CurrentUser() user: any,
    @Body('vehicleId') vehicleId: string,
    @Body('latitude') latitude: number,
    @Body('longitude') longitude: number,
    @Body('speed') speed?: number,
  ) {
    return this.gpsService.recordTelemetry(vehicleId, latitude, longitude, speed, user);
  }

  @Get('latest/:vehicleId')
  @ApiOperation({ summary: 'Get latest vehicle GPS location' })
  getLatestLocation(@Param('vehicleId') vehicleId: string, @CurrentUser() user: any) {
    return this.gpsService.getLatestLocation(vehicleId, user);
  }
}
