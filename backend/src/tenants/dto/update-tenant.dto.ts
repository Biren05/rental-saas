import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEmail } from 'class-validator';

export class UpdateTenantDto {
  @ApiPropertyOptional({ example: 'Kathmandu Luxury Rentals Updated' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'Thamel Marg, Kathmandu' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ example: '+977-9811111111' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 'support@ktmluxury.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: 'https://example.com/new-logo.png' })
  @IsString()
  @IsOptional()
  logoUrl?: string;

  @ApiPropertyOptional({ example: 'ktm-luxury-rentals' })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiPropertyOptional({ example: 'https://ktmluxury.com' })
  @IsString()
  @IsOptional()
  domain?: string;

  @ApiPropertyOptional({ example: 'ACTIVE', enum: ['ACTIVE', 'SUSPENDED', 'PENDING'] })
  @IsString()
  @IsOptional()
  status?: any;

  @ApiPropertyOptional({ example: 'https://example.com/fonepay-qr.png' })
  @IsString()
  @IsOptional()
  paymentQrUrl?: string;

  @ApiPropertyOptional({ example: 'https://example.com/esewa-qr.png' })
  @IsString()
  @IsOptional()
  esewaQrUrl?: string;

  @ApiPropertyOptional({ example: 'https://example.com/khalti-qr.png' })
  @IsString()
  @IsOptional()
  khaltiQrUrl?: string;

  @ApiPropertyOptional({ example: 'https://example.com/fonepay-qr.png' })
  @IsString()
  @IsOptional()
  fonepayQrUrl?: string;

  @ApiPropertyOptional({ example: 'Bank: Nabil Bank | A/C: 01201017500123 | Name: Rental Co' })
  @IsString()
  @IsOptional()
  bankAccountDetails?: string;

  @ApiPropertyOptional({ example: '9862463031' })
  @IsString()
  @IsOptional()
  whatsappUrl?: string;

  @ApiPropertyOptional({ example: 'https://tiktok.com/@agency' })
  @IsString()
  @IsOptional()
  tiktokUrl?: string;

  @ApiPropertyOptional({ example: 'https://facebook.com/agency' })
  @IsString()
  @IsOptional()
  facebookUrl?: string;

  @ApiPropertyOptional({ example: 'https://instagram.com/agency' })
  @IsString()
  @IsOptional()
  instagramUrl?: string;
}
