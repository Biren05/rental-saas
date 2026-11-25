import { IsOptional, IsString, IsDateString } from 'class-validator';

export class UpdateDocumentDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsDateString()
  expiryDate?: string;
}
