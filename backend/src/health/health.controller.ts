import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthService } from './health.service';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get overall application health & status metrics' })
  @ApiResponse({ status: 200, description: 'Health check metrics' })
  check() {
    return this.healthService.checkHealth();
  }

  @Public()
  @Get('liveness')
  @ApiOperation({ summary: 'Liveness probe for Kubernetes / Container Orchestration' })
  liveness() {
    return { status: 'UP', timestamp: new Date().toISOString() };
  }
}
