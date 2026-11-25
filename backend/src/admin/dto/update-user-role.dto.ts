import { IsEnum } from 'class-validator';
import { Role } from '../../common/enums/roles.enum';

export class UpdateUserRoleDto {
  @IsEnum(Role)
  role: Role;
}
