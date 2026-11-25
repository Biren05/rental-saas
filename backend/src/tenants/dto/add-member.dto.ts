import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEmail, IsEnum } from 'class-validator';
import { TenantRole } from '../../common/enums/tenant-roles.enum';

export class AddTenantMemberDto {
  @ApiProperty({ example: 'staff@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ enum: TenantRole, default: TenantRole.STAFF })
  @IsEnum(TenantRole)
  role: TenantRole;
}
