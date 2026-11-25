import { registerAs } from '@nestjs/config';

export default registerAs('storage', () => ({
  provider: process.env.STORAGE_PROVIDER || 'local',
  uploadDir: process.env.UPLOAD_DIR || './uploads',
}));
