import { Controller, Get, Patch, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { Auth } from '../auth/decorators/auth.decorator';
import { Role } from '../common/enums/roles.enum';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';

@ApiTags('Admin')
@Auth(Role.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get administrative dashboard statistics' })
  getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get administrative dashboard statistics (alias)' })
  getStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('users')
  @ApiOperation({ summary: 'Get list of system users' })
  getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @Patch('users/:id/role')
  @ApiOperation({ summary: 'Update user global role' })
  updateUserRole(
    @Param('id') userId: string,
    @Body() dto: UpdateUserRoleDto,
  ) {
    return this.adminService.updateUserRole(userId, dto.role);
  }

  @Get('billing')
  @ApiOperation({ summary: 'Get all platform billing transactions and payments' })
  getAllPayments() {
    return this.adminService.getAllPayments();
  }

  @Get('logs')
  @ApiOperation({ summary: 'Get platform audit logs' })
  getAuditLogs() {
    return this.adminService.getAuditLogs();
  }

  @Get('settings')
  @ApiOperation({ summary: 'Get platform system settings' })
  getSystemSettings() {
    return this.adminService.getSystemSettings();
  }

  @Patch('settings')
  @ApiOperation({ summary: 'Update platform system settings' })
  updateSystemSettings(@Body() settings: any) {
    return this.adminService.updateSystemSettings(settings);
  }
}
