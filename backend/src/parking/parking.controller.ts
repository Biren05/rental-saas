import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ParkingService } from './parking.service';
import { ParkVehicleDto } from './dto/park-vehicle.dto';
import { ExitParkingDto } from './dto/exit-parking.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Parking')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('parking')
export class ParkingController {
  constructor(private readonly parkingService: ParkingService) {}

  @Post('entry')
  @ApiOperation({ summary: 'Register parking entry' })
  parkVehicle(
    @Body() dto: ParkVehicleDto,
    @CurrentUser() user: { id: string; role: string },
  ) {
    return this.parkingService.parkVehicle(dto, user);
  }

  @Post('exit')
  @ApiOperation({ summary: 'Register parking exit & calculate fee' })
  exitParking(
    @Body() dto: ExitParkingDto,
    @CurrentUser() user: { id: string; role: string },
  ) {
    return this.parkingService.exitParking(dto.parkingLogId, user);
  }

  @Get('history/:vehicleId')
  @ApiOperation({ summary: 'Get vehicle parking history' })
  getHistory(
    @Param('vehicleId') vehicleId: string,
    @CurrentUser() user: { id: string; role: string },
  ) {
    return this.parkingService.getVehicleHistory(vehicleId, user);
  }
}
