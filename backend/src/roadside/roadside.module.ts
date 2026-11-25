import { Module } from '@nestjs/common';
import { RoadsideService } from './roadside.service';
import { RoadsideController } from './roadside.controller';

@Module({
  controllers: [RoadsideController],
  providers: [RoadsideService],
  exports: [RoadsideService],
})
export class RoadsideModule {}
