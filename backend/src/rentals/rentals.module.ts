import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RentalsService } from './rentals.service';
import { RentalsController } from './rentals.controller';
import { PublicRentalsController } from './public-rentals.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { UploadsModule } from '../uploads/uploads.module';
import { EmailModule } from '../notifications/email/email.module';
import { getJwtSecret } from '../common/utils/jwt-secret.util';

@Module({
  imports: [
    PrismaModule,
    UploadsModule,
    EmailModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: getJwtSecret(configService),
        signOptions: { expiresIn: '7d' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [RentalsController, PublicRentalsController],
  providers: [RentalsService],
  exports: [RentalsService],
})
export class RentalsModule {}
