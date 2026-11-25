import { IsNotEmpty, IsString } from 'class-validator';

export class AssignVehicleDto {
  @IsString()
  @IsNotEmpty()
  fleetId: string;

  @IsString()
  @IsNotEmpty()
  vehicleId: string;
}
