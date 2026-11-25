import { IsNotEmpty, IsString } from 'class-validator';

export class ParkVehicleDto {
  @IsString()
  @IsNotEmpty()
  vehicleId: string;

  @IsString()
  @IsNotEmpty()
  spotName: string;
}
