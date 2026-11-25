import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';
import { Role } from '../../common/enums/roles.enum';

export class RegisterDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Unique user email address',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'Full name of the user',
  })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({
    example: '+9779841234567',
    description: 'Contact phone number',
  })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({
    example: 'SecurePass123!',
    description: 'Account password',
    minLength: 6,
    writeOnly: true,
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({
    enum: Role,
    example: Role.USER,
    description: 'Role assigned to the user',
  })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
