import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

export const REQUEST_ID_HEADER = 'x-request-id';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const existingRequestId = req.headers[REQUEST_ID_HEADER] as string;
    const requestId = existingRequestId || `req-${uuidv4()}`;

    // Attach to request object and response header
    req.headers[REQUEST_ID_HEADER] = requestId;
    (req as any).requestId = requestId;
    res.setHeader(REQUEST_ID_HEADER, requestId);

    next();
  }
}
