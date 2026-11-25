import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader, ApiConsumes } from '@nestjs/swagger';
import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { UpdateTenantStatusDto } from './dto/update-tenant-status.dto';
import { AddTenantMemberDto } from './dto/add-member.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { TenantGuard } from '../common/guards/tenant.guard';
import { TenantRolesGuard } from '../common/guards/tenant-roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CurrentTenant } from '../common/decorators/current-tenant.decorator';
import { TenantRoles } from '../common/decorators/tenant-roles.decorator';
import { TenantRole } from '../common/enums/tenant-roles.enum';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/roles.enum';
import { Public } from '../common/decorators/public.decorator';
import { SAFE_UPLOAD_MULTER_OPTIONS } from '../common/utils/upload-validation.util';

@ApiTags('Tenants (SaaS Organizations)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Public()
  @Post('apply/upload')
  @ApiOperation({ summary: 'Public upload of applicant business document or payment receipt' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', SAFE_UPLOAD_MULTER_OPTIONS))
  uploadApplicantDocument(@UploadedFile() file: Express.Multer.File) {
    return this.tenantsService.uploadPublicFile(file);
  }

  @Public()
  @Post('apply')
  @ApiOperation({ summary: 'Public application/registration for new rental agencies' })
  applyTenant(@Body() dto: CreateTenantDto) {
    return this.tenantsService.applyTenant(dto);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Register a new Rental Business / Tenant (Super Admin only)' })
  createTenant(@CurrentUser('id') userId: string, @Body() dto: CreateTenantDto) {
    return this.tenantsService.createTenant(userId, dto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get all registered tenants (Super Admin only)' })
  getAllTenants() {
    return this.tenantsService.getAllTenants();
  }

  @Get('my')
  @ApiOperation({ summary: 'Get all tenants current user belongs to' })
  getUserTenants(@CurrentUser('id') userId: string) {
    return this.tenantsService.getUserTenants(userId);
  }

  @Get('current')
  @UseGuards(TenantGuard)
  @ApiHeader({ name: 'x-tenant-id', required: false })
  @ApiHeader({ name: 'x-tenant-slug', required: false })
  @ApiOperation({ summary: 'Get current active tenant details' })
  getCurrentTenant(@CurrentTenant('id') tenantId: string) {
    return this.tenantsService.getTenantById(tenantId);
  }

  @Patch('current')
  @UseGuards(TenantGuard, TenantRolesGuard)
  @TenantRoles(TenantRole.OWNER, TenantRole.ADMIN)
  @ApiHeader({ name: 'x-tenant-id', required: false })
  @ApiHeader({ name: 'x-tenant-slug', required: false })
  @ApiOperation({ summary: 'Update current tenant profile & settings' })
  updateCurrentTenant(
    @CurrentTenant('id') tenantId: string,
    @Body() dto: UpdateTenantDto,
  ) {
    return this.tenantsService.updateTenant(tenantId, dto);
  }

  @Post('current/members')
  @UseGuards(TenantGuard, TenantRolesGuard)
  @TenantRoles(TenantRole.OWNER, TenantRole.ADMIN)
  @ApiHeader({ name: 'x-tenant-id', required: false })
  @ApiHeader({ name: 'x-tenant-slug', required: false })
  @ApiOperation({ summary: 'Add staff or manager to current tenant' })
  addMember(
    @CurrentTenant('id') tenantId: string,
    @Body() dto: AddTenantMemberDto,
  ) {
    return this.tenantsService.addMember(tenantId, dto);
  }

  @Delete('current/members/:userId')
  @UseGuards(TenantGuard, TenantRolesGuard)
  @TenantRoles(TenantRole.OWNER, TenantRole.ADMIN)
  @ApiHeader({ name: 'x-tenant-id', required: false })
  @ApiHeader({ name: 'x-tenant-slug', required: false })
  @ApiOperation({ summary: 'Remove a member from current tenant' })
  removeMember(
    @CurrentTenant('id') tenantId: string,
    @Param('userId') memberUserId: string,
    @CurrentUser('id') requesterUserId: string,
  ) {
    return this.tenantsService.removeMember(tenantId, memberUserId, requesterUserId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get tenant details by ID (Super Admin or Tenant Member)' })
  getTenantById(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.tenantsService.getTenantByIdForUser(id, user);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update tenant organization details (Super Admin only)' })
  updateTenant(
    @Param('id') id: string,
    @Body() dto: UpdateTenantDto,
  ) {
    return this.tenantsService.updateTenant(id, dto);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update tenant status (ACTIVE, SUSPENDED) (Super Admin only)' })
  updateTenantStatus(
    @Param('id') tenantId: string,
    @Body() dto: UpdateTenantStatusDto,
  ) {
    return this.tenantsService.updateTenantStatus(tenantId, dto.status);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete tenant organization (Super Admin only)' })
  deleteTenant(@Param('id') id: string) {
    return this.tenantsService.deleteTenant(id);
  }

  @Post(':id/documents')
  @ApiOperation({ summary: 'Upload tenant verification document to Cloudinary' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', SAFE_UPLOAD_MULTER_OPTIONS))
  async uploadTenantDocument(
    @Param('id') tenantId: string,
    @CurrentUser() user: any,
    @UploadedFile() file: Express.Multer.File,
    @Body('title') title: string,
    @Body('type') type: string,
  ) {
    await this.tenantsService.assertTenantAccess(tenantId, user);
    return this.tenantsService.uploadTenantDocument(tenantId, file, title, type);
  }

  @Get(':id/documents')
  @ApiOperation({ summary: 'Get all verification documents of a tenant' })
  async getTenantDocuments(
    @Param('id') tenantId: string,
    @CurrentUser() user: any,
  ) {
    await this.tenantsService.assertTenantAccess(tenantId, user);
    return this.tenantsService.getTenantDocuments(tenantId);
  }

  @Delete(':id/documents/:docId')
  @ApiOperation({ summary: 'Delete a tenant document from Cloudinary and DB' })
  async deleteTenantDocument(
    @Param('id') tenantId: string,
    @Param('docId') docId: string,
    @CurrentUser() user: any,
  ) {
    await this.tenantsService.assertTenantAccess(tenantId, user);
    return this.tenantsService.deleteTenantDocument(tenantId, docId);
  }
}
