import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class PairDeviceDto {
  @ApiProperty({ description: 'Unique 15-digit IMEI or Serial number of the IoT GPS tracker' })
  @IsString()
  @IsNotEmpty()
  imei: string;

  @ApiProperty({ description: 'Friendly name for the tracking device' })
  @IsString()
  @IsNotEmpty()
  deviceName: string;

  @ApiPropertyOptional({ description: 'Vehicle ID to pair this tracker with' })
  @IsString()
  @IsOptional()
  vehicleId?: string;

  @ApiPropertyOptional({ description: 'Device category', default: 'GPS_TRACKER' })
  @IsString()
  @IsOptional()
  deviceType?: string;

  @ApiPropertyOptional({ description: 'Hardware model (e.g. Teltonika FMB920, Concox GT06N, Sinotrack)' })
  @IsString()
  @IsOptional()
  model?: string;

  @ApiPropertyOptional({ description: 'SIM card phone number inside the IoT tracker' })
  @IsString()
  @IsOptional()
  simNumber?: string;
}
