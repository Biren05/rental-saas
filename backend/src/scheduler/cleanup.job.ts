import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class CleanupJob {
  private readonly logger = new Logger(CleanupJob.name);

  @Cron(CronExpression.EVERY_WEEK)
  handleWeeklyCleanup() {
    this.logger.log('Executing weekly cleanup of expired session tokens and temporary logs...');
  }
}
