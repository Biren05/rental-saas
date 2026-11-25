import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEmail, IsDateString, IsOptional, MaxLength, IsEnum, IsNumber, Min, IsBoolean } from 'class-validator';
import { PaymentMethod } from '@prisma/client';

export type PublicPaymentType = 'FULL' | 'ADVANCE' | 'PAY_ON_PICKUP';

export class PublicCreateBookingDto {
  @ApiProperty({ example: 'vehicle-uuid', description: 'ID of the vehicle being booked' })
  @IsString()
  @IsNotEmpty()
  vehicleId: string;

  @ApiProperty({ example: '2026-09-22T10:00:00.000Z', description: 'Pickup start date and time (ISO 8601)' })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({ example: '2026-09-25T18:00:00.000Z', description: 'Return end date and time (ISO 8601)' })
  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @ApiProperty({ example: 'Ram Sharma', description: 'Customer full name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  fullName: string;

  @ApiProperty({ example: 'ram.sharma@example.com', description: 'Customer contact email' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '9841234567', description: 'Customer primary mobile phone number' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  phone: string;

  @ApiPropertyOptional({ example: 'Lakeside Office, Pokhara', description: 'Pickup location' })
  @IsString()
  @IsOptional()
  @MaxLength(150)
  pickupLocation?: string;

  @ApiPropertyOptional({ example: 'Airport Return Hub', description: 'Return drop-off location' })
  @IsString()
  @IsOptional()
  @MaxLength(150)
  returnLocation?: string;

  @ApiPropertyOptional({ example: 'BA 02-394812, Need child booster seat', description: 'License / Citizenship number or notes' })
  @IsString()
  @IsOptional()
  @MaxLength(300)
  notes?: string;

  @ApiPropertyOptional({
    example: 'https://res.cloudinary.com/autorent-cloud/image/upload/license.jpg',
    description: 'Uploaded driving license or citizenship document image URL',
  })
  @IsString()
  @IsOptional()
  documentUrl?: string;

  @ApiPropertyOptional({
    description: 'Customer citizenship card document image URL',
  })
  @IsString()
  @IsOptional()
  citizenshipUrl?: string;

  @ApiPropertyOptional({
    description: 'Customer guarantee bank cheque image URL',
  })
  @IsString()
  @IsOptional()
  bankChequeUrl?: string;

  @ApiPropertyOptional({
    description: 'Customer driving license document image URL',
  })
  @IsString()
  @IsOptional()
  drivingLicenseUrl?: string;

  @ApiPropertyOptional({
    enum: ['FULL', 'ADVANCE', 'PAY_ON_PICKUP'],
    default: 'PAY_ON_PICKUP',
    description: 'Selected payment option for the booking',
  })
  @IsOptional()
  @IsString()
  paymentType?: PublicPaymentType;

  @ApiPropertyOptional({
    enum: PaymentMethod,
    example: PaymentMethod.ESEWA,
    description: 'Selected payment method/gateway',
  })
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @ApiPropertyOptional({
    example: 2000,
    description: 'Amount paid immediately during booking',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  paidAmount?: number;

  @ApiPropertyOptional({
    example: 'TXN-ESW-984120',
    description: 'Optional transaction or payment reference ID',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  transactionId?: string;

  @ApiPropertyOptional({
    example: 'Advance deposit paid via eSewa',
    description: 'Optional payment remarks or note',
  })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  paymentNote?: string;

  @ApiPropertyOptional({
    example: 'https://res.cloudinary.com/autorent-cloud/image/upload/payment-slip.jpg',
    description: 'Customer payment transfer screenshot or receipt slip image URL',
  })
  @IsOptional()
  @IsString()
  paymentReceiptUrl?: string;

  @ApiPropertyOptional({ example: false, description: 'Whether customer requests a driver (+NPR 1,500/day)' })
  @IsOptional()
  @IsBoolean()
  withDriver?: boolean;

  @ApiPropertyOptional({ example: 'DASHAIN10', description: 'Optional promotional discount code' })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  promoCode?: string;
}

