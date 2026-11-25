import { IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';
import { EmergencyPriority } from '../../common/enums/emergency-priority.enum';

export class CreateEmergencyDto {
  @IsString()
  @IsNotEmpty()
  vehicleId: string;

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsEnum(EmergencyPriority)
  priority: EmergencyPriority;

  @IsOptional()
  @IsString()
  message?: string;
}
