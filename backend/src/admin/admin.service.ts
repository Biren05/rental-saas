import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);
  private readonly settingsFilePath = path.resolve(
    process.cwd(),
    'data',
    'platform-settings.json',
  );

  private platformSettings = {
    platformName: 'AutoRent SaaS',
    supportEmail: 'support@autorent.com.np',
    defaultCurrency: 'NPR',
    maintenanceMode: false,
    esewaEnabled: true,
    khaltiEnabled: true,
    fonepayEnabled: true,
    autoApproveTenants: true,
    maxTrialDays: 14,

    // eSewa QR & Payment details
    esewaQrUrl: '',
    esewaId: '9800000001',
    esewaAccountName: 'AutoRent SaaS (eSewa)',

    // Khalti QR & Payment details
    khaltiQrUrl: '',
    khaltiId: '9800000001',
    khaltiAccountName: 'AutoRent SaaS (Khalti)',

    // Fonepay QR & Payment details
    fonepayQrUrl: '',
    fonepayMerchantCode: 'AUTORENT_SaaS',
    fonepayAccountName: 'AutoRent SaaS (Fonepay)',

    // Bank Transfer QR & Payment details
    bankQrUrl: '',
    bankName: 'Nabil Bank Ltd.',
    bankAccountNumber: '01201017500001',
    bankAccountName: 'AutoRent Technologies Pvt. Ltd.',
  };

  constructor(private prisma: PrismaService) {
    this.loadSettings();
  }

  private loadSettings() {
    try {
      if (fs.existsSync(this.settingsFilePath)) {
        const raw = fs.readFileSync(this.settingsFilePath, 'utf8');
        const parsed = JSON.parse(raw);
        this.platformSettings = {
          ...this.platformSettings,
          ...parsed,
        };
        this.logger.log('Platform settings loaded successfully from storage.');
      }
    } catch (err: any) {
      this.logger.warn(`Could not load settings file: ${err.message}`);
    }
  }

  private saveSettingsToFile() {
    try {
      const dir = path.dirname(this.settingsFilePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(
        this.settingsFilePath,
        JSON.stringify(this.platformSettings, null, 2),
        'utf8',
      );
    } catch (err: any) {
      this.logger.error(`Failed to persist platform settings: ${err.message}`);
    }
  }

  async getDashboardStats() {
    const totalUsers = await this.prisma.user.count();
    const totalVehicles = await this.prisma.vehicle.count();
    const totalQrCodes = await this.prisma.qrCode.count();
    const totalPayments = await this.prisma.payment.count();

    return {
      totalUsers,
      totalVehicles,
      totalQrCodes,
      totalPayments,
    };
  }

  async getAllUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            vehicles: true,
            customerBookings: true,
            tenantMemberships: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateUserRole(userId: string, role: any) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
      },
    });
  }

  async getAllPayments() {
    return this.prisma.payment.findMany({
      include: {
        user: {
          select: { id: true, fullName: true, email: true, phone: true },
        },
        tenant: { select: { id: true, name: true, slug: true } },
        booking: {
          include: {
            vehicle: {
              select: { plateNumber: true, brand: true, model: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAuditLogs() {
    return [
      {
        id: 'log-1',
        action: 'TENANT_STATUS_UPDATE',
        actor: 'admin@vehiclerental.com',
        details: 'Updated status of tenant to ACTIVE',
        ip: '127.0.0.1',
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        status: 'SUCCESS',
      },
      {
        id: 'log-2',
        action: 'SUBSCRIPTION_PLAN_CREATED',
        actor: 'admin@vehiclerental.com',
        details: 'Created plan: Professional Fleet (NPR 2999)',
        ip: '127.0.0.1',
        timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
        status: 'SUCCESS',
      },
      {
        id: 'log-3',
        action: 'USER_ROLE_CHANGE',
        actor: 'admin@vehiclerental.com',
        details: 'Assigned FLEET_MANAGER role to user',
        ip: '127.0.0.1',
        timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        status: 'SUCCESS',
      },
      {
        id: 'log-4',
        action: 'DATABASE_SCHEMA_SYNC',
        actor: 'SYSTEM',
        details: 'Synchronized Prisma schema with PostgreSQL database',
        ip: 'localhost',
        timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        status: 'SUCCESS',
      },
      {
        id: 'log-5',
        action: 'SUPERADMIN_LOGIN',
        actor: 'admin@vehiclerental.com',
        details: 'Authenticated via JWT Bearer Token',
        ip: '127.0.0.1',
        timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
        status: 'SUCCESS',
      },
    ];
  }

  async getSystemSettings() {
    return this.platformSettings;
  }

  async updateSystemSettings(settings: Record<string, any>) {
    const allowedKeys = new Set(Object.keys(this.platformSettings));
    const sanitizedSettings: Record<string, any> = {};
    for (const [key, value] of Object.entries(settings || {})) {
      if (allowedKeys.has(key)) {
        sanitizedSettings[key] = value;
      }
    }

    this.platformSettings = {
      ...this.platformSettings,
      ...sanitizedSettings,
    };
    this.saveSettingsToFile();
    return this.platformSettings;
  }

  getPublicPaymentConfig() {
    return {
      esewa: {
        enabled: this.platformSettings.esewaEnabled,
        id: this.platformSettings.esewaId || '9800000001',
        accountName:
          this.platformSettings.esewaAccountName || 'AutoRent SaaS (eSewa)',
        qrUrl: this.platformSettings.esewaQrUrl || '',
      },
      khalti: {
        enabled: this.platformSettings.khaltiEnabled,
        id: this.platformSettings.khaltiId || '9800000001',
        accountName:
          this.platformSettings.khaltiAccountName || 'AutoRent SaaS (Khalti)',
        qrUrl: this.platformSettings.khaltiQrUrl || '',
      },
      fonepay: {
        enabled: this.platformSettings.fonepayEnabled,
        merchantCode:
          this.platformSettings.fonepayMerchantCode || 'AUTORENT_SaaS',
        accountName:
          this.platformSettings.fonepayAccountName ||
          'AutoRent SaaS (Fonepay)',
        qrUrl: this.platformSettings.fonepayQrUrl || '',
      },
      bank: {
        enabled: true,
        bankName: this.platformSettings.bankName || 'Nabil Bank Ltd.',
        accountNumber:
          this.platformSettings.bankAccountNumber || '01201017500001',
        accountName:
          this.platformSettings.bankAccountName ||
          'AutoRent Technologies Pvt. Ltd.',
        qrUrl: this.platformSettings.bankQrUrl || '',
      },
    };
  }
}
