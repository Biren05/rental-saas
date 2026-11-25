import { Controller, Post, Body, Get, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DocumentsService } from './documents.service';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Documents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  @ApiOperation({ summary: 'Save document record' })
  create(@Body() dto: UploadDocumentDto, @CurrentUser() user: any) {
    return this.documentsService.createDocument(dto, user);
  }

  @Get('vehicle/:vehicleId')
  @ApiOperation({ summary: 'Get documents of a vehicle' })
  getVehicleDocuments(@Param('vehicleId') vehicleId: string, @CurrentUser() user: any) {
    return this.documentsService.getVehicleDocuments(vehicleId, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete document' })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.documentsService.deleteDocument(id, user);
  }
}
