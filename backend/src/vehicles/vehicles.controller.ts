import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiHeader, ApiConsumes } from '@nestjs/swagger';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CurrentTenant } from '../common/decorators/current-tenant.decorator';
import { TenantGuard } from '../common/guards/tenant.guard';
import { CloudinaryService } from '../uploads/cloudinary.service';
import { SAFE_UPLOAD_MULTER_OPTIONS } from '../common/utils/upload-validation.util';

@ApiTags('Vehicles (Fleet & Rental)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('vehicles')
export class VehiclesController {
  constructor(
    private readonly vehiclesService: VehiclesService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post('upload-image')
  @ApiOperation({ summary: 'Upload vehicle photo to Cloudinary' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', SAFE_UPLOAD_MULTER_OPTIONS))
  async uploadVehicleImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No image file provided');
    }
    const uploadRes = await this.cloudinaryService.uploadFile(file, 'autorent/vehicles');
    return {
      imageUrl: uploadRes.url,
      publicId: uploadRes.publicId,
    };
  }

  @Post()
  @ApiOperation({ summary: 'Register a new vehicle (Personal or Tenant Fleet)' })
  create(
    @CurrentUser() user: any,
    @Body() dto: CreateVehicleDto,
    @Query('tenantId') queryTenantId?: string,
  ) {
    return this.vehiclesService.create(user.id, dto, queryTenantId, user);
  }

  @Post('tenant')
  @UseGuards(TenantGuard)
  @ApiHeader({ name: 'x-tenant-id', required: false })
  @ApiHeader({ name: 'x-tenant-slug', required: false })
  @ApiOperation({ summary: 'Add vehicle directly into active Tenant fleet (Quota Enforced)' })
  createForTenant(
    @CurrentUser('id') ownerId: string,
    @CurrentTenant('id') tenantId: string,
    @Body() dto: CreateVehicleDto,
  ) {
    return this.vehiclesService.create(ownerId, dto, tenantId);
  }

  @Get('tenant')
  @UseGuards(TenantGuard)
  @ApiHeader({ name: 'x-tenant-id', required: false })
  @ApiHeader({ name: 'x-tenant-slug', required: false })
  @ApiOperation({ summary: 'Get all vehicles belonging to the current tenant fleet' })
  findTenantVehicles(@CurrentTenant('id') tenantId: string) {
    return this.vehiclesService.findAllTenantVehicles(tenantId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all personal vehicles of current user' })
  findAll(@CurrentUser('id') ownerId: string) {
    return this.vehiclesService.findAllUserVehicles(ownerId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get vehicle by ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.vehiclesService.findOne(id, undefined, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update vehicle information' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateVehicleDto,
    @CurrentUser() user: any,
  ) {
    return this.vehiclesService.update(id, dto, undefined, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a vehicle' })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.vehiclesService.remove(id, undefined, user);
  }
}
