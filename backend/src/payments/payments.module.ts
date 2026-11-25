import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { EsewaModule } from './esewa/esewa.module';
import { KhaltiModule } from './khalti/khalti.module';
import { FonepayModule } from './fonepay/fonepay.module';

@Module({
  imports: [EsewaModule, KhaltiModule, FonepayModule],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
