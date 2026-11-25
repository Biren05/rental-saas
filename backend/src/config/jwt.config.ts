import { registerAs } from '@nestjs/config';
import { getJwtSecret } from '../common/utils/jwt-secret.util';

export default registerAs('jwt', () => ({
  secret: getJwtSecret(),
  expiresIn: process.env.JWT_EXPIRATION || '1d',
  refreshSecret: process.env.JWT_REFRESH_SECRET || getJwtSecret(),
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRATION || '7d',
}));
