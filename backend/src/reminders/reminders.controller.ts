import { Controller, Post, Body, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RemindersService } from './reminders.service';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Reminders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reminders')
export class RemindersController {
  constructor(private readonly remindersService: RemindersService) {}

  @Post()
  @ApiOperation({ summary: 'Create new reminder' })
  create(@Body() dto: CreateReminderDto, @CurrentUser() user: any) {
    return this.remindersService.create(dto, user);
  }

  @Get('vehicle/:vehicleId')
  @ApiOperation({ summary: 'Get reminders for vehicle' })
  findByVehicle(@Param('vehicleId') vehicleId: string, @CurrentUser() user: any) {
    return this.remindersService.findByVehicle(vehicleId, user);
  }

  @Patch(':id/complete')
  @ApiOperation({ summary: 'Mark reminder as completed' })
  markAsCompleted(@Param('id') id: string, @CurrentUser() user: any) {
    return this.remindersService.markAsCompleted(id, user);
  }
}
