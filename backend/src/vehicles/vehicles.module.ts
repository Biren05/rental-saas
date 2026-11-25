import { Module } from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { VehiclesController } from './vehicles.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { UploadsModule } from '../uploads/uploads.module';

@Module({
  imports: [PrismaModule, SubscriptionsModule, UploadsModule],
  controllers: [VehiclesController],
  providers: [VehiclesService],
  exports: [VehiclesService],
})
export class VehiclesModule {}
