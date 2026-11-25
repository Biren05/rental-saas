import { registerAs } from '@nestjs/config';

export default registerAs('mail', () => ({
  host: process.env.MAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.MAIL_PORT || '465', 10),
  secure: process.env.MAIL_SECURE === 'true' || process.env.MAIL_PORT === '465',
  user: process.env.MAIL_USER,
  pass: process.env.MAIL_PASS,
  from: process.env.MAIL_FROM || 'AutoRent SaaS <dhamib610@gmail.com>',
}));
