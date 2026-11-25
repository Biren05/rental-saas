import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaymentMethod } from '@prisma/client';

export class RecordTenantPaymentDto {
  @ApiProperty({ description: 'Rental Booking UUID' })
  @IsString()
  @IsNotEmpty()
  bookingId: string;

  @ApiProperty({ description: 'Amount collected / paid in NPR', example: 2500 })
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiProperty({ enum: PaymentMethod, description: 'Payment method used', example: PaymentMethod.CASH })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiProperty({ description: 'Receipt / Transaction identifier', required: false, example: 'TXN-98124' })
  @IsString()
  @IsOptional()
  transactionId?: string;

  @ApiProperty({ description: 'Internal note or memo', required: false, example: 'Received at frontdesk counter' })
  @IsString()
  @IsOptional()
  note?: string;
}
