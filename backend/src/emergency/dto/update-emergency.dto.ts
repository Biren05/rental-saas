import { IsOptional, IsString } from 'class-validator';

export class UpdateEmergencyDto {
  @IsOptional()
  @IsString()
  status?: string;
}
