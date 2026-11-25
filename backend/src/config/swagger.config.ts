import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

/**
 * Enterprise Swagger (OpenAPI 3.0) Configuration Builder
 * 
 * Why: Centralizes API metadata, security schemes, server environments, 
 * and module descriptions to keep main.ts clean and maintainable.
 */
export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('Vehicle Identity & Management System API')
    .setDescription(
      `
### Enterprise REST API Specification
Production-grade Vehicle Identity, QR Scanning, Fleet Management, Emergency SOS, Parking, and Nepal Payment Integration Platform.

#### Modules Overview:
- **Auth**: User authentication, JWT tokens, and OAuth credentials.
- **Users**: Account profiles, role management, and settings.
- **Vehicles**: Digital bluebook, vehicle registration, and ownership.
- **QR**: Dynamic vehicle QR code generation & public scanner API.
- **Parking**: Real-time parking session allocation & automated fee calculation.
- **Emergency**: SOS emergency broadcasts, priority alerts & contact pings.
- **Suspicious**: Public incident & stolen/suspicious vehicle reporting.
- **Documents**: Tax token, bluebook, and license document vault.
- **Reminders**: Automated servicing, tax, and insurance renewal alerts.
- **Notifications**: Multi-channel FCM push, SMS gateway, and email delivery.
- **Family**: Delegated vehicle access for family members.
- **Fleet**: Commercial fleet management & driver assignments.
- **GPS**: Real-time vehicle telemetry and location tracking.
- **Roadside**: Emergency roadside assistance & towing request dispatch.
- **Insurance**: Policy registration & claim lifecycle management.
- **Payments**: Integration with Nepal payment gateways (eSewa, Khalti, Fonepay).
- **Uploads**: File & image upload service with Cloud/Local storage.
- **Admin**: Administrative operations & user audit logs.
- **Analytics**: System usage telemetry and vehicle scan analytics.
- **Scheduler**: Background cron jobs & maintenance tasks.
- **Health**: System health checks & liveness/readiness probes.
      `,
    )
    .setVersion('1.0.0')
    .addTag('Health', 'System health check and uptime endpoints')
    .addTag('Auth', 'Authentication, token refresh, and registration')
    .addTag('Users', 'User profile management and settings')
    .addTag('Vehicles', 'Vehicle bluebook registration and metadata')
    .addTag('QR', 'Vehicle QR code generation and public scanning')
    .addTag('Parking', 'Parking spot check-in/check-out & fee calculation')
    .addTag('Emergency', 'SOS emergency alerts and location broadcasts')
    .addTag('Suspicious', 'Suspicious vehicle activity reports')
    .addTag('Documents', 'Vehicle bluebook, license & tax documents')
    .addTag('Reminders', 'Servicing, tax & insurance reminders')
    .addTag('Notifications', 'Push notifications, SMS, and Email logs')
    .addTag('Family', 'Shared family vehicle access')
    .addTag('Fleet', 'Fleet organization and vehicle rosters')
    .addTag('GPS', 'Real-time GPS tracking data')
    .addTag('Roadside', 'Roadside assistance requests')
    .addTag('Insurance', 'Insurance policies and claims')
    .addTag('Payments', 'Payment processing via eSewa, Khalti & Fonepay')
    .addTag('Uploads', 'Document and image upload service')
    .addTag('Admin', 'Admin dashboard statistics and system audit')
    .addTag('Analytics', 'Platform analytics and scan telemetry')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter JWT Bearer token',
        in: 'header',
      },
      'bearer-auth',
    )
    .addServer(`http://localhost:${process.env.PORT || 4000}`, 'Local Development Environment')
    .addServer('https://api.vehicleidentity.com', 'Production API Server')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      showExtensions: true,
    },
    customSiteTitle: 'Vehicle Identity API Docs',
  });
}
