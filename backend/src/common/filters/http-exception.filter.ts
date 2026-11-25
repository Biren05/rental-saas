import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiErrorResponseDto } from '../dto/api-response.dto';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const requestId = (request as any).requestId || (request.headers['x-request-id'] as string) || 'N/A';
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse: any =
      exception instanceof HttpException ? exception.getResponse() : null;

    let message: string | string[];
    let error: string;

    if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      message = exceptionResponse.message || (exception as Error).message || 'An error occurred';
      error = exceptionResponse.error || HttpStatus[status] || 'Http Exception';
    } else {
      message = (exception as Error).message || 'Internal server error';
      error = HttpStatus[status] || 'Internal Server Error';
    }

    if (status >= 500) {
      this.logger.error(`[${requestId}] ${request.method} ${request.url} - ${status} Exception:`, (exception as Error).stack);
    } else {
      this.logger.warn(`[${requestId}] ${request.method} ${request.url} - ${status} ${JSON.stringify(message)}`);
    }

    const errorPayload: ApiErrorResponseDto = {
      success: false,
      statusCode: status,
      error,
      message,
      path: request.url,
      timestamp: new Date().toISOString(),
      requestId,
    };

    response.status(status).json(errorPayload);
  }
}
