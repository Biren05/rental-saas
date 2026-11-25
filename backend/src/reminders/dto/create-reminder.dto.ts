import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class CreateReminderDto {
  @IsString()
  @IsNotEmpty()
  vehicleId: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsDateString()
  dueDate: string;
}
