import { Module } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsController } from './subscriptions.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AdminModule } from '../admin/admin.module';
import { SchedulerModule } from '../scheduler/scheduler.module';

@Module({
  imports: [PrismaModule, AdminModule, SchedulerModule],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
