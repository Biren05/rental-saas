import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { VehicleType, VehicleStatus } from '@prisma/client';

export class CreateVehicleDto {
  @ApiProperty({
    example: 'BA 2 PA 1234',
    description: 'Vehicle license plate number',
  })
  @IsString()
  @IsNotEmpty()
  plateNumber: string;

  @ApiProperty({
    enum: VehicleType,
    example: VehicleType.CAR,
    description: 'Category / Type of vehicle',
  })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      const v = value.toUpperCase().trim();
      if (['BIKE', 'MOTORBIKE', 'TWO_WHEELER', 'MOTORCYCLE'].includes(v) || v.includes('MOTORCYCLE') || v.includes('BIKE')) return VehicleType.MOTORCYCLE;
      if (['SCOOTER', 'SCOOTY'].includes(v) || v.includes('SCOOTER')) return VehicleType.SCOOTER;
      if (['SEDAN', 'SUV', 'HATCHBACK', 'LUXURY', 'ELECTRIC', 'CAR', 'JEEP'].includes(v) || v.includes('CAR') || v.includes('SUV')) return VehicleType.CAR;
      if (['VAN', 'MINIBUS', 'MICRO', 'HIACE'].includes(v) || v.includes('VAN') || v.includes('MICRO')) return VehicleType.VAN;
      if (['BUS', 'COACH'].includes(v) || v.includes('BUS')) return VehicleType.BUS;
      if (['TRUCK', 'PICKUP', 'LORRY'].includes(v) || v.includes('TRUCK') || v.includes('PICKUP')) return VehicleType.TRUCK;
      return v as VehicleType;
    }
    return value;
  })
  @IsEnum(VehicleType)
  vehicleType: VehicleType;

  @ApiProperty({
    example: 'Hyundai',
    description: 'Vehicle manufacturer / brand',
  })
  @IsString()
  @IsNotEmpty()
  brand: string;

  @ApiProperty({
    example: 'Creta',
    description: 'Vehicle model name',
  })
  @IsString()
  @IsNotEmpty()
  model: string;

  @ApiProperty({
    example: 'Phantom Black',
    description: 'Vehicle color',
  })
  @IsString()
  @IsNotEmpty()
  color: string;

  @ApiPropertyOptional({
    example: 'MALC1304910394019',
    description: 'Chassis identification number',
  })
  @IsOptional()
  @IsString()
  chassisNumber?: string;

  @ApiPropertyOptional({
    example: 'ENG92019401',
    description: 'Engine identification number',
  })
  @IsOptional()
  @IsString()
  engineNumber?: string;

  @ApiPropertyOptional({
    example: 3500,
    description: 'Daily rental rate in NPR',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  dailyRate?: number;

  @ApiPropertyOptional({
    example: 500,
    description: 'Hourly rental rate in NPR',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  hourlyRate?: number;

  @ApiPropertyOptional({
    enum: VehicleStatus,
    default: VehicleStatus.AVAILABLE,
  })
  @IsOptional()
  @IsEnum(VehicleStatus)
  status?: VehicleStatus;

  @ApiPropertyOptional({
    example: 'https://res.cloudinary.com/autorent-cloud/image/upload/creta.jpg',
    description: 'Vehicle photo image URL',
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;
}
