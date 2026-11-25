import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EmergencyService } from './emergency.service';
import { CreateEmergencyDto } from './dto/create-emergency.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Emergency')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('emergency')
export class EmergencyController {
  constructor(private readonly emergencyService: EmergencyService) {}

  @Post('sos')
  @ApiOperation({ summary: 'Trigger SOS emergency alert' })
  triggerSos(
    @CurrentUser() user: { id: string; role: string },
    @Body() dto: CreateEmergencyDto,
  ) {
    return this.emergencyService.triggerSos(user, dto);
  }

  @Get('logs')
  @ApiOperation({ summary: 'Get user emergency logs' })
  getLogs(@CurrentUser('id') userId: string) {
    return this.emergencyService.getUserEmergencyLogs(userId);
  }
}
