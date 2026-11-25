import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { Logger, VersioningType } from '@nestjs/common';
import helmet from 'helmet';
import * as compression from 'compression';
import { AppModule } from './app.module';
import { setupSwagger } from './config/swagger.config';
import { CustomValidationPipe } from './common/pipes/validation.pipe';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Enterprise Security Headers via Helmet
  app.use(
    helmet({
      contentSecurityPolicy: false, // Allowed for Swagger UI rendering
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  // HTTP Response Compression
  app.use(compression());

  // Global Prefix & URI Versioning (api/v1)
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Enterprise CORS Configuration
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    exposedHeaders: ['x-request-id', 'Content-Disposition'],
  });

  // Global Validation, Exception Filtering & Response Transformation
  app.useGlobalPipes(new CustomValidationPipe());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
  );

  // Setup Enterprise Swagger OpenAPI Spec & Documentation UI
  setupSwagger(app);

  const port = process.env.PORT || 4000;
  await app.listen(port);

  logger.log(`Server running on http://localhost:${port}/api/v1`);
  logger.log(`Swagger OpenAPI Documentation available at http://localhost:${port}/docs`);
}
bootstrap();
