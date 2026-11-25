import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import mailConfig from './config/mail.config';
import smsConfig from './config/sms.config';
import storageConfig from './config/storage.config';

import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { QrModule } from './qr/qr.module';
import { ParkingModule } from './parking/parking.module';
import { EmergencyModule } from './emergency/emergency.module';
import { SuspiciousModule } from './suspicious/suspicious.module';
import { DocumentsModule } from './documents/documents.module';
import { RemindersModule } from './reminders/reminders.module';
import { NotificationsModule } from './notifications/notifications.module';
import { FamilyModule } from './family/family.module';
import { FleetModule } from './fleet/fleet.module';
import { GpsModule } from './gps/gps.module';
import { RoadsideModule } from './roadside/roadside.module';
import { InsuranceModule } from './insurance/insurance.module';
import { PaymentsModule } from './payments/payments.module';
import { UploadsModule } from './uploads/uploads.module';
import { AdminModule } from './admin/admin.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { SchedulerModule } from './scheduler/scheduler.module';
import { TenantsModule } from './tenants/tenants.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { RentalsModule } from './rentals/rentals.module';
import { HealthModule } from './health/health.module';
import { IotModule } from './iot/iot.module';

import { RequestIdMiddleware } from './common/middleware/request-id.middleware';
import { AuditLoggerMiddleware } from './common/middleware/audit-logger.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        appConfig,
        databaseConfig,
        jwtConfig,
        mailConfig,
        smsConfig,
        storageConfig,
      ],
    }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 10,
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 50,
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 300,
      },
    ]),
    PrismaModule,
    HealthModule,
    AuthModule,
    UsersModule,
    VehiclesModule,
    QrModule,
    ParkingModule,
    EmergencyModule,
    SuspiciousModule,
    DocumentsModule,
    RemindersModule,
    NotificationsModule,
    FamilyModule,
    FleetModule,
    GpsModule,
    RoadsideModule,
    InsuranceModule,
    PaymentsModule,
    UploadsModule,
    AdminModule,
    AnalyticsModule,
    SchedulerModule,
    TenantsModule,
    SubscriptionsModule,
    RentalsModule,
    IotModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestIdMiddleware, AuditLoggerMiddleware)
      .forRoutes('*');
  }
}
