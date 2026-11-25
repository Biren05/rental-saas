import { IsNotEmpty, IsString } from 'class-validator';

export class CreateFleetDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
