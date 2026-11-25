import { IsNotEmpty, IsString, IsOptional, IsDateString } from 'class-validator';

export class UploadDocumentDto {
  @IsString()
  @IsNotEmpty()
  vehicleId: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  fileUrl: string;

  @IsOptional()
  @IsDateString()
  expiryDate?: string;
}
