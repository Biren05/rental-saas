import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsDateString, IsOptional, IsNumber, Min } from 'class-validator';

export class CreateBookingDto {
  @ApiProperty({ example: 'vehicle-uuid' })
  @IsString()
  @IsNotEmpty()
  vehicleId: string;

  @ApiPropertyOptional({ example: 'customer-user-uuid (optional if booking for self)' })
  @IsString()
  @IsOptional()
  customerId?: string;

  @ApiProperty({ example: '2026-09-21T10:00:00.000Z' })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({ example: '2026-09-24T18:00:00.000Z' })
  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @ApiPropertyOptional({ example: 5000, description: 'Security deposit in NPR' })
  @IsNumber()
  @IsOptional()
  @Min(0)
  depositAmount?: number;

  @ApiPropertyOptional({ example: 'Kathmandu Airport Pickup' })
  @IsString()
  @IsOptional()
  pickupLocation?: string;

  @ApiPropertyOptional({ example: 'Thamel Branch' })
  @IsString()
  @IsOptional()
  returnLocation?: string;

  @ApiPropertyOptional({ description: 'Citizenship document image URL' })
  @IsString()
  @IsOptional()
  citizenshipUrl?: string;

  @ApiPropertyOptional({ description: 'Bank cheque guarantee image URL' })
  @IsString()
  @IsOptional()
  bankChequeUrl?: string;

  @ApiPropertyOptional({ description: 'Driving license document image URL' })
  @IsString()
  @IsOptional()
  drivingLicenseUrl?: string;
}
