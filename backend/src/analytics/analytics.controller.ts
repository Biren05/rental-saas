import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { Auth } from '../auth/decorators/auth.decorator';
import { Role } from '../common/enums/roles.enum';

@ApiTags('Analytics')
@Auth(Role.ADMIN)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('vehicle-types')
  @ApiOperation({ summary: 'Get vehicle distribution analytics' })
  getVehicleTypeDistribution() {
    return this.analyticsService.getVehicleTypeDistribution();
  }

  @Get('registrations')
  @ApiOperation({ summary: 'Get monthly registration stats' })
  getMonthlyRegistrations() {
    return this.analyticsService.getMonthlyRegistrations();
  }
}
