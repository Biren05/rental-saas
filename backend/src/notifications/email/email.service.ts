import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private configService: ConfigService) {
    this.initTransporter();
  }

  private initTransporter() {
    const host =
      this.configService.get<string>('mail.host') ||
      process.env.MAIL_HOST ||
      'smtp.gmail.com';
    const port = parseInt(
      this.configService.get<string>('mail.port') ||
        process.env.MAIL_PORT ||
        '465',
      10,
    );
    const secure =
      this.configService.get<boolean>('mail.secure') ??
      (port === 465 || process.env.MAIL_SECURE === 'true');
    const user =
      this.configService.get<string>('mail.user') || process.env.MAIL_USER;
    const pass =
      this.configService.get<string>('mail.pass') || process.env.MAIL_PASS;

    if (user && pass) {
      try {
        this.transporter = nodemailer.createTransport({
          host,
          port,
          secure,
          auth: {
            user,
            pass,
          },
        });
        this.logger.log(
          `Nodemailer initialized with ${user} on ${host}:${port} (secure: ${secure})`,
        );
      } catch (err: any) {
        this.logger.error(
          `Failed to initialize Nodemailer transporter: ${err.message}`,
        );
      }
    } else {
      this.logger.warn(
        'Email credentials not fully configured in environment. Emails will be logged to console only.',
      );
    }
  }

  async sendEmail(to: string, subject: string, body: string, html?: string) {
    const from =
      this.configService.get<string>('mail.from') ||
      process.env.MAIL_FROM ||
      `"AutoRent SaaS" <${process.env.MAIL_USER || 'noreply@autorent.com'}>`;

    this.logger.log(`Dispatching email to ${to}: [${subject}]`);

    if (this.transporter) {
      try {
        const info = await this.transporter.sendMail({
          from,
          to,
          subject,
          text: body,
          html: html || body.replace(/\n/g, '<br/>'),
        });
        this.logger.log(
          `Email sent successfully to ${to}. MessageId: ${info.messageId}`,
        );
        return { success: true, to, subject, messageId: info.messageId };
      } catch (err: any) {
        this.logger.error(
          `Failed to send email to ${to}: ${err.message}`,
          err.stack,
        );
        return { success: false, error: err.message };
      }
    }

    // Fallback if transporter is not available
    this.logger.log(`[SIMULATED EMAIL TO ${to}]: ${body}`);
    return { success: true, to, subject, simulated: true };
  }

  async sendTenantWelcomeEmail(
    to: string,
    ownerName: string,
    tenantName: string,
    tempPassword: string,
    loginUrl: string = 'http://localhost:3000/login',
  ) {
    const subject = `Welcome to AutoRent - Your Login Credentials for ${tenantName}`;

    const textBody = `
Hello ${ownerName},

Welcome to AutoRent SaaS! Your rental business organization '${tenantName}' has been registered.

Here are your temporary credentials to access your administrative dashboard:
Portal URL: ${loginUrl}
Email: ${to}
Temporary Password: ${tempPassword}

SECURITY NOTICE:
You will be prompted to set a new permanent password on your first sign-in. After updating your password, you will have full access to your fleet and rental operations portal.

Best regards,
AutoRent SaaS Platform Team
    `.trim();

    const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
    .card { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    .header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
    .header p { margin: 6px 0 0; font-size: 13px; opacity: 0.9; }
    .content { padding: 32px 28px; line-height: 1.6; font-size: 14px; }
    .greeting { font-size: 16px; font-weight: 600; margin-bottom: 12px; }
    .creds-box { background: #0f172a; border-radius: 12px; padding: 20px; margin: 24px 0; color: #f8fafc; font-family: monospace; font-size: 13px; border: 1px solid #1e293b; }
    .creds-row { display: flex; justify-content: space-between; margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid #1e293b; }
    .creds-row:last-child { margin-bottom: 0; padding-bottom: 0; border-bottom: none; }
    .creds-label { color: #94a3b8; font-family: sans-serif; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
    .creds-value { font-weight: bold; color: #38bdf8; word-break: break-all; }
    .password-highlight { color: #4ade80; font-size: 15px; font-weight: 800; letter-spacing: 1px; }
    .btn-container { text-align: center; margin: 28px 0; }
    .btn { display: inline-block; background: #4f46e5; color: #ffffff !important; padding: 12px 32px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 14px; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.35); }
    .notice { background: #fef3c7; border: 1px solid #fde68a; border-radius: 10px; padding: 14px 18px; font-size: 12px; color: #92400e; margin-top: 20px; }
    .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>AutoRent SaaS</h1>
      <p>Vehicle Rental & Fleet Management Cloud</p>
    </div>
    <div class="content">
      <div class="greeting">Hello ${ownerName},</div>
      <p>Welcome to <strong>AutoRent SaaS</strong>! Your rental business organization <strong>${tenantName}</strong> has been successfully registered on Nepal's multi-tenant fleet cloud platform.</p>
      
      <p>Your temporary credentials to log in to your management portal are provided below:</p>

      <div class="creds-box">
        <div class="creds-row">
          <div class="creds-label">Sign-in Email</div>
          <div class="creds-value">${to}</div>
        </div>
        <div class="creds-row">
          <div class="creds-label">Temporary Password</div>
          <div class="creds-value password-highlight">${tempPassword}</div>
        </div>
        <div class="creds-row">
          <div class="creds-label">Organization</div>
          <div class="creds-value">${tenantName}</div>
        </div>
      </div>

      <div class="btn-container">
        <a href="${loginUrl}" class="btn" target="_blank">Sign In to Agency Dashboard &rarr;</a>
      </div>

      <div class="notice">
        <strong>Security Requirement:</strong> Because this is a temporary password, you will be required to choose a secure, permanent password upon your first sign in.
      </div>
    </div>
    <div class="footer">
      Sent with care by AutoRent SaaS Platform &bull; Support: dhamib610@gmail.com
    </div>
  </div>
</body>
</html>
    `.trim();

    return this.sendEmail(to, subject, textBody, htmlBody);
  }

  async sendSubscriptionExpiryNotice(
    to: string,
    ownerName: string,
    tenantName: string,
    daysLeft: number,
    endDate: Date,
    isTrial: boolean,
    planName: string,
    renewUrl: string = 'http://localhost:3000/dashboard/subscription',
    contactEmail: string = 'dhamib610@gmail.com',
  ) {
    const isExpired = daysLeft <= 0;
    const planTypeLabel = isTrial ? '14-Day Free Trial' : `${planName} Package`;
    const subject = isExpired
      ? `[Important] AutoRent - ${planTypeLabel} for ${tenantName} has expired`
      : `[Urgent Reminder] AutoRent - ${planTypeLabel} for ${tenantName} expires in ${daysLeft} day${daysLeft === 1 ? '' : 's'}`;

    const formattedDate = new Date(endDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

    const expiryMessage = isExpired
      ? `Your AutoRent ${planTypeLabel} for '${tenantName}' has expired today. To continue using vehicle rental management and fleet tracking services without interruption, please renew your subscription or contact platform support.`
      : `Your AutoRent ${planTypeLabel} for '${tenantName}' will expire in ${daysLeft} day${daysLeft === 1 ? '' : 's'} (${formattedDate}). To avoid any service interruption, please renew your subscription on time.`;

    const textBody = `
Hello ${ownerName},

${expiryMessage}

Organization: ${tenantName}
Current Plan: ${planName} (${isTrial ? 'Trial' : 'Paid Subscription'})
Expiry Date: ${formattedDate}
Time Remaining: ${isExpired ? 'EXPIRED' : `${daysLeft} Day(s) Left`}

Renew / Upgrade Link: ${renewUrl}
Platform Support: ${contactEmail} / Phone: +977-9841000000

Best regards,
AutoRent SaaS Platform Support Team
    `.trim();

    const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
    .card { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    .header { background: ${isExpired ? 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)' : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'}; padding: 32px 24px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
    .header p { margin: 6px 0 0; font-size: 13px; opacity: 0.95; font-weight: 500; }
    .content { padding: 32px 28px; line-height: 1.6; font-size: 14px; }
    .greeting { font-size: 16px; font-weight: 600; margin-bottom: 12px; }
    .alert-banner { background: ${isExpired ? '#fef2f2' : '#fffbeb'}; border: 1px solid ${isExpired ? '#fecaca' : '#fde68a'}; border-radius: 12px; padding: 16px; margin: 18px 0; color: ${isExpired ? '#991b1b' : '#92400e'}; font-size: 13.5px; font-weight: 500; }
    .info-box { background: #0f172a; border-radius: 12px; padding: 20px; margin: 20px 0; color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto; font-size: 13px; border: 1px solid #1e293b; }
    .info-row { display: flex; justify-content: space-between; margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid #1e293b; }
    .info-row:last-child { margin-bottom: 0; padding-bottom: 0; border-bottom: none; }
    .info-label { color: #94a3b8; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
    .info-value { font-weight: bold; color: #38bdf8; }
    .days-badge { display: inline-block; padding: 3px 10px; border-radius: 9999px; font-size: 12px; font-weight: 700; background: ${isExpired ? '#ef4444' : '#f59e0b'}; color: #ffffff; }
    .btn-container { text-align: center; margin: 28px 0; }
    .btn { display: inline-block; background: ${isExpired ? '#dc2626' : '#4f46e5'}; color: #ffffff !important; padding: 12px 32px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 14px; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.35); }
    .support-note { background: #f1f5f9; border-radius: 10px; padding: 14px; font-size: 12px; color: #475569; text-align: center; }
    .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>${isExpired ? '⚠️ Subscription Expired' : '⏳ Subscription Expiring Soon'}</h1>
      <p>AutoRent Cloud Vehicle Rental Platform</p>
    </div>
    <div class="content">
      <div class="greeting">Hello ${ownerName},</div>
      
      <div class="alert-banner">
        ${expiryMessage}
      </div>

      <div class="info-box">
        <div class="info-row">
          <div class="info-label">Organization</div>
          <div class="info-value">${tenantName}</div>
        </div>
        <div class="info-row">
          <div class="info-label">Current Plan</div>
          <div class="info-value">${planName} (${isTrial ? '14-Day Trial' : 'Subscribed'})</div>
        </div>
        <div class="info-row">
          <div class="info-label">Expiry Date</div>
          <div class="info-value">${formattedDate}</div>
        </div>
        <div class="info-row">
          <div class="info-label">Status</div>
          <div class="info-value">
            <span class="days-badge">${isExpired ? 'EXPIRED' : `${daysLeft} DAY${daysLeft === 1 ? '' : 'S'} REMAINING`}</span>
          </div>
        </div>
      </div>

      <div class="btn-container">
        <a href="${renewUrl}" class="btn" target="_blank">Renew / Upgrade Plan Now &rarr;</a>
      </div>

      <div class="support-note">
        If you have any questions or need assistance, please contact our support team:<br/>
        <strong>Email:</strong> ${contactEmail} &bull; <strong>Fonepay / eSewa / Khalti QR available in portal</strong>
      </div>
    </div>
    <div class="footer">
      Sent by AutoRent SaaS Notification System &bull; Keeping Your Rental Business Moving
    </div>
  </div>
</body>
</html>
    `.trim();

    return this.sendEmail(to, subject, textBody, htmlBody);
  }

  async sendBookingReceiptEmail(params: {
    to: string;
    customerName: string;
    customerPhone?: string | null;
    bookingId: string;
    tenantName: string;
    tenantPhone?: string | null;
    tenantEmail?: string | null;
    tenantAddress?: string | null;
    vehicleBrand: string;
    vehicleModel: string;
    vehiclePlate: string;
    vehicleColor?: string | null;
    vehicleType?: string | null;
    startDate: string | Date;
    endDate: string | Date;
    pickupLocation?: string | null;
    returnLocation?: string | null;
    durationDays: number;
    dailyRate: number;
    totalAmount: number;
    paidAmount: number;
    dueAmount: number;
    paymentMethod?: string | null;
    transactionId?: string | null;
    hasCitizenship: boolean;
    hasBankCheque: boolean;
    hasDrivingLicense: boolean;
    hasPaymentReceipt?: boolean;
    paymentReceiptUrl?: string | null;
    confirmationUrl?: string;
  }) {
    const {
      to,
      customerName,
      customerPhone,
      bookingId,
      tenantName,
      tenantPhone,
      tenantEmail,
      tenantAddress,
      vehicleBrand,
      vehicleModel,
      vehiclePlate,
      vehicleColor,
      vehicleType,
      startDate,
      endDate,
      pickupLocation,
      returnLocation,
      durationDays,
      dailyRate,
      totalAmount,
      paidAmount,
      dueAmount,
      paymentMethod,
      transactionId,
      hasCitizenship,
      hasBankCheque,
      hasDrivingLicense,
      hasPaymentReceipt,
      paymentReceiptUrl,
      confirmationUrl,
    } = params;

    const shortId = bookingId.slice(0, 8).toUpperCase();
    const subject = `[Receipt] Booking Confirmed for ${vehicleBrand} ${vehicleModel} (#BK-${shortId}) - ${tenantName}`;

    const startDateFormatted = new Date(startDate).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
    const endDateFormatted = new Date(endDate).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    const isFullyPaid = dueAmount === 0;
    const isPartial = paidAmount > 0 && dueAmount > 0;
    const paymentStatusBadge = isFullyPaid
      ? 'Fully Paid'
      : isPartial
      ? `Advance Deposited (${paymentMethod || 'Online'})`
      : 'Pay on Pickup';

    const textBody = `
Hello ${customerName},

Your vehicle reservation with ${tenantName} has been confirmed!

--- RESERVATION RECEIPT VOUCHER ---
Booking Ref: #BK-${shortId}
Customer: ${customerName} (${customerPhone || 'N/A'})
Vehicle: ${vehicleBrand} ${vehicleModel} (${vehiclePlate}) - ${vehicleColor || 'Standard'} ${vehicleType || ''}
Duration: ${durationDays} Day(s) (${startDateFormatted} to ${endDateFormatted})
Pickup Station: ${pickupLocation || 'Main Hub'}
Return Station: ${returnLocation || 'Main Hub'}

--- FINANCIAL STATEMENT ---
Daily Rate: NPR ${dailyRate.toLocaleString()} / day
Rental Charge: NPR ${totalAmount.toLocaleString()}
Refundable Security Deposit: NPR 2,000
Amount Paid Now: NPR ${paidAmount.toLocaleString()} ${paymentMethod ? `via ${paymentMethod}` : ''} ${transactionId ? `(Ref: ${transactionId})` : ''}
Net Balance Due at Pickup: NPR ${dueAmount.toLocaleString()}
Payment Status: ${paymentStatusBadge}

--- DOCUMENTS VERIFICATION ---
Citizenship: ${hasCitizenship ? 'Attached' : 'Not provided'}
Bank Cheque: ${hasBankCheque ? 'Attached' : 'Not provided'}
Driving License: ${hasDrivingLicense ? 'Attached' : 'Not provided'}

--- HOST AGENCY DETAILS ---
Agency: ${tenantName}
Address: ${tenantAddress || 'Depot'}
Phone: ${tenantPhone || 'Available upon pickup'}
Email: ${tenantEmail || 'N/A'}

View Receipt Online: ${confirmationUrl || 'http://localhost:3000'}

* Notice: Please bring your original driving license and citizenship card when picking up the vehicle.

Best regards,
${tenantName} & AutoRent Fleet System
    `.trim();

    const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 20px; color: #1e293b; }
    .voucher-card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
    .header { background: #0f172a; padding: 24px 28px; color: #ffffff; }
    .header-table { width: 100%; border-collapse: collapse; }
    .header-left h1 { margin: 0; font-size: 18px; font-weight: 800; color: #ffffff; }
    .header-left p { margin: 4px 0 0; font-size: 11px; color: #94a3b8; }
    .booking-code { font-family: monospace; font-size: 13px; font-weight: 800; color: #60a5fa; }
    .status-ribbon { background: ${isFullyPaid ? '#ecfdf5' : isPartial ? '#eff6ff' : '#fffbeb'}; border-bottom: 1px solid ${isFullyPaid ? '#a7f3d0' : isPartial ? '#bfdbfe' : '#fde68a'}; padding: 12px 28px; font-size: 12px; color: ${isFullyPaid ? '#065f46' : isPartial ? '#1e40af' : '#92400e'}; font-weight: 600; }
    .content { padding: 24px 28px; }
    .section-title { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; margin-bottom: 8px; border-bottom: 1px solid #f1f5f9; padding-bottom: 4px; }
    .table-info { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 12px; }
    .table-info td { vertical-align: top; width: 50%; padding-bottom: 10px; }
    .val-bold { font-size: 13px; font-weight: 700; color: #0f172a; }
    .val-sub { font-size: 11px; color: #64748b; margin-top: 2px; }
    .table-breakdown { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 12px; }
    .table-breakdown th { text-align: left; padding: 8px 0; border-bottom: 2px solid #e2e8f0; font-size: 10px; color: #64748b; text-transform: uppercase; }
    .table-breakdown td { padding: 8px 0; border-bottom: 1px solid #f1f5f9; }
    .total-box { background: #f8fafc; border-radius: 12px; padding: 16px; margin: 16px 0; border: 1px solid #e2e8f0; font-size: 12px; }
    .total-row { display: flex; justify-content: space-between; margin-bottom: 6px; }
    .net-due-row { display: flex; justify-content: space-between; font-size: 14px; font-weight: 800; color: #0f172a; padding-top: 8px; border-top: 1px solid #cbd5e1; margin-top: 6px; }
    .docs-badge-box { background: #f8fafc; border-radius: 8px; padding: 10px 14px; margin: 14px 0; font-size: 11px; color: #334155; }
    .docs-badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 700; margin-right: 6px; }
    .btn-wrap { text-align: center; margin: 24px 0 12px; }
    .btn-receipt { display: inline-block; background: #4f46e5; color: #ffffff !important; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 13px; box-shadow: 0 4px 10px rgba(79, 70, 229, 0.3); }
    .footer { background: #f8fafc; padding: 16px 28px; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; text-align: center; }
  </style>
</head>
<body>
  <div class="voucher-card">
    <div class="header">
      <table class="header-table">
        <tr>
          <td class="header-left">
            <h1>${tenantName}</h1>
            <p>${tenantAddress ? tenantAddress + ' &bull; ' : ''}Phone: ${tenantPhone || 'Available upon pickup'}</p>
          </td>
          <td style="text-align: right;">
            <div style="font-size: 10px; text-transform: uppercase; color: #94a3b8;">Booking Receipt</div>
            <div class="booking-code">#BK-${shortId}</div>
          </td>
        </tr>
      </table>
    </div>

    <div class="status-ribbon">
      <table style="width: 100%;">
        <tr>
          <td>✓ Reservation Confirmed</td>
          <td style="text-align: right;">${paymentStatusBadge}</td>
        </tr>
      </table>
    </div>

    <div class="content">
      <p style="font-size: 13px; margin: 0 0 16px;">Hello <strong>${customerName}</strong>, thank you for booking with us. Below is your official rental reservation receipt:</p>

      <table class="table-info">
        <tr>
          <td>
            <div class="section-title">Customer Information</div>
            <div class="val-bold">${customerName}</div>
            <div class="val-sub">Phone: ${customerPhone || 'N/A'}</div>
            <div class="val-sub">Email: ${to}</div>
          </td>
          <td>
            <div class="section-title">Vehicle Reserved</div>
            <div class="val-bold">${vehicleBrand} ${vehicleModel}</div>
            <div class="val-sub">Plate: <strong>${vehiclePlate}</strong> (${vehicleColor || 'Standard'})</div>
            <div class="val-sub">Type: ${vehicleType || 'Vehicle'}</div>
          </td>
        </tr>
        <tr>
          <td>
            <div class="section-title">Pickup Schedule</div>
            <div class="val-bold">${startDateFormatted}</div>
            <div class="val-sub">Hub: ${pickupLocation || 'Main Hub'}</div>
          </td>
          <td>
            <div class="section-title">Return Schedule</div>
            <div class="val-bold">${endDateFormatted}</div>
            <div class="val-sub">Duration: <strong>${durationDays} Day${durationDays === 1 ? '' : 's'}</strong></div>
          </td>
        </tr>
      </table>

      <div class="section-title">Financial Breakdown</div>
      <table class="table-breakdown">
        <thead>
          <tr>
            <th>Item Description</th>
            <th style="text-align: right;">Amount (NPR)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Rental Charge (${durationDays} Days @ NPR ${dailyRate.toLocaleString()}/day)</td>
            <td style="text-align: right; font-weight: bold;">NPR ${totalAmount.toLocaleString()}</td>
          </tr>
          <tr>
            <td>Refundable Security Deposit (Payable at pickup)</td>
            <td style="text-align: right; font-weight: bold;">NPR 2,000</td>
          </tr>
        </tbody>
      </table>

      <div class="total-box">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 3px 0;">Gross Rental Total:</td>
            <td style="text-align: right; padding: 3px 0;"><strong>NPR ${(totalAmount + 2000).toLocaleString()}</strong></td>
          </tr>
          ${
            paidAmount > 0
              ? `<tr>
                  <td style="padding: 3px 0; color: #059669;">Payment Received (${paymentMethod || 'Online'}${transactionId ? ` - Ref: ${transactionId}` : ''}):</td>
                  <td style="text-align: right; padding: 3px 0; color: #059669;"><strong>- NPR ${paidAmount.toLocaleString()}</strong></td>
                </tr>`
              : ''
          }
          <tr style="border-top: 1px solid #cbd5e1;">
            <td style="padding-top: 8px; font-size: 14px; font-weight: 800; color: #0f172a;">Net Balance Due at Pickup:</td>
            <td style="text-align: right; padding-top: 8px; font-size: 14px; font-weight: 800; color: ${isFullyPaid ? '#059669' : '#4f46e5'};">NPR ${dueAmount.toLocaleString()}</td>
          </tr>
        </table>
      </div>

      <div class="docs-badge-box">
        <strong>Verification Documents:</strong> &nbsp;
        <span class="docs-badge" style="background: ${hasCitizenship ? '#dcfce7; color: #15803d;' : '#f1f5f9; color: #64748b;'}">${hasCitizenship ? '✓ Citizenship' : '— Citizenship'}</span>
        <span class="docs-badge" style="background: ${hasBankCheque ? '#dcfce7; color: #15803d;' : '#f1f5f9; color: #64748b;'}">${hasBankCheque ? '✓ Bank Cheque' : '— Bank Cheque'}</span>
        <span class="docs-badge" style="background: ${hasDrivingLicense ? '#dcfce7; color: #15803d;' : '#f1f5f9; color: #64748b;'}">${hasDrivingLicense ? '✓ Driving License' : '— Driving License'}</span>
        <span class="docs-badge" style="background: ${hasPaymentReceipt ? '#dcfce7; color: #15803d;' : '#f1f5f9; color: #64748b;'}">${hasPaymentReceipt ? '✓ Payment Slip Attached' : '— Payment Slip'}</span>
      </div>

      ${
        confirmationUrl
          ? `<div class="btn-wrap">
              <a href="${confirmationUrl}" class="btn-receipt" target="_blank">View &amp; Print Full Receipt Online &rarr;</a>
            </div>`
          : ''
      }

      <div style="background: #f1f5f9; border-radius: 8px; padding: 12px; font-size: 11px; color: #475569; margin-top: 16px;">
        <strong>Pickup Instructions:</strong> Please present your original driving license and citizenship card when picking up the vehicle. For any assistance, contact <strong>${tenantPhone || tenantEmail || tenantName}</strong>.
      </div>
    </div>

    <div class="footer">
      Official computer-generated booking receipt from ${tenantName} powered by AutoRent Cloud Platform.
    </div>
  </div>
</body>
</html>
    `.trim();

    return this.sendEmail(to, subject, textBody, htmlBody);
  }

  async sendCustomerOtpEmail(
    to: string,
    otpCode: string,
    tenantName: string,
  ) {
    const subject = `${otpCode} is your verification code for ${tenantName}`;

    const textBody = `
Hello,

Your 6-digit verification code to access your bookings and saved documents at ${tenantName} is:

${otpCode}

This code expires in 10 minutes. If you did not request this code, please ignore this email.

Best regards,
${tenantName} (via AutoRent Cloud)
    `.trim();

    const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f8fafc; margin: 0; padding: 24px; color: #0f172a; }
    .card { max-width: 480px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 16px rgba(15,23,42,0.06); }
    .header { background: linear-gradient(135deg, #4f46e5, #6366f1); color: #ffffff; padding: 20px 24px; text-align: center; }
    .body { padding: 28px 24px; text-align: center; }
    .otp-box { display: inline-block; margin: 18px 0; padding: 14px 28px; background: #f1f5f9; border: 1px dashed #6366f1; border-radius: 12px; font-size: 28px; font-weight: 800; letter-spacing: 6px; color: #4f46e5; font-family: monospace; }
    .footer { background: #f8fafc; padding: 14px 24px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h2 style="margin:0; font-size:18px;">${tenantName}</h2>
      <p style="margin:4px 0 0; font-size:12px; opacity:0.9;">Customer Portal Verification</p>
    </div>
    <div class="body">
      <p style="font-size:14px; color:#334155; margin:0 0 8px;">Use the verification code below to access your bookings, receipts, and saved documents:</p>
      <div class="otp-box">${otpCode}</div>
      <p style="font-size:12px; color:#64748b; margin:8px 0 0;">This code is valid for <strong>10 minutes</strong>. Do not share it with anyone.</p>
    </div>
    <div class="footer">
      Powered by AutoRent Cloud Platform
    </div>
  </div>
</body>
</html>
    `.trim();

    return this.sendEmail(to, subject, textBody, htmlBody);
  }
}
