import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { FirebaseModule } from './firebase/firebase.module';
import { SmsModule } from './sms/sms.module';
import { EmailModule } from './email/email.module';

@Module({
  imports: [FirebaseModule, SmsModule, EmailModule],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
