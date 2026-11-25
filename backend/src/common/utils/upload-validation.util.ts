import { BadRequestException } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import * as path from 'path';

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/avif',
  'application/pdf',
]);

const ALLOWED_EXTENSIONS = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.avif',
  '.pdf',
]);

export const SAFE_UPLOAD_MULTER_OPTIONS: MulterOptions = {
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
  fileFilter: (_req, file, callback) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    const mime = (file.mimetype || '').toLowerCase();

    if (!ALLOWED_MIME_TYPES.has(mime) || !ALLOWED_EXTENSIONS.has(ext)) {
      return callback(
        new BadRequestException(
          'Unsupported file type. Only JPG, PNG, WEBP, AVIF, and PDF files are allowed.',
        ),
        false,
      );
    }
    callback(null, true);
  },
};
