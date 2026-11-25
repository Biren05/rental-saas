import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'User email address',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'SecretPassword123!',
    description: 'User login password',
    minLength: 6,
    writeOnly: true,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
