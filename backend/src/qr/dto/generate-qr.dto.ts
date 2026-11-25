import { IsNotEmpty, IsString } from 'class-validator';

export class GenerateQrDto {
  @IsString()
  @IsNotEmpty()
  vehicleId: string;
}
