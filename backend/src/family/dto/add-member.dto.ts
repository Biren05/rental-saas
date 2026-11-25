import { IsNotEmpty, IsString, IsPhoneNumber } from 'class-validator';

export class AddMemberDto {
  @IsString()
  @IsNotEmpty()
  memberName: string;

  @IsString()
  @IsNotEmpty()
  memberPhone: string;

  @IsString()
  @IsNotEmpty()
  relation: string;
}
