import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../notifications/email/email.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { PublicCreateBookingDto } from './dto/public-create-booking.dto';
import { BookingStatus, VehicleStatus, TenantRole, VehicleType, PaymentMethod, PaymentStatus } from '@prisma/client';
import { RecordTenantPaymentDto } from './dto/record-tenant-payment.dto';
import { SaveInspectionDto, InspectionStage } from './dto/save-inspection.dto';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class RentalsService {
  private readonly logger = new Logger(RentalsService.name);
  private readonly otpFailedAttempts = new Map<string, { count: number; lockedUntil: number }>();

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private jwtService: JwtService,
  ) {}

  async createBooking(tenantId: string, currentUserId: string, dto: CreateBookingDto) {
    const vehicle = await this.prisma.vehicle.findFirst({
      where: { id: dto.vehicleId, tenantId },
    });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found in this tenant fleet');
    }

    if (vehicle.status === VehicleStatus.MAINTENANCE) {
      throw new BadRequestException('Vehicle is currently under maintenance and cannot be rented');
    }

    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);

    if (end <= start) {
      throw new BadRequestException('End date must be after start date');
    }

    // Check overlapping bookings
    const overlapping = await this.prisma.rentalBooking.findFirst({
      where: {
        vehicleId: dto.vehicleId,
        status: { in: [BookingStatus.CONFIRMED, BookingStatus.ACTIVE] },
        OR: [
          {
            startDate: { lte: end },
            endDate: { gte: start },
          },
        ],
      },
    });

    if (overlapping) {
      throw new ConflictException('Vehicle is already booked for the selected time range');
    }

    // Duration calculation in days
    const durationDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    const dailyRate = vehicle.dailyRate || 2500;
    const totalAmount = durationDays * dailyRate;

    const customerId = dto.customerId || currentUserId;

    return this.prisma.rentalBooking.create({
      data: {
        tenantId,
        vehicleId: dto.vehicleId,
        customerId,
        startDate: start,
        endDate: end,
        totalAmount,
        depositAmount: dto.depositAmount || 0,
        status: BookingStatus.PENDING,
        pickupLocation: dto.pickupLocation,
        returnLocation: dto.returnLocation,
        citizenshipUrl: dto.citizenshipUrl,
        bankChequeUrl: dto.bankChequeUrl,
        drivingLicenseUrl: dto.drivingLicenseUrl,
        documentUrl: dto.citizenshipUrl || dto.drivingLicenseUrl || dto.bankChequeUrl,
      },
      include: {
        vehicle: true,
        customer: {
          select: { id: true, fullName: true, email: true, phone: true },
        },
      },
    });
  }

  async getTenantBookings(tenantId: string, status?: BookingStatus) {
    return this.prisma.rentalBooking.findMany({
      where: {
        tenantId,
        ...(status ? { status } : {}),
      },
      include: {
        vehicle: true,
        customer: {
          select: { id: true, fullName: true, email: true, phone: true },
        },
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getBookingById(tenantId: string, bookingId: string) {
    const booking = await this.prisma.rentalBooking.findFirst({
      where: { id: bookingId, tenantId },
      include: {
        vehicle: true,
        customer: {
          select: { id: true, fullName: true, email: true, phone: true },
        },
        payments: true,
      },
    });

    if (!booking) {
      throw new NotFoundException('Rental booking not found');
    }

    return booking;
  }

  async updateBookingStatus(tenantId: string, bookingId: string, status: BookingStatus) {
    const booking = await this.getBookingById(tenantId, bookingId);

    // Update vehicle status based on booking status
    if (status === BookingStatus.ACTIVE) {
      await this.prisma.vehicle.update({
        where: { id: booking.vehicleId },
        data: { status: VehicleStatus.RENTED },
      });
    } else if (
      status === BookingStatus.COMPLETED ||
      status === BookingStatus.CANCELLED
    ) {
      await this.prisma.vehicle.update({
        where: { id: booking.vehicleId },
        data: { status: VehicleStatus.AVAILABLE },
      });
    }

    return this.prisma.rentalBooking.update({
      where: { id: bookingId },
      data: { status },
      include: { vehicle: true, customer: true },
    });
  }

  async checkAvailability(tenantId: string, startDate: string, endDate: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end <= start) {
      throw new BadRequestException('End date must be after start date');
    }

    // Find vehicles with overlapping bookings
    const bookedVehicleIds = await this.prisma.rentalBooking
      .findMany({
        where: {
          tenantId,
          status: { in: [BookingStatus.CONFIRMED, BookingStatus.ACTIVE] },
          startDate: { lte: end },
          endDate: { gte: start },
        },
        select: { vehicleId: true },
      })
      .then((rows) => rows.map((r) => r.vehicleId));

    // Return vehicles not booked and not in maintenance
    return this.prisma.vehicle.findMany({
      where: {
        tenantId,
        id: { notIn: bookedVehicleIds },
        status: { not: VehicleStatus.MAINTENANCE },
      },
      include: { qrCode: true },
    });
  }

  // ==========================================
  // PUBLIC CUSTOMER SELF-SERVICE BOOKING APIS
  // ==========================================

  async getPublicTenantInfo(slugOrDomain: string) {
    const key = (slugOrDomain || '').trim().toLowerCase();
    const tenant = await this.prisma.tenant.findFirst({
      where: {
        OR: [{ slug: key }, { domain: key }],
      },
      select: {
        id: true,
        name: true,
        slug: true,
        domain: true,
        logoUrl: true,
        address: true,
        phone: true,
        email: true,
        paymentQrUrl: true,
        esewaQrUrl: true,
        khaltiQrUrl: true,
        fonepayQrUrl: true,
        bankAccountDetails: true,
        whatsappUrl: true,
        tiktokUrl: true,
        facebookUrl: true,
        instagramUrl: true,
        status: true,
        createdAt: true,
      },
    });

    if (!tenant || tenant.status !== 'ACTIVE') {
      throw new NotFoundException('Vehicle rental company not found or currently unavailable');
    }

    return tenant;
  }

  async getPublicAvailableVehicles(
    slug: string,
    startDate?: string,
    endDate?: string,
    vehicleType?: string,
  ) {
    const tenant = await this.getPublicTenantInfo(slug);

    // Fetch active/pending bookings that are currently active or upcoming
    const activeBookings = await this.prisma.rentalBooking.findMany({
      where: {
        tenantId: tenant.id,
        status: { in: [BookingStatus.CONFIRMED, BookingStatus.ACTIVE, BookingStatus.PENDING] },
        endDate: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
      orderBy: { endDate: 'desc' },
      select: {
        id: true,
        vehicleId: true,
        startDate: true,
        endDate: true,
        status: true,
      },
    });

    const vehicles = await this.prisma.vehicle.findMany({
      where: {
        tenantId: tenant.id,
        status: { not: VehicleStatus.MAINTENANCE },
        ...(vehicleType && vehicleType !== 'ALL' ? { vehicleType: vehicleType as VehicleType } : {}),
      },
      select: {
        id: true,
        brand: true,
        model: true,
        color: true,
        vehicleType: true,
        plateNumber: true,
        dailyRate: true,
        hourlyRate: true,
        status: true,
        qrCodeUrl: true,
        imageUrl: true,
      },
      orderBy: { brand: 'asc' },
    });

    const filterStart = startDate ? new Date(startDate) : null;
    const filterEnd = endDate ? new Date(endDate) : null;
    const hasFilter = filterStart && filterEnd && filterEnd > filterStart;

    return vehicles.map((v) => {
      // Find all bookings for this vehicle
      const vBookings = activeBookings.filter((b) => b.vehicleId === v.id);

      // Check if there is any booking overlapping with the selected date range
      let conflictBooking: any = null;
      if (hasFilter) {
        conflictBooking = vBookings.find(
          (b) => new Date(b.startDate) <= filterEnd && new Date(b.endDate) >= filterStart,
        );
      } else {
        const now = new Date();
        conflictBooking = vBookings.find(
          (b) => new Date(b.startDate) <= now && new Date(b.endDate) >= now,
        );
      }

      // Find latest return date amongst bookings for this vehicle
      let latestReturnDate: Date | null = null;
      if (vBookings.length > 0) {
        const maxTime = Math.max(...vBookings.map((b) => new Date(b.endDate).getTime()));
        latestReturnDate = new Date(maxTime);
      }

      // Available from the day after return date (return date ko bholi palta) at 10:00 AM
      let nextAvailableDate: string | null = null;
      if (latestReturnDate) {
        const nextDay = new Date(latestReturnDate);
        nextDay.setDate(nextDay.getDate() + 1);
        nextDay.setHours(10, 0, 0, 0);
        nextAvailableDate = nextDay.toISOString();
      }

      const isBooked =
        !!conflictBooking ||
        v.status === VehicleStatus.RENTED ||
        v.status === VehicleStatus.RESERVED;

      return {
        ...v,
        isBooked,
        availabilityStatus: isBooked ? 'BOOKED' : 'AVAILABLE',
        currentBooking: conflictBooking
          ? {
              startDate: conflictBooking.startDate,
              endDate: conflictBooking.endDate,
              status: conflictBooking.status,
            }
          : vBookings[0]
          ? {
              startDate: vBookings[0].startDate,
              endDate: vBookings[0].endDate,
              status: vBookings[0].status,
            }
          : null,
        nextAvailableDate,
        bookedUntil: latestReturnDate ? latestReturnDate.toISOString() : null,
      };
    });
  }

  async getPublicVehicleDetails(slug: string, vehicleId: string) {
    const tenant = await this.getPublicTenantInfo(slug);

    const vehicle = await this.prisma.vehicle.findFirst({
      where: {
        id: vehicleId,
        tenantId: tenant.id,
      },
      include: {
        qrCode: true,
      },
    });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found in this rental fleet');
    }

    return vehicle;
  }

  async createPublicBooking(slug: string, dto: PublicCreateBookingDto) {
    const tenant = await this.getPublicTenantInfo(slug);

    const vehicle = await this.prisma.vehicle.findFirst({
      where: { id: dto.vehicleId, tenantId: tenant.id },
    });

    if (!vehicle) {
      throw new NotFoundException('Selected vehicle is not available in this rental fleet');
    }

    if (vehicle.status === VehicleStatus.MAINTENANCE) {
      throw new BadRequestException('This vehicle is currently undergoing scheduled maintenance');
    }

    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);

    if (end <= start) {
      throw new BadRequestException('Return date must be strictly after the pickup date');
    }

    if (!dto.citizenshipUrl || !dto.bankChequeUrl || !dto.drivingLicenseUrl) {
      throw new BadRequestException(
        'All 3 verification documents (Citizenship, Bank Cheque, and Driving License) are required.',
      );
    }

    if (
      dto.paymentType &&
      dto.paymentType !== 'PAY_ON_PICKUP' &&
      dto.paymentMethod !== PaymentMethod.CASH &&
      !dto.paymentReceiptUrl
    ) {
      throw new BadRequestException(
        'Payment receipt screenshot is required for eSewa, Khalti, or Fonepay payments.',
      );
    }

    // Pricing calculation (Base + Long-term Discount + Promo Code + Driver Option)
    const durationDays = Math.max(
      1,
      Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)),
    );
    const dailyRate = vehicle.dailyRate || 2500;
    const baseRental = durationDays * dailyRate;
    const longTermPercent = durationDays >= 30 ? 20 : durationDays >= 7 ? 10 : 0;
    const longTermDiscount = Math.round(baseRental * (longTermPercent / 100));
    const driverFee = dto.withDriver ? durationDays * 1500 : 0;

    let promoDiscount = 0;
    let appliedPromoCode: string | null = null;
    if (dto.promoCode?.trim()) {
      const promoResult = await this.evaluatePromo(
        tenant.id,
        dto.promoCode,
        durationDays,
        Math.max(0, baseRental - longTermDiscount),
      );
      if (!promoResult.valid) {
        throw new BadRequestException(promoResult.message);
      }
      promoDiscount = promoResult.discountAmount;
      appliedPromoCode = promoResult.code;
    }

    const discountAmount = longTermDiscount + promoDiscount;
    const totalAmount = Math.max(0, baseRental - discountAmount + driverFee);

    // Server-enforced deposit and payment calculation (prevents client-side amount tampering)
    let depositAmount = 0;
    let effectivePaid = 0;

    if (dto.paymentType === 'FULL') {
      depositAmount = totalAmount;
      effectivePaid = totalAmount;
    } else if (dto.paymentType === 'ADVANCE') {
      depositAmount = Math.min(2000, totalAmount);
      effectivePaid = depositAmount;
    } else {
      // PAY_ON_PICKUP
      depositAmount = 0;
      effectivePaid = 0;
    }

    // Customer Identity Resolution (find existing without mutating their account, or create guest user)
    const normalizedEmail = dto.email.trim().toLowerCase();
    const normalizedPhone = dto.phone.trim();
    const customerFullName = dto.fullName.trim();

    let customer = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: normalizedEmail }, { phone: normalizedPhone }],
      },
    });

    if (!customer) {
      const generatedTempPassword = crypto.randomUUID();
      const passwordHash = await bcrypt.hash(generatedTempPassword, 10);

      customer = await this.prisma.user.create({
        data: {
          email: normalizedEmail,
          phone: normalizedPhone,
          fullName: customerFullName,
          passwordHash,
          role: 'USER',
        },
      });
    }

    // Link customer to this tenant as CUSTOMER role if not already linked
    const existingMembership = await this.prisma.tenantUser.findUnique({
      where: {
        tenantId_userId: {
          tenantId: tenant.id,
          userId: customer.id,
        },
      },
    });

    if (!existingMembership) {
      await this.prisma.tenantUser.create({
        data: {
          tenantId: tenant.id,
          userId: customer.id,
          role: TenantRole.CUSTOMER,
        },
      });
    }

    const formattedPickup = dto.notes
      ? `${dto.pickupLocation || 'Main Hub'} (Note: ${dto.notes})`
      : dto.pickupLocation || 'Main Hub';

    // Transactional overlap check + booking creation to prevent double-booking race conditions
    const booking = await this.prisma.$transaction(async (tx) => {
      const overlapping = await tx.rentalBooking.findFirst({
        where: {
          vehicleId: dto.vehicleId,
          status: { in: [BookingStatus.CONFIRMED, BookingStatus.ACTIVE, BookingStatus.PENDING] },
          OR: [
            {
              startDate: { lte: end },
              endDate: { gte: start },
            },
          ],
        },
        orderBy: { endDate: 'desc' },
      });

      if (overlapping) {
        const nextDay = new Date(overlapping.endDate);
        nextDay.setDate(nextDay.getDate() + 1);
        throw new ConflictException(
          `This vehicle is reserved until ${new Date(overlapping.endDate).toLocaleDateString()}. You can pre-book it starting from ${nextDay.toLocaleDateString()}.`,
        );
      }

      return tx.rentalBooking.create({
        data: {
          tenantId: tenant.id,
          vehicleId: vehicle.id,
          customerId: customer.id,
          customerName: customerFullName,
          customerEmail: normalizedEmail,
          customerPhone: normalizedPhone,
          startDate: start,
          endDate: end,
          totalAmount,
          depositAmount,
          status: BookingStatus.PENDING,
          pickupLocation: formattedPickup,
          returnLocation: dto.returnLocation || 'Main Hub',
          documentUrl: dto.documentUrl || dto.citizenshipUrl || dto.drivingLicenseUrl || dto.bankChequeUrl,
          citizenshipUrl: dto.citizenshipUrl,
          bankChequeUrl: dto.bankChequeUrl,
          drivingLicenseUrl: dto.drivingLicenseUrl,
          paymentReceiptUrl: dto.paymentReceiptUrl,
          withDriver: Boolean(dto.withDriver),
          driverFee,
          discountAmount,
          promoCode: appliedPromoCode,
        },
        include: {
          vehicle: true,
          tenant: {
            select: {
              id: true,
              name: true,
              slug: true,
              phone: true,
              email: true,
              address: true,
              logoUrl: true,
            },
          },
          customer: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
            },
          },
        },
      });
    });

    // Automatically record payment in database and link to tenant statements & booking
    let createdPayment: any = null;
    if (effectivePaid > 0) {
      const paymentMethod = dto.paymentMethod || PaymentMethod.CASH;
      const generatedTxnId =
        dto.transactionId?.trim() ||
        `TXN-${paymentMethod}-${Date.now().toString().slice(-6)}`;

      const paymentNote =
        dto.paymentNote?.trim() ||
        (dto.paymentType === 'ADVANCE'
          ? `Advance booking deposit received via ${paymentMethod} (Rs. ${effectivePaid.toLocaleString()})`
          : `Full rental payment received via ${paymentMethod}`);

      createdPayment = await this.prisma.payment.create({
        data: {
          userId: customer.id,
          tenantId: tenant.id,
          bookingId: booking.id,
          amount: Math.min(effectivePaid, totalAmount),
          paymentMethod,
          status: PaymentStatus.SUCCESS,
          transactionId: generatedTxnId,
          receiptUrl: dto.paymentReceiptUrl || undefined,
          note: paymentNote,
        },
      });
    }

    const paidAmount = effectivePaid;
    const dueAmount = Math.max(0, totalAmount - paidAmount);

    // Automatically dispatch booking receipt to customer's email
    this.sendReceiptToCustomerEmail(slug, booking.id).catch((emailErr) => {
      this.logger.warn(`Could not dispatch email receipt for booking ${booking.id}: ${emailErr?.message}`);
    });

    return {
      message: 'Rental booking successfully requested. Awaiting confirmation.',
      booking,
      payment: createdPayment,
      summary: {
        durationDays,
        dailyRate,
        totalAmount,
        depositAmount,
        paidAmount,
        dueAmount,
        paymentMethod: effectivePaid > 0 ? (dto.paymentMethod || PaymentMethod.CASH) : null,
        paymentStatus: dueAmount === 0 ? 'PAID' : (paidAmount > 0 ? 'PARTIAL' : 'UNPAID'),
      },
    };
  }

  async getPublicBookingConfirmation(slug: string, bookingId: string) {
    const tenant = await this.getPublicTenantInfo(slug);

    const booking = await this.prisma.rentalBooking.findFirst({
      where: {
        id: bookingId,
        tenantId: tenant.id,
      },
      include: {
        vehicle: true,
        tenant: {
          select: {
            id: true,
            name: true,
            slug: true,
            phone: true,
            email: true,
            address: true,
            logoUrl: true,
          },
        },
        customer: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
          },
        },
        payments: {
          where: { status: PaymentStatus.SUCCESS },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking reservation not found');
    }

    const durationDays = Math.max(
      1,
      Math.ceil(
        (new Date(booking.endDate).getTime() - new Date(booking.startDate).getTime()) /
          (1000 * 60 * 60 * 24),
      ),
    );

    const paidAmount = booking.payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
    const dueAmount = Math.max(0, booking.totalAmount - paidAmount);

    return {
      booking,
      summary: {
        durationDays,
        dailyRate: booking.vehicle.dailyRate || 2500,
        totalAmount: booking.totalAmount,
        depositAmount: booking.depositAmount,
        paidAmount,
        dueAmount,
        paymentMethod: booking.payments?.[0]?.paymentMethod || null,
        paymentStatus: dueAmount === 0 ? 'PAID' : (paidAmount > 0 ? 'PARTIAL' : 'UNPAID'),
        latestPayment: booking.payments?.[0] || null,
      },
    };
  }

  async sendReceiptToCustomerEmail(slug: string, bookingId: string) {
    const confirmation = await this.getPublicBookingConfirmation(slug, bookingId);
    const { booking, summary } = confirmation;
    const { vehicle, tenant, customer } = booking;

    const effectiveEmail = (booking as any).customerEmail || customer?.email;
    const effectiveName = (booking as any).customerName || customer?.fullName || 'Valued Customer';
    const effectivePhone = (booking as any).customerPhone || customer?.phone || '';

    if (!effectiveEmail) {
      this.logger.warn(`Cannot send receipt: customer has no email on booking ${bookingId}`);
      return { success: false, message: 'Customer has no email address associated with this reservation.' };
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const confirmationUrl = `${frontendUrl}/rent/${slug}/confirmation/${booking.id}`;

    try {
      await this.emailService.sendBookingReceiptEmail({
        to: effectiveEmail,
        customerName: effectiveName,
        customerPhone: effectivePhone,
        bookingId: booking.id,
        tenantName: tenant.name,
        tenantPhone: tenant.phone,
        tenantEmail: tenant.email,
        tenantAddress: tenant.address,
        vehicleBrand: vehicle.brand,
        vehicleModel: vehicle.model,
        vehiclePlate: vehicle.plateNumber,
        vehicleColor: vehicle.color,
        vehicleType: vehicle.vehicleType,
        startDate: booking.startDate,
        endDate: booking.endDate,
        pickupLocation: booking.pickupLocation,
        returnLocation: booking.returnLocation,
        durationDays: summary.durationDays,
        dailyRate: summary.dailyRate,
        totalAmount: summary.totalAmount,
        paidAmount: summary.paidAmount,
        dueAmount: summary.dueAmount,
        paymentMethod: summary.paymentMethod,
        transactionId: summary.latestPayment?.transactionId || null,
        hasCitizenship: !!(booking.citizenshipUrl || booking.documentUrl),
        hasBankCheque: !!booking.bankChequeUrl,
        hasDrivingLicense: !!booking.drivingLicenseUrl,
        hasPaymentReceipt: !!booking.paymentReceiptUrl,
        paymentReceiptUrl: booking.paymentReceiptUrl || null,
        confirmationUrl,
      });

      this.logger.log(`Booking receipt email successfully sent to ${customer.email} for booking ${booking.id}`);
      return { success: true, email: customer.email, message: `Receipt sent to ${customer.email}` };
    } catch (err: any) {
      this.logger.error(`Failed to send receipt to ${customer.email}: ${err?.message}`);
      return { success: false, error: err?.message };
    }
  }

  async updateBookingPaymentReceipt(slug: string, bookingId: string, paymentReceiptUrl: string) {
    const cleanReceiptUrl = (paymentReceiptUrl || '').trim();
    const isValidReceiptUrl =
      /^https?:\/\/[^\s]+$/i.test(cleanReceiptUrl) ||
      /^\/uploads\/[a-zA-Z0-9._-]+$/.test(cleanReceiptUrl);

    if (!cleanReceiptUrl || !isValidReceiptUrl) {
      throw new BadRequestException('A valid payment receipt URL is required.');
    }

    const tenant = await this.getPublicTenantInfo(slug);
    const booking = await this.prisma.rentalBooking.findFirst({
      where: { id: bookingId, tenantId: tenant.id },
      include: { payments: true },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.paymentReceiptUrl) {
      throw new BadRequestException(
        'A payment receipt has already been attached to this booking.',
      );
    }

    const updated = await this.prisma.rentalBooking.update({
      where: { id: booking.id },
      data: { paymentReceiptUrl: cleanReceiptUrl },
      include: {
        vehicle: true,
        tenant: true,
        customer: true,
        payments: true,
      },
    });

    // Also link receipt to latest payment record if present
    if (booking.payments && booking.payments.length > 0) {
      await this.prisma.payment
        .update({
          where: { id: booking.payments[0].id },
          data: { receiptUrl: cleanReceiptUrl },
        })
        .catch(() => null);
    }

    return {
      success: true,
      message: 'Payment proof screenshot successfully registered.',
      paymentReceiptUrl,
      booking: updated,
    };
  }

  // ==========================================
  // PAYMENTS & UDHARO (CREDIT LEDGER) METHODS
  // ==========================================

  async getTenantPayments(tenantId: string) {
    return this.prisma.payment.findMany({
      where: {
        OR: [
          { tenantId },
          { booking: { tenantId } },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
          },
        },
        booking: {
          include: {
            vehicle: {
              select: {
                id: true,
                brand: true,
                model: true,
                plateNumber: true,
                imageUrl: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getTenantPaymentStats(tenantId: string) {
    const bookings = await this.prisma.rentalBooking.findMany({
      where: {
        tenantId,
        status: { not: BookingStatus.CANCELLED },
      },
      include: {
        payments: {
          where: { status: PaymentStatus.SUCCESS },
        },
      },
    });

    const tenantPayments = await this.prisma.payment.findMany({
      where: {
        OR: [
          { tenantId },
          { booking: { tenantId } },
        ],
        status: PaymentStatus.SUCCESS,
      },
    });

    let totalBilled = 0;
    let totalCashCollected = 0;
    let totalOnlineCollected = 0;

    for (const b of bookings) {
      totalBilled += b.totalAmount || 0;
    }

    for (const p of tenantPayments) {
      if (p.paymentMethod === PaymentMethod.CASH) {
        totalCashCollected += p.amount;
      } else {
        totalOnlineCollected += p.amount;
      }
    }

    const totalCollected = totalCashCollected + totalOnlineCollected;
    const totalUdharo = Math.max(0, totalBilled - totalCollected);

    return {
      totalBilled,
      totalCollected,
      totalCashCollected,
      totalOnlineCollected,
      totalUdharo,
      transactionCount: tenantPayments.length,
      activeBookingsCount: bookings.length,
    };
  }

  async getTenantUdharoLedger(tenantId: string) {
    const bookings = await this.prisma.rentalBooking.findMany({
      where: {
        tenantId,
        status: { not: BookingStatus.CANCELLED },
      },
      include: {
        customer: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
          },
        },
        vehicle: {
          select: {
            id: true,
            brand: true,
            model: true,
            plateNumber: true,
            imageUrl: true,
          },
        },
        payments: {
          where: { status: PaymentStatus.SUCCESS },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return bookings.map((b) => {
      const paidAmount = b.payments.reduce((sum, p) => sum + p.amount, 0);
      const dueAmount = Math.max(0, b.totalAmount - paidAmount);
      let paymentStatus: 'PAID' | 'PARTIAL' | 'UNPAID';

      if (dueAmount === 0) {
        paymentStatus = 'PAID';
      } else if (paidAmount > 0) {
        paymentStatus = 'PARTIAL';
      } else {
        paymentStatus = 'UNPAID';
      }

      return {
        id: b.id,
        bookingId: b.id,
        customer: {
          ...b.customer,
          fullName: (b as any).customerName || b.customer?.fullName,
          email: (b as any).customerEmail || b.customer?.email,
          phone: (b as any).customerPhone || b.customer?.phone,
        },
        vehicle: b.vehicle,
        startDate: b.startDate,
        endDate: b.endDate,
        bookingStatus: b.status,
        totalAmount: b.totalAmount,
        paidAmount,
        dueAmount,
        paymentStatus,
        lastPaymentAt: b.payments[0]?.createdAt || null,
        payments: b.payments,
      };
    }).sort((a, b) => b.dueAmount - a.dueAmount); // Most outstanding first
  }

  async recordTenantPayment(tenantId: string, dto: RecordTenantPaymentDto) {
    const booking = await this.prisma.rentalBooking.findFirst({
      where: { id: dto.bookingId, tenantId },
      include: {
        customer: true,
        vehicle: true,
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking reservation not found in this organization');
    }

    if (dto.amount <= 0) {
      throw new BadRequestException('Payment amount must be greater than zero');
    }

    const txnId =
      dto.transactionId?.trim() ||
      `TXN-${dto.paymentMethod}-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const payment = await this.prisma.payment.create({
      data: {
        tenantId,
        bookingId: booking.id,
        userId: booking.customerId,
        amount: dto.amount,
        paymentMethod: dto.paymentMethod,
        status: PaymentStatus.SUCCESS,
        transactionId: txnId,
        note: dto.note || undefined,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
          },
        },
        booking: {
          include: {
            vehicle: {
              select: {
                id: true,
                brand: true,
                model: true,
                plateNumber: true,
              },
            },
          },
        },
      },
    });

    return payment;
  }

  async saveBookingInspection(
    tenantId: string,
    bookingId: string,
    dto: SaveInspectionDto,
  ) {
    const booking = await this.prisma.rentalBooking.findFirst({
      where: { id: bookingId, tenantId },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found in this organization');
    }

    if (dto.stage === InspectionStage.PICKUP) {
      return this.prisma.rentalBooking.update({
        where: { id: booking.id },
        data: {
          pickupOdometerKm: dto.odometerKm ?? booking.pickupOdometerKm,
          pickupFuelLevel: dto.fuelLevel ?? booking.pickupFuelLevel,
          pickupNotes: dto.notes ?? booking.pickupNotes,
          pickupPhotos: dto.photos ?? booking.pickupPhotos,
          pickupInspectedAt: new Date(),
        },
      });
    }

    const previousDamage = Number(booking.returnDamageFee || 0);
    const nextDamage = Number(dto.damageFee ?? previousDamage);
    const damageDelta = nextDamage - previousDamage;

    return this.prisma.rentalBooking.update({
      where: { id: booking.id },
      data: {
        returnOdometerKm: dto.odometerKm ?? booking.returnOdometerKm,
        returnFuelLevel: dto.fuelLevel ?? booking.returnFuelLevel,
        returnNotes: dto.notes ?? booking.returnNotes,
        returnPhotos: dto.photos ?? booking.returnPhotos,
        returnDamageFee: nextDamage,
        totalAmount: Math.max(0, Number(booking.totalAmount || 0) + damageDelta),
        returnInspectedAt: new Date(),
      },
    });
  }

  private async getCustomerSavedDocuments(userId: string, email: string) {
    const latestDocBooking = await this.prisma.rentalBooking.findFirst({
      where: {
        OR: [{ customerId: userId }, { customerEmail: email }],
        AND: [
          {
            OR: [
              { citizenshipUrl: { not: null } },
              { drivingLicenseUrl: { not: null } },
              { bankChequeUrl: { not: null } },
            ],
          },
        ],
      },
      orderBy: { createdAt: 'desc' },
      select: {
        citizenshipUrl: true,
        drivingLicenseUrl: true,
        bankChequeUrl: true,
      },
    });

    return {
      citizenshipUrl: latestDocBooking?.citizenshipUrl || null,
      drivingLicenseUrl: latestDocBooking?.drivingLicenseUrl || null,
      bankChequeUrl: latestDocBooking?.bankChequeUrl || null,
    };
  }

  async requestCustomerOtp(slug: string, email: string) {
    const tenant = await this.getPublicTenantInfo(slug);
    const normalizedEmail = (email || '').trim().toLowerCase();

    if (!normalizedEmail || !normalizedEmail.includes('@')) {
      throw new BadRequestException('Please provide a valid email address.');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    const existingBooking = !existingUser
      ? await this.prisma.rentalBooking.findFirst({
          where: { customerEmail: normalizedEmail },
        })
      : null;

    if (!existingUser && !existingBooking) {
      return {
        sent: false,
        notFound: true,
        message:
          'No previous bookings found for this email. You can book directly as a guest!',
      };
    }

    // 60-second cooldown per email to prevent OTP spam
    const recentOtp = await this.prisma.customerOtp.findFirst({
      where: {
        email: normalizedEmail,
        used: false,
        createdAt: { gt: new Date(Date.now() - 60 * 1000) },
      },
    });
    if (recentOtp) {
      throw new BadRequestException(
        'Please wait 60 seconds before requesting another verification code.',
      );
    }

    // Invalidate any previous unused OTPs for this email
    await this.prisma.customerOtp.updateMany({
      where: { email: normalizedEmail, used: false },
      data: { used: true },
    });

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await this.prisma.customerOtp.create({
      data: {
        email: normalizedEmail,
        code: otpCode,
        expiresAt,
      },
    });

    await this.emailService.sendCustomerOtpEmail(
      normalizedEmail,
      otpCode,
      tenant.name,
    );

    return {
      sent: true,
      notFound: false,
      message: `A 6-digit verification code has been sent to ${normalizedEmail}.`,
    };
  }

  async verifyCustomerOtp(slug: string, email: string, code: string) {
    await this.getPublicTenantInfo(slug);
    const normalizedEmail = (email || '').trim().toLowerCase();
    const normalizedCode = (code || '').trim();

    if (!normalizedEmail || !normalizedCode) {
      throw new BadRequestException('Email and verification code are required.');
    }

    const attemptState = this.otpFailedAttempts.get(normalizedEmail);
    if (attemptState && attemptState.lockedUntil > Date.now()) {
      throw new UnauthorizedException(
        'Too many invalid attempts. Please request a new OTP after 10 minutes.',
      );
    }

    const otpRecord = await this.prisma.customerOtp.findFirst({
      where: {
        email: normalizedEmail,
        code: normalizedCode,
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) {
      const nextCount = (attemptState?.count || 0) + 1;
      if (nextCount >= 5) {
        this.otpFailedAttempts.set(normalizedEmail, {
          count: nextCount,
          lockedUntil: Date.now() + 10 * 60 * 1000,
        });
        await this.prisma.customerOtp.updateMany({
          where: { email: normalizedEmail, used: false },
          data: { used: true },
        });
      } else {
        this.otpFailedAttempts.set(normalizedEmail, {
          count: nextCount,
          lockedUntil: 0,
        });
      }
      throw new UnauthorizedException('Invalid or expired verification code.');
    }

    this.otpFailedAttempts.delete(normalizedEmail);

    await this.prisma.customerOtp.update({
      where: { id: otpRecord.id },
      data: { used: true },
    });

    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Customer profile not found.');
    }

    const savedDocuments = await this.getCustomerSavedDocuments(
      user.id,
      user.email,
    );

    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      type: 'CUSTOMER_PORTAL',
    });

    return {
      token,
      customer: user,
      savedDocuments,
    };
  }

  async getCustomerPortal(slug: string, authHeader?: string) {
    const tenant = await this.getPublicTenantInfo(slug);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Customer session token is missing.');
    }

    const token = authHeader.slice(7).trim();
    let payload: { sub: string; email: string; type?: string };

    try {
      payload = this.jwtService.verify(token);
    } catch {
      throw new UnauthorizedException('Your session has expired. Please verify with OTP again.');
    }

    if (payload.type !== 'CUSTOMER_PORTAL' || !payload.sub) {
      throw new UnauthorizedException('Invalid customer session token.');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Customer account not found.');
    }

    const savedDocuments = await this.getCustomerSavedDocuments(
      user.id,
      user.email,
    );

    const bookings = await this.prisma.rentalBooking.findMany({
      where: {
        tenantId: tenant.id,
        OR: [{ customerId: user.id }, { customerEmail: user.email }],
      },
      include: {
        vehicle: {
          select: {
            id: true,
            brand: true,
            model: true,
            plateNumber: true,
            vehicleType: true,
            dailyRate: true,
            imageUrl: true,
          },
        },
        payments: {
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedBookings = bookings.map((b) => {
      const durationDays = Math.max(
        1,
        Math.ceil(
          (new Date(b.endDate).getTime() - new Date(b.startDate).getTime()) /
            (1000 * 60 * 60 * 24),
        ),
      );
      const paidAmount = b.payments
        .filter((p) => p.status === PaymentStatus.SUCCESS)
        .reduce((acc, p) => acc + p.amount, 0);
      const dueAmount = Math.max(0, b.totalAmount - paidAmount);

      return {
        ...b,
        summary: {
          durationDays,
          totalAmount: b.totalAmount,
          paidAmount,
          dueAmount,
        },
      };
    });

    return {
      customer: user,
      savedDocuments,
      bookings: formattedBookings,
    };
  }

  private async evaluatePromo(
    tenantId: string,
    rawCode: string,
    durationDays: number,
    taxableBase: number,
  ) {
    const code = (rawCode || '').trim().toUpperCase();
    if (!code) {
      return { valid: false, code: '', discountPercent: 0, discountAmount: 0, message: 'Please enter a promo code.' };
    }

    const promo = await this.prisma.promoCode.findUnique({
      where: { tenantId_code: { tenantId, code } },
    });

    if (!promo || !promo.isActive) {
      return { valid: false, code, discountPercent: 0, discountAmount: 0, message: 'Invalid or inactive promo code.' };
    }

    if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) {
      return { valid: false, code, discountPercent: 0, discountAmount: 0, message: 'This promo code has expired.' };
    }

    if (durationDays < promo.minDays) {
      return {
        valid: false,
        code,
        discountPercent: 0,
        discountAmount: 0,
        message: `This promo requires at least ${promo.minDays} rental day(s).`,
      };
    }

    let discountAmount = Math.round(taxableBase * (promo.discountPercent / 100));
    if (promo.maxDiscount && promo.maxDiscount > 0) {
      discountAmount = Math.min(discountAmount, promo.maxDiscount);
    }

    return {
      valid: true,
      code: promo.code,
      discountPercent: promo.discountPercent,
      discountAmount,
      message: `${promo.code} applied (${promo.discountPercent}% off)!`,
    };
  }

  async validatePublicPromo(
    slug: string,
    code: string,
    durationDays: number,
    baseAmount: number,
  ) {
    const tenant = await this.getPublicTenantInfo(slug);
    return this.evaluatePromo(tenant.id, code, durationDays, baseAmount);
  }

  async getTenantPromos(tenantId: string) {
    return this.prisma.promoCode.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createTenantPromo(
    tenantId: string,
    data: {
      code: string;
      discountPercent: number;
      maxDiscount?: number;
      minDays?: number;
      expiresAt?: string;
    },
  ) {
    const normalizedCode = (data.code || '').trim().toUpperCase();
    if (!normalizedCode) {
      throw new BadRequestException('Promo code is required.');
    }

    const percent = Math.min(90, Math.max(1, Number(data.discountPercent || 10)));
    return this.prisma.promoCode.create({
      data: {
        tenantId,
        code: normalizedCode,
        discountPercent: percent,
        maxDiscount: data.maxDiscount ? Number(data.maxDiscount) : null,
        minDays: data.minDays ? Math.max(1, Number(data.minDays)) : 1,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      },
    });
  }

  async deleteTenantPromo(tenantId: string, promoId: string) {
    const existing = await this.prisma.promoCode.findFirst({
      where: { id: promoId, tenantId },
    });
    if (!existing) {
      throw new NotFoundException('Promo code not found.');
    }
    await this.prisma.promoCode.delete({ where: { id: promoId } });
    return { deleted: true };
  }

  async getTenantOperationalAlerts(tenantId: string) {
    const now = new Date();
    const soonThreshold = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000);

    const [overdueRaw, docsRaw, insuranceRaw, remindersRaw] = await Promise.all([
      this.prisma.rentalBooking.findMany({
        where: {
          tenantId,
          status: { in: [BookingStatus.ACTIVE, BookingStatus.CONFIRMED] },
          endDate: { lt: now },
        },
        include: {
          vehicle: {
            select: { id: true, brand: true, model: true, plateNumber: true, dailyRate: true },
          },
          customer: {
            select: { id: true, fullName: true, phone: true, email: true },
          },
        },
        orderBy: { endDate: 'asc' },
      }),
      this.prisma.document.findMany({
        where: {
          vehicle: { tenantId },
          expiryDate: { not: null, lte: soonThreshold },
        },
        include: {
          vehicle: { select: { id: true, brand: true, model: true, plateNumber: true } },
        },
        orderBy: { expiryDate: 'asc' },
      }),
      this.prisma.insurancePolicy.findMany({
        where: {
          vehicle: { tenantId },
          endDate: { lte: soonThreshold },
        },
        include: {
          vehicle: { select: { id: true, brand: true, model: true, plateNumber: true } },
        },
        orderBy: { endDate: 'asc' },
      }),
      this.prisma.reminder.findMany({
        where: {
          vehicle: { tenantId },
          isCompleted: false,
          dueDate: { lte: soonThreshold },
        },
        include: {
          vehicle: { select: { id: true, brand: true, model: true, plateNumber: true } },
        },
        orderBy: { dueDate: 'asc' },
      }),
    ]);

    const overdueBookings = overdueRaw.map((b) => {
      const hoursOverdue = Math.max(
        1,
        Math.ceil((now.getTime() - new Date(b.endDate).getTime()) / (1000 * 60 * 60)),
      );
      const hourlyRate = Math.round((b.vehicle?.dailyRate || 2500) / 12);
      const suggestedLateFee = hoursOverdue * hourlyRate;

      return {
        id: b.id,
        customerName: b.customerName || b.customer?.fullName || 'Customer',
        customerPhone: b.customerPhone || b.customer?.phone || '',
        vehicleName: `${b.vehicle?.brand || ''} ${b.vehicle?.model || ''}`.trim(),
        plateNumber: b.vehicle?.plateNumber || '',
        endDate: b.endDate,
        hoursOverdue,
        suggestedLateFee,
        status: b.status,
      };
    });

    const calcDaysLeft = (date: Date) =>
      Math.ceil((new Date(date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    const expiryAlerts = [
      ...docsRaw.map((d) => {
        const daysLeft = calcDaysLeft(d.expiryDate!);
        return {
          id: `doc-${d.id}`,
          type: 'DOCUMENT' as const,
          title: d.title,
          vehicleName: `${d.vehicle.brand} ${d.vehicle.model}`,
          plateNumber: d.vehicle.plateNumber,
          dueDate: d.expiryDate!,
          daysLeft,
          isExpired: daysLeft <= 0,
        };
      }),
      ...insuranceRaw.map((ins) => {
        const daysLeft = calcDaysLeft(ins.endDate);
        return {
          id: `ins-${ins.id}`,
          type: 'INSURANCE' as const,
          title: `Insurance (${ins.providerName})`,
          vehicleName: `${ins.vehicle.brand} ${ins.vehicle.model}`,
          plateNumber: ins.vehicle.plateNumber,
          dueDate: ins.endDate,
          daysLeft,
          isExpired: daysLeft <= 0,
        };
      }),
      ...remindersRaw.map((rem) => {
        const daysLeft = calcDaysLeft(rem.dueDate);
        return {
          id: `rem-${rem.id}`,
          type: 'SERVICING' as const,
          title: rem.title,
          vehicleName: `${rem.vehicle.brand} ${rem.vehicle.model}`,
          plateNumber: rem.vehicle.plateNumber,
          dueDate: rem.dueDate,
          daysLeft,
          isExpired: daysLeft <= 0,
        };
      }),
    ].sort((a, b) => a.daysLeft - b.daysLeft);

    return {
      overdueBookings,
      expiryAlerts,
    };
  }

  async applyLateFee(tenantId: string, bookingId: string, amount: number) {
    if (!amount || amount <= 0) {
      throw new BadRequestException('Late fee amount must be greater than zero.');
    }

    const booking = await this.prisma.rentalBooking.findFirst({
      where: { id: bookingId, tenantId },
    });
    if (!booking) {
      throw new NotFoundException('Booking not found in this organization.');
    }

    return this.prisma.rentalBooking.update({
      where: { id: booking.id },
      data: {
        totalAmount: Number(booking.totalAmount || 0) + amount,
        returnNotes: booking.returnNotes
          ? `${booking.returnNotes} | Late Fee Applied: NPR ${amount}`
          : `Late Fee Applied: NPR ${amount}`,
      },
    });
  }
}


