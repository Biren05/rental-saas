import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SuspiciousService } from './suspicious.service';
import { ReportSuspiciousDto } from './dto/report-suspicious.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Suspicious')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('suspicious')
export class SuspiciousController {
  constructor(private readonly suspiciousService: SuspiciousService) {}

  @Post('report')
  @ApiOperation({ summary: 'Submit suspicious vehicle activity report' })
  report(
    @CurrentUser('id') reporterId: string,
    @Body() dto: ReportSuspiciousDto,
  ) {
    return this.suspiciousService.createReport(reporterId, dto);
  }

  @Get('reports')
  @ApiOperation({ summary: 'Get list of suspicious activity reports' })
  getReports(@CurrentUser() user: { id: string; role: string }) {
    return this.suspiciousService.getAllReports(user);
  }
}
