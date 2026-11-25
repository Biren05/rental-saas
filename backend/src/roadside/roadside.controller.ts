import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RoadsideService } from './roadside.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Roadside')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('roadside')
export class RoadsideController {
  constructor(private readonly roadsideService: RoadsideService) {}

  @Post('request')
  @ApiOperation({ summary: 'Request roadside assistance' })
  requestAssistance(
    @Body('vehicleId') vehicleId: string,
    @Body('issueType') issueType: string,
    @Body('location') location: string,
    @CurrentUser() user: { id: string; role: string },
  ) {
    return this.roadsideService.requestAssistance(vehicleId, issueType, location, user);
  }

  @Get('vehicle/:vehicleId')
  @ApiOperation({ summary: 'Get roadside assistance requests for vehicle' })
  getRequests(
    @Param('vehicleId') vehicleId: string,
    @CurrentUser() user: { id: string; role: string },
  ) {
    return this.roadsideService.getRequests(vehicleId, user);
  }
}
