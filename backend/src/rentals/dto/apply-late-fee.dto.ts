import { IsNumber, IsPositive } from 'class-validator';

export class ApplyLateFeeDto {
  @IsNumber()
  @IsPositive()
  amount: number;
}
