import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class FirstLoginSetPasswordDto {
  @ApiProperty({ example: 'client@company.com' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'Auto#9k2b!7' })
  @IsString()
  @IsNotEmpty({ message: 'Temporary password is required' })
  temporaryPassword: string;

  @ApiProperty({ example: 'MyNewSecurePass123!', minLength: 6 })
  @IsString()
  @MinLength(6, { message: 'New password must be at least 6 characters long' })
  newPassword: string;
}
