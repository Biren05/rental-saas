import { Module } from '@nestjs/common';
import { SuspiciousService } from './suspicious.service';
import { SuspiciousController } from './suspicious.controller';

@Module({
  controllers: [SuspiciousController],
  providers: [SuspiciousService],
  exports: [SuspiciousService],
})
export class SuspiciousModule {}
