import { Module } from '@nestjs/common';
import { KhaltiService } from './khalti.service';

@Module({
  providers: [KhaltiService],
  exports: [KhaltiService],
})
export class KhaltiModule {}
