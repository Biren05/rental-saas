import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEnum } from 'class-validator';
import { PaymentMethod } from '@prisma/client';

export class SubscribePlanDto {
  @ApiProperty({ example: 'plan-uuid' })
  @IsString()
  @IsNotEmpty()
  planId: string;

  @ApiProperty({ enum: PaymentMethod, default: PaymentMethod.ESEWA })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;
}
