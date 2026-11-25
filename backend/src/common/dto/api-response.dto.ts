import { ApiProperty } from '@nestjs/swagger';

export class ApiResponseDto<T = any> {
  @ApiProperty({ example: true, description: 'Indicates if the request succeeded' })
  success: boolean;

  @ApiProperty({ example: 200, description: 'HTTP Status Code' })
  statusCode: number;

  @ApiProperty({ example: 'Operation completed successfully', description: 'Response summary message' })
  message: string;

  @ApiProperty({ description: 'Response payload data' })
  data?: T;

  @ApiProperty({ example: '2026-07-25T12:00:00.000Z', description: 'ISO Timestamp of response generation' })
  timestamp: string;

  @ApiProperty({ example: 'req-c9f28a30-85d0-47b2-b1e0-32a101b0f592', description: 'Unique Correlation / Request ID' })
  requestId: string;
}

export class ApiErrorResponseDto {
  @ApiProperty({ example: false, description: 'Always false for errors' })
  success: boolean;

  @ApiProperty({ example: 400, description: 'HTTP Exception Status Code' })
  statusCode: number;

  @ApiProperty({ example: 'Bad Request', description: 'Error title or category' })
  error: string;

  @ApiProperty({ example: 'Invalid input parameters provided', description: 'Detailed error explanation or validation messages' })
  message: string | string[];

  @ApiProperty({ example: '/api/v1/vehicles', description: 'Request URI path' })
  path: string;

  @ApiProperty({ example: '2026-07-25T12:00:00.000Z', description: 'ISO Timestamp' })
  timestamp: string;

  @ApiProperty({ example: 'req-c9f28a30-85d0-47b2-b1e0-32a101b0f592', description: 'Unique Request ID for log tracing' })
  requestId: string;
}

export class PaginationMetaDto {
  @ApiProperty({ example: 1, description: 'Current page number' })
  currentPage: number;

  @ApiProperty({ example: 10, description: 'Items per page' })
  itemsPerPage: number;

  @ApiProperty({ example: 45, description: 'Total records in database' })
  totalItems: number;

  @ApiProperty({ example: 5, description: 'Total pages available' })
  totalPages: number;
}

export class PaginatedResponseDto<T = any> extends ApiResponseDto<T[]> {
  @ApiProperty({ type: PaginationMetaDto, description: 'Pagination metadata' })
  meta: PaginationMetaDto;
}
