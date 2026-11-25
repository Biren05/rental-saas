import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreatePromoDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsNumber()
  @Min(1)
  @Max(100)
  discountPercent: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  maxDiscount?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  minDays?: number;

  @IsOptional()
  @IsString()
  expiresAt?: string;
}
