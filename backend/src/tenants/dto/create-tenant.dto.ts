import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsEmail, Matches } from 'class-validator';

export class CreateTenantDto {
  @ApiProperty({ example: 'Kathmandu Luxury Car Rentals' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'ktm-luxury-rentals' })
  @IsString()
  @IsOptional()
  @Matches(/^[a-z0-9-]+$/, { message: 'Slug must contain only lowercase letters, numbers, and hyphens' })
  slug?: string;

  @ApiPropertyOptional({ example: 'https://ktmluxury.com' })
  @IsString()
  @IsOptional()
  domain?: string;

  @ApiPropertyOptional({ example: 'Thamel, Kathmandu' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ example: '+977-9800000000' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 'contact@ktmluxury.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: 'https://example.com/logo.png' })
  @IsString()
  @IsOptional()
  logoUrl?: string;

  @ApiPropertyOptional({ example: 'plan-uuid' })
  @IsString()
  @IsOptional()
  planId?: string;

  @ApiPropertyOptional({ example: 'Ram Bahadur', description: 'Primary business owner / admin full name' })
  @IsString()
  @IsOptional()
  ownerName?: string;

  @ApiPropertyOptional({ example: 'owner@ktmluxury.com', description: 'Official email for client credentials' })
  @IsEmail()
  @IsOptional()
  ownerEmail?: string;

  @ApiPropertyOptional({ example: 'ACTIVE', enum: ['ACTIVE', 'SUSPENDED', 'PENDING'] })
  @IsString()
  @IsOptional()
  status?: any;

  @ApiPropertyOptional({ example: 'https://...', description: 'Uploaded business registration/PAN document URL' })
  @IsString()
  @IsOptional()
  documentUrl?: string;

  @ApiPropertyOptional({ example: 'BUSINESS_REGISTRATION' })
  @IsString()
  @IsOptional()
  documentType?: string;

  @ApiPropertyOptional({ example: 'https://...', description: 'Uploaded payment receipt / voucher URL' })
  @IsString()
  @IsOptional()
  paymentReceiptUrl?: string;

  @ApiPropertyOptional({ example: 'ESEWA', enum: ['TRIAL', 'ESEWA', 'KHALTI', 'FONEPAY', 'CASH'] })
  @IsString()
  @IsOptional()
  paymentMethod?: string;

  @ApiPropertyOptional({ example: 'TXN-9842109' })
  @IsString()
  @IsOptional()
  transactionId?: string;

  @ApiPropertyOptional({ example: 'Advance payment for Pro Fleet annual tier' })
  @IsString()
  @IsOptional()
  paymentNote?: string;
}
