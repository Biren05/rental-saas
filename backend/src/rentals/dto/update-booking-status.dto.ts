import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEnum } from 'class-validator';
import { BookingStatus } from '@prisma/client';

export class UpdateBookingStatusDto {
  @ApiProperty({ enum: BookingStatus, example: BookingStatus.CONFIRMED })
  @IsEnum(BookingStatus)
  @IsNotEmpty()
  status: BookingStatus;
}
