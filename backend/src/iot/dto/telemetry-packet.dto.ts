import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, IsOptional, IsBoolean } from 'class-validator';

export class TelemetryPacketDto {
  @ApiProperty({ description: 'Hardware IMEI number' })
  @IsString()
  @IsNotEmpty()
  imei: string;

  @ApiProperty({ description: 'GPS Latitude coordinate' })
  @IsNumber()
  @IsNotEmpty()
  latitude: number;

  @ApiProperty({ description: 'GPS Longitude coordinate' })
  @IsNumber()
  @IsNotEmpty()
  longitude: number;

  @ApiPropertyOptional({ description: 'Vehicle speed in km/h' })
  @IsNumber()
  @IsOptional()
  speed?: number;

  @ApiPropertyOptional({ description: 'Internal or vehicle battery level percentage (0 - 100)' })
  @IsNumber()
  @IsOptional()
  batteryLevel?: number;

  @ApiPropertyOptional({ description: 'Engine ignition sensor state (true = ACC ON, false = Engine OFF)' })
  @IsBoolean()
  @IsOptional()
  ignition?: boolean;
}
