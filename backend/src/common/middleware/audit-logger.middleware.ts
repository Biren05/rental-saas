import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class AuditLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('AuditLogger');

  use(req: Request, res: Response, next: NextFunction): void {
    const { method, originalUrl, ip } = req;
    const userAgent = req.get('user-agent') || '';
    const requestId = (req as any).requestId || req.headers['x-request-id'] || 'N/A';
    const startTime = Date.now();

    res.on('finish', () => {
      const { statusCode } = res;
      const responseTime = Date.now() - startTime;

      this.logger.log(
        `[${requestId}] ${method} ${originalUrl} ${statusCode} - ${responseTime}ms - ${ip} - "${userAgent}"`,
      );
    });

    next();
  }
}
