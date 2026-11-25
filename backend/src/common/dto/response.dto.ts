export class ApiResponseDto<T> {
  statusCode: number;
  message: string;
  data?: T;
  meta?: any;
}
