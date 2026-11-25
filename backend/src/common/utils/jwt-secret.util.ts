import { ConfigService } from '@nestjs/config';

export function getJwtSecret(configService?: ConfigService): string {
  const secret =
    configService?.get<string>('JWT_SECRET') || process.env.JWT_SECRET;

  if (!secret || !secret.trim()) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET environment variable must be set in production');
    }
    return 'dev-only-jwt-secret-change-in-production';
  }

  return secret;
}
