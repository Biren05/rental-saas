import { Module } from '@nestjs/common';
import { FonepayService } from './fonepay.service';

@Module({
  providers: [FonepayService],
  exports: [FonepayService],
})
export class FonepayModule {}
