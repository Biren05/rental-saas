import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { QrService } from './qr.service';
import { GenerateQrDto } from './dto/generate-qr.dto';
import { ScanQrDto } from './dto/scan-qr.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('QR')
@Controller('qr')
export class QrController {
  constructor(private readonly qrService: QrService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('generate')
  @ApiOperation({ summary: 'Generate vehicle QR code' })
  generate(@Body() dto: GenerateQrDto, @CurrentUser() user: any) {
    return this.qrService.generateQrForVehicle(dto.vehicleId, user);
  }

  @Public()
  @Post('scan')
  @ApiOperation({ summary: 'Public endpoint to scan vehicle QR code' })
  scan(@Body() dto: ScanQrDto) {
    return this.qrService.scanQr(dto.code);
  }
}
