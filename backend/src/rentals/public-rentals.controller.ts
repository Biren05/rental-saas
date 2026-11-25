import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Headers,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiQuery, ApiConsumes } from '@nestjs/swagger';
import { RentalsService } from './rentals.service';
import { PublicCreateBookingDto } from './dto/public-create-booking.dto';
import { Public } from '../common/decorators/public.decorator';
import { CloudinaryService } from '../uploads/cloudinary.service';
import { SAFE_UPLOAD_MULTER_OPTIONS } from '../common/utils/upload-validation.util';

@ApiTags('Public Customer Rentals (Customer Self-Booking)')
@Controller('public/rentals')
@Public()
export class PublicRentalsController {
  constructor(
    private readonly rentalsService: RentalsService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Get(':slug/info')
  @ApiOperation({ summary: 'Get public tenant company info and branding' })
  getTenantInfo(@Param('slug') slug: string) {
    return this.rentalsService.getPublicTenantInfo(slug);
  }

  @Get(':slug/vehicles')
  @ApiQuery({ name: 'startDate', type: String, required: false })
  @ApiQuery({ name: 'endDate', type: String, required: false })
  @ApiQuery({ name: 'vehicleType', type: String, required: false })
  @ApiOperation({ summary: 'List available rental vehicles for a tenant with optional date filtering' })
  getAvailableVehicles(
    @Param('slug') slug: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('vehicleType') vehicleType?: string,
  ) {
    return this.rentalsService.getPublicAvailableVehicles(slug, startDate, endDate, vehicleType);
  }

  @Get(':slug/vehicles/:vehicleId')
  @ApiOperation({ summary: 'Get single vehicle details for booking' })
  getVehicleDetails(
    @Param('slug') slug: string,
    @Param('vehicleId') vehicleId: string,
  ) {
    return this.rentalsService.getPublicVehicleDetails(slug, vehicleId);
  }

  @Post(':slug/book')
  @ApiOperation({ summary: 'Customer self-service reservation submission' })
  createBooking(
    @Param('slug') slug: string,
    @Body() dto: PublicCreateBookingDto,
  ) {
    return this.rentalsService.createPublicBooking(slug, dto);
  }

  @Post(':slug/upload-document')
  @ApiOperation({ summary: 'Upload customer driving license or citizenship image' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', SAFE_UPLOAD_MULTER_OPTIONS))
  async uploadCustomerDocument(
    @Param('slug') slug: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No document image file provided');
    }
    const uploadRes = await this.cloudinaryService.uploadFile(
      file,
      `autorent/customer_docs/${slug}`,
    );
    return {
      documentUrl: uploadRes.url,
      publicId: uploadRes.publicId,
    };
  }

  @Get(':slug/bookings/:id')
  @ApiOperation({ summary: 'Get customer booking receipt and confirmation' })
  getBookingConfirmation(
    @Param('slug') slug: string,
    @Param('id') bookingId: string,
  ) {
    return this.rentalsService.getPublicBookingConfirmation(slug, bookingId);
  }

  @Post(':slug/bookings/:id/send-email')
  @ApiOperation({ summary: 'Send or resend booking receipt to customer email' })
  sendBookingReceiptEmail(
    @Param('slug') slug: string,
    @Param('id') bookingId: string,
  ) {
    return this.rentalsService.sendReceiptToCustomerEmail(slug, bookingId);
  }

  @Post(':slug/bookings/:id/payment-receipt')
  @ApiOperation({ summary: 'Upload or update payment receipt screenshot' })
  updatePaymentReceipt(
    @Param('slug') slug: string,
    @Param('id') bookingId: string,
    @Body('paymentReceiptUrl') paymentReceiptUrl: string,
  ) {
    return this.rentalsService.updateBookingPaymentReceipt(slug, bookingId, paymentReceiptUrl);
  }

  @Post(':slug/customer/request-otp')
  @ApiOperation({ summary: 'Send a 6-digit OTP to a returning customer email' })
  requestCustomerOtp(
    @Param('slug') slug: string,
    @Body('email') email: string,
  ) {
    return this.rentalsService.requestCustomerOtp(slug, email);
  }

  @Post(':slug/customer/verify-otp')
  @ApiOperation({ summary: 'Verify customer email OTP and return portal token & saved docs' })
  verifyCustomerOtp(
    @Param('slug') slug: string,
    @Body('email') email: string,
    @Body('code') code: string,
  ) {
    return this.rentalsService.verifyCustomerOtp(slug, email, code);
  }

  @Get(':slug/customer/me')
  @ApiOperation({ summary: 'Get authenticated customer profile, saved docs, and bookings for this agency' })
  getCustomerPortal(
    @Param('slug') slug: string,
    @Headers('authorization') authorization?: string,
  ) {
    return this.rentalsService.getCustomerPortal(slug, authorization);
  }

  @Post(':slug/validate-promo')
  @ApiOperation({ summary: 'Validate a promotional discount code for a rental booking' })
  validatePromoCode(
    @Param('slug') slug: string,
    @Body('code') code: string,
    @Body('durationDays') durationDays: number,
    @Body('baseAmount') baseAmount: number,
  ) {
    return this.rentalsService.validatePublicPromo(
      slug,
      code,
      Number(durationDays || 1),
      Number(baseAmount || 0),
    );
  }
}
