import { Module } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { TenantsController } from './tenants.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { EmailModule } from '../notifications/email/email.module';
import { UploadsModule } from '../uploads/uploads.module';

@Module({
  imports: [PrismaModule, EmailModule, UploadsModule],
  controllers: [TenantsController],
  providers: [TenantsService],
  exports: [TenantsService],
})
export class TenantsModule {}
