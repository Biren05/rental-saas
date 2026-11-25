import { HttpException, HttpStatus } from '@nestjs/common';

export class CustomDomainException extends HttpException {
  constructor(message: string, status: HttpStatus = HttpStatus.BAD_REQUEST) {
    super(message, status);
  }
}
