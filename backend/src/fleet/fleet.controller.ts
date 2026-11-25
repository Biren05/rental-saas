import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FleetService } from './fleet.service';
import { CreateFleetDto } from './dto/create-fleet.dto';
import { AssignVehicleDto } from './dto/assign-vehicle.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Fleet')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('fleet')
export class FleetController {
  constructor(private readonly fleetService: FleetService) {}

  @Post()
  @ApiOperation({ summary: 'Create fleet organization' })
  createFleet(@CurrentUser('id') managerId: string, @Body() dto: CreateFleetDto) {
    return this.fleetService.createFleet(managerId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get fleets managed by current user' })
  getManagerFleets(@CurrentUser('id') managerId: string) {
    return this.fleetService.getManagerFleets(managerId);
  }

  @Post('assign')
  @ApiOperation({ summary: 'Assign vehicle to fleet' })
  assignVehicle(
    @Body() dto: AssignVehicleDto,
    @CurrentUser() user: { id: string; role: string },
  ) {
    return this.fleetService.assignVehicle(dto, user);
  }
}
