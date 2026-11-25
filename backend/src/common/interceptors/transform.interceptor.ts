import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponseDto } from '../dto/api-response.dto';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponseDto<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponseDto<T>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const requestId = (request as any).requestId || request.headers['x-request-id'] || 'N/A';

    return next.handle().pipe(
      map((data) => {
        // If data already contains pagination meta
        if (data && typeof data === 'object' && 'items' in data && 'meta' in data) {
          return {
            success: true,
            statusCode: response.statusCode,
            message: 'Success',
            data: data.items,
            meta: data.meta,
            timestamp: new Date().toISOString(),
            requestId,
          } as any;
        }

        return {
          success: true,
          statusCode: response.statusCode,
          message: 'Success',
          data,
          timestamp: new Date().toISOString(),
          requestId,
        };
      }),
    );
  }
}
