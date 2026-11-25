import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ReportSuspiciousDto {
  @IsString()
  @IsNotEmpty()
  plateNumber: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsOptional()
  @IsString()
  location?: string;
}
