import { Module } from '@nestjs/common';
import { GpsService } from './gps.service';
import { GpsController } from './gps.controller';
import { TraccarProvider } from './providers/traccar.provider';
import { GenericGpsProvider } from './providers/generic-gps.provider';

@Module({
  controllers: [GpsController],
  providers: [GpsService, TraccarProvider, GenericGpsProvider],
  exports: [GpsService],
})
export class GpsModule {}
