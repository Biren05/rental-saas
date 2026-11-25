import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InsuranceService } from './insurance.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Insurance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('insurance')
export class InsuranceController {
  constructor(private readonly insuranceService: InsuranceService) {}

  @Post('policy')
  @ApiOperation({ summary: 'Register vehicle insurance policy' })
  createPolicy(
    @CurrentUser() user: any,
    @Body('vehicleId') vehicleId: string,
    @Body('providerName') providerName: string,
    @Body('policyNumber') policyNumber: string,
    @Body('startDate') startDate: string,
    @Body('endDate') endDate: string,
    @Body('premiumAmount') premiumAmount: number,
  ) {
    return this.insuranceService.createPolicy(
      vehicleId,
      providerName,
      policyNumber,
      startDate,
      endDate,
      premiumAmount,
      user,
    );
  }

  @Get('vehicle/:vehicleId')
  @ApiOperation({ summary: 'Get active insurance policy for vehicle' })
  getPolicy(@Param('vehicleId') vehicleId: string, @CurrentUser() user: any) {
    return this.insuranceService.getPolicyByVehicle(vehicleId, user);
  }
}
