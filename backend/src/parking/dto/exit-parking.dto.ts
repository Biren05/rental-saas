import { IsNotEmpty, IsString } from 'class-validator';

export class ExitParkingDto {
  @IsString()
  @IsNotEmpty()
  parkingLogId: string;
}
