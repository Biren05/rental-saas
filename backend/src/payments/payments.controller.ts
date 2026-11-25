import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';

@ApiTags('Payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('initiate')
  @ApiOperation({ summary: 'Initiate payment via eSewa, Khalti, or Fonepay' })
  initiatePayment(
    @CurrentUser('id') userId: string,
    @Body() dto: InitiatePaymentDto,
  ) {
    return this.paymentsService.initiatePayment(userId, dto.amount, dto.method);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get user payment history' })
  getUserPayments(@CurrentUser('id') userId: string) {
    return this.paymentsService.getUserPayments(userId);
  }
}
