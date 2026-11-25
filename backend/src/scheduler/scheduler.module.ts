import { Module } from '@nestjs/common';
import { ReminderJob } from './reminder.job';
import { CleanupJob } from './cleanup.job';
import { EmailModule } from '../notifications/email/email.module';

@Module({
  imports: [EmailModule],
  providers: [ReminderJob, CleanupJob],
  exports: [ReminderJob],
})
export class SchedulerModule {}
