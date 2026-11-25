import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export enum InspectionStage {
  PICKUP = 'PICKUP',
  RETURN = 'RETURN',
}

export class SaveInspectionDto {
  @ApiProperty({ enum: InspectionStage })
  @IsEnum(InspectionStage)
  stage: InspectionStage;

  @ApiPropertyOptional({ example: 14250 })
  @IsOptional()
  @IsInt()
  @Min(0)
  odometerKm?: number;

  @ApiPropertyOptional({ example: 'FULL' })
  @IsOptional()
  @IsString()
  fuelLevel?: string;

  @ApiPropertyOptional({ example: 'Minor scratch on front left bumper. Spare tire present.' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  photos?: string[];

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  damageFee?: number;
}
