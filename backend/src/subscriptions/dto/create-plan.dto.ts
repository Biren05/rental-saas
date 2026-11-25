import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsEnum, IsArray, IsOptional, Min } from 'class-validator';
import { BillingCycle } from '@prisma/client';

export class CreateSubscriptionPlanDto {
  @ApiProperty({ example: 'Professional Fleet' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'pro-fleet' })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiPropertyOptional({ example: 'Up to 30 vehicles with GPS tracking and analytics' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 4999 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ enum: BillingCycle, default: BillingCycle.MONTHLY })
  @IsEnum(BillingCycle)
  billingCycle: BillingCycle;

  @ApiProperty({ example: 30 })
  @IsNumber()
  @Min(1)
  maxVehicles: number;

  @ApiProperty({ example: 10 })
  @IsNumber()
  @Min(1)
  maxStaff: number;

  @ApiPropertyOptional({
    example: ['unlimited_bookings', 'gps_tracking', 'esewa_khalti_integration', 'priority_support'],
  })
  @IsArray()
  @IsOptional()
  features?: string[];
}
