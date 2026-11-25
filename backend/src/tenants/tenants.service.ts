import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { AddTenantMemberDto } from './dto/add-member.dto';
import { TenantRole } from '../common/enums/tenant-roles.enum';
import { Role } from '../common/enums/roles.enum';
import { EmailService } from '../notifications/email/email.service';
import { CloudinaryService } from '../uploads/cloudinary.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class TenantsService {
  private readonly logger = new Logger(TenantsService.name);

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private cloudinaryService: CloudinaryService,
  ) {}

  private generateTemporaryPassword(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let rand = '';
    for (let i = 0; i < 6; i++) {
      rand += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `Auto#${rand}!`;
  }

  private generateSlug(name: string): string {
    const base = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const rand = Math.random().toString(36).substring(2, 6);
    return `${base}-${rand}`;
  }

  async createTenant(userId: string, dto: CreateTenantDto) {
    const slug = dto.slug ? dto.slug.toLowerCase().trim() : this.generateSlug(dto.name);

    const existing = await this.prisma.tenant.findUnique({
      where: { slug },
    });
    if (existing) {
      throw new ConflictException(`Tenant with slug '${slug}' already exists`);
    }

    // Ensure subscription plan
    let selectedPlan: any = null;
    if (dto.planId) {
      selectedPlan = await this.prisma.subscriptionPlan.findUnique({
        where: { id: dto.planId },
      });
    }

    if (!selectedPlan) {
      selectedPlan = await this.prisma.subscriptionPlan.findFirst({
        where: { isActive: true },
        orderBy: { price: 'asc' },
      });
    }

    if (!selectedPlan) {
      selectedPlan = await this.prisma.subscriptionPlan.create({
        data: {
          name: 'Starter Trial',
          slug: 'starter-trial',
          description: '14-Day Free Trial for new vehicle rental operators',
          price: 0,
          billingCycle: 'MONTHLY',
          maxVehicles: 10,
          maxStaff: 3,
          features: ['fleet_management', 'rental_bookings', 'qr_telemetry', 'digital_bluebook'],
        },
      });
    }

    const trialDays = 14;
    const now = new Date();
    const trialEnd = new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000);

    // Client user onboarding: resolve owner email & full name
    const ownerEmail = (dto.ownerEmail || dto.email || '').trim().toLowerCase();
    const ownerName = (dto.ownerName || `${dto.name} Owner`).trim();
    let assignedOwnerUserId = userId;
    let temporaryPassword: string | null = null;

    if (ownerEmail) {
      let clientUser = await this.prisma.user.findUnique({
        where: { email: ownerEmail },
      });

      // Generate a fresh temporary password for tenant onboarding
      temporaryPassword = this.generateTemporaryPassword();
      const passwordHash = await bcrypt.hash(temporaryPassword, 10);

      if (!clientUser) {
        const userPhone =
          dto.phone?.trim() || `+977-98${Math.floor(10000000 + Math.random() * 90000000)}`;

        clientUser = await this.prisma.user.create({
          data: {
            email: ownerEmail,
            fullName: ownerName,
            phone: userPhone,
            passwordHash,
            role: 'FLEET_MANAGER',
            mustChangePassword: true,
          },
        });
      } else {
        // If user already exists in DB, update their password with the fresh temporary password
        // so they can immediately sign in with the emailed credentials
        await this.prisma.user.update({
          where: { id: clientUser.id },
          data: {
            passwordHash,
            mustChangePassword: true,
          },
        });
      }

      assignedOwnerUserId = clientUser.id;
    }

    const tenant = await this.prisma.tenant.create({
      data: {
        name: dto.name,
        slug,
        domain: dto.domain,
        address: dto.address,
        phone: dto.phone,
        email: dto.email,
        logoUrl: dto.logoUrl,
        status: dto.status || 'ACTIVE',
        members: {
          create: {
            userId: assignedOwnerUserId,
            role: TenantRole.OWNER,
          },
        },
        subscriptions: {
          create: {
            planId: selectedPlan.id,
            status: selectedPlan.price === 0 ? 'TRIALING' : 'ACTIVE',
            startDate: now,
            endDate: trialEnd,
            trialEndsAt: trialEnd,
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                fullName: true,
                role: true,
                mustChangePassword: true,
              },
            },
          },
        },
        subscriptions: {
          include: { plan: true },
        },
      },
    });

    // Attach submitted Business Document if provided
    if (dto.documentUrl) {
      await this.prisma.tenantDocument
        .create({
          data: {
            tenantId: tenant.id,
            title: 'Business Registration / PAN Document',
            type: dto.documentType || 'BUSINESS_REGISTRATION',
            fileUrl: dto.documentUrl,
            publicId: `app_doc_${Date.now()}`,
          },
        })
        .catch(() => {});
    }

    // Attach submitted Payment Receipt if provided
    if (dto.paymentReceiptUrl) {
      await this.prisma.tenantDocument
        .create({
          data: {
            tenantId: tenant.id,
            title: `Payment Receipt (${dto.paymentMethod || 'Manual'})`,
            type: 'PAYMENT_RECEIPT',
            fileUrl: dto.paymentReceiptUrl,
            publicId: `app_receipt_${Date.now()}`,
          },
        })
        .catch(() => {});
    }

    // Create Payment record for Superadmin audit if payment info or receipt provided
    if (dto.paymentReceiptUrl || dto.paymentMethod) {
      const allowedMethods = ['ESEWA', 'KHALTI', 'FONEPAY', 'CASH'];
      const resolvedMethod = allowedMethods.includes(dto.paymentMethod || '')
        ? (dto.paymentMethod as any)
        : 'CASH';

      await this.prisma.payment
        .create({
          data: {
            userId: assignedOwnerUserId,
            tenantId: tenant.id,
            amount: selectedPlan ? selectedPlan.price : 0,
            paymentMethod: resolvedMethod,
            status: 'PENDING',
            transactionId:
              dto.transactionId?.trim() || `TXN-APP-${Date.now().toString(36).toUpperCase()}`,
            note: `[Registration Payment] Method: ${dto.paymentMethod || 'N/A'}. ${dto.paymentNote || ''} Receipt: ${dto.paymentReceiptUrl || 'None'}`.trim(),
          },
        })
        .catch(() => {});
    }

    // Send welcome email with temporary credentials
    if (ownerEmail && temporaryPassword) {
      try {
        await this.emailService.sendTenantWelcomeEmail(
          ownerEmail,
          ownerName,
          tenant.name,
          temporaryPassword,
        );
        this.logger.log(`[TenantsService] Welcome email dispatched to ${ownerEmail}`);
      } catch (err: any) {
        this.logger.error(
          `[TenantsService] Failed to send welcome email to ${ownerEmail}: ${err?.message || err}`,
        );
      }
    }

    return {
      ...tenant,
      temporaryCredentials: temporaryPassword
        ? {
            email: ownerEmail,
            temporaryPassword,
            ownerName,
          }
        : null,
    };
  }

  async uploadPublicFile(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file provided for upload');
    }
    const uploadRes = await this.cloudinaryService.uploadFile(
      file,
      'autorent/tenant_applications',
    );
    return {
      fileUrl: uploadRes.url,
      publicId: uploadRes.publicId,
      originalFilename: uploadRes.originalFilename,
      bytes: uploadRes.bytes,
      format: uploadRes.format,
    };
  }

  async applyTenant(dto: CreateTenantDto) {
    const ownerEmail = (dto.ownerEmail || dto.email || '').trim().toLowerCase();
    if (!ownerEmail) {
      throw new BadRequestException('Owner email is required for application');
    }
    return this.createTenant('PUBLIC_APPLICANT', {
      ...dto,
      status: 'PENDING',
    });
  }

  async getUserTenants(userId: string) {
    const memberships = await this.prisma.tenantUser.findMany({
      where: { userId },
      include: {
        tenant: {
          include: {
            subscriptions: {
              include: { plan: true },
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
            _count: {
              select: { vehicles: true, members: true, bookings: true },
            },
          },
        },
      },
    });

    return memberships.map((m) => ({
      ...m.tenant,
      myRole: m.role,
    }));
  }

  async getTenantById(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
                phone: true,
                avatarUrl: true,
              },
            },
          },
        },
        subscriptions: {
          include: { plan: true },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        documents: {
          orderBy: { createdAt: 'desc' },
        },
        payments: {
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: { vehicles: true, members: true, bookings: true },
        },
      },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant organization not found');
    }

    return tenant;
  }

  async assertTenantAccess(tenantId: string, user: { id: string; role: Role }) {
    if (user?.role === Role.ADMIN) {
      return;
    }

    const membership = await this.prisma.tenantUser.findUnique({
      where: {
        tenantId_userId: {
          tenantId,
          userId: user.id,
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException('You do not have access to this tenant organization');
    }
  }

  async getTenantByIdForUser(tenantId: string, user: { id: string; role: Role }) {
    await this.assertTenantAccess(tenantId, user);
    return this.getTenantById(tenantId);
  }

  async updateTenant(tenantId: string, dto: UpdateTenantDto) {
    const existing = await this.getTenantById(tenantId);

    if (dto.slug && dto.slug !== existing.slug) {
      const slugTaken = await this.prisma.tenant.findUnique({
        where: { slug: dto.slug.toLowerCase().trim() },
      });
      if (slugTaken && slugTaken.id !== tenantId) {
        throw new ConflictException(`Slug '${dto.slug}' is already taken by another organization`);
      }
    }

    return this.prisma.tenant.update({
      where: { id: tenantId },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.slug && { slug: dto.slug.toLowerCase().trim() }),
        ...(dto.domain !== undefined && { domain: dto.domain }),
        ...(dto.address !== undefined && { address: dto.address }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
        ...(dto.email !== undefined && { email: dto.email }),
        ...(dto.logoUrl !== undefined && { logoUrl: dto.logoUrl }),
        ...(dto.status && { status: dto.status }),
        ...(dto.paymentQrUrl !== undefined && { paymentQrUrl: dto.paymentQrUrl }),
        ...(dto.esewaQrUrl !== undefined && { esewaQrUrl: dto.esewaQrUrl }),
        ...(dto.khaltiQrUrl !== undefined && { khaltiQrUrl: dto.khaltiQrUrl }),
        ...(dto.fonepayQrUrl !== undefined && { fonepayQrUrl: dto.fonepayQrUrl }),
        ...(dto.bankAccountDetails !== undefined && { bankAccountDetails: dto.bankAccountDetails }),
      },
      include: {
        subscriptions: {
          include: { plan: true },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        _count: {
          select: { vehicles: true, members: true, bookings: true },
        },
      },
    });
  }

  async addMember(tenantId: string, dto: AddTenantMemberDto) {
    if (dto.role === TenantRole.OWNER) {
      throw new ForbiddenException('Cannot assign OWNER role via member invitation');
    }

    const normalizedEmail = (dto.email || '').trim().toLowerCase();
    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      throw new NotFoundException(`User with email '${normalizedEmail}' not found. Please ask them to register first.`);
    }

    const existingMember = await this.prisma.tenantUser.findUnique({
      where: {
        tenantId_userId: {
          tenantId,
          userId: user.id,
        },
      },
    });

    if (existingMember) {
      throw new ConflictException('User is already a member of this tenant');
    }

    return this.prisma.tenantUser.create({
      data: {
        tenantId,
        userId: user.id,
        role: dto.role,
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
      },
    });
  }

  async removeMember(tenantId: string, userId: string, requesterUserId: string) {
    const member = await this.prisma.tenantUser.findUnique({
      where: {
        tenantId_userId: {
          tenantId,
          userId,
        },
      },
    });

    if (!member) {
      throw new NotFoundException('Member record not found');
    }

    if (member.role === TenantRole.OWNER) {
      throw new BadRequestException('Cannot remove the Tenant Owner');
    }

    return this.prisma.tenantUser.delete({
      where: {
        tenantId_userId: {
          tenantId,
          userId,
        },
      },
    });
  }

  async getAllTenants() {
    return this.prisma.tenant.findMany({
      include: {
        subscriptions: {
          include: { plan: true },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        documents: {
          orderBy: { createdAt: 'desc' },
        },
        payments: {
          orderBy: { createdAt: 'desc' },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        _count: {
          select: { vehicles: true, members: true, bookings: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateTenantStatus(tenantId: string, status: any) {
    const existing = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        members: {
          where: { role: TenantRole.OWNER },
          include: { user: true },
        },
      },
    });

    if (!existing) {
      throw new NotFoundException(`Tenant with ID ${tenantId} not found`);
    }

    let temporaryCredentials: any = null;

    // When Superadmin activates a PENDING or non-active tenant:
    if (status === 'ACTIVE' && existing.status !== 'ACTIVE') {
      const ownerMember = existing.members[0];
      if (ownerMember && ownerMember.user) {
        const temporaryPassword = this.generateTemporaryPassword();
        const passwordHash = await bcrypt.hash(temporaryPassword, 10);

        await this.prisma.user.update({
          where: { id: ownerMember.user.id },
          data: {
            passwordHash,
            mustChangePassword: true,
          },
        });

        try {
          await this.emailService.sendTenantWelcomeEmail(
            ownerMember.user.email,
            ownerMember.user.fullName,
            existing.name,
            temporaryPassword,
          );
          this.logger.log(
            `[TenantsService] Activation credentials email dispatched to ${ownerMember.user.email}`,
          );
        } catch (err: any) {
          this.logger.error(
            `[TenantsService] Failed to send activation email to ${ownerMember.user.email}: ${err?.message || err}`,
          );
        }

        temporaryCredentials = {
          email: ownerMember.user.email,
          temporaryPassword,
          ownerName: ownerMember.user.fullName,
        };
      }
    }

    const updated = await this.prisma.tenant.update({
      where: { id: tenantId },
      data: { status },
      include: {
        subscriptions: {
          include: { plan: true },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        _count: {
          select: { vehicles: true, members: true, bookings: true },
        },
      },
    });

    return {
      ...updated,
      temporaryCredentials,
    };
  }

  async deleteTenant(tenantId: string) {
    await this.getTenantById(tenantId);

    await this.prisma.tenant.delete({
      where: { id: tenantId },
    });

    return {
      message: 'Tenant organization deleted successfully',
      id: tenantId,
    };
  }

  async uploadTenantDocument(
    tenantId: string,
    file: Express.Multer.File,
    title: string,
    type: string = 'BUSINESS_REGISTRATION',
  ) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });
    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${tenantId} not found`);
    }

    if (!file) {
      throw new BadRequestException('No file provided for upload');
    }

    // Upload to Cloudinary under folder 'autorent/tenants/<tenantId>'
    const uploadRes = await this.cloudinaryService.uploadFile(
      file,
      `autorent/tenants/${tenantId}`,
    );

    const doc = await this.prisma.tenantDocument.create({
      data: {
        tenantId,
        title: title || file.originalname,
        type: type || 'BUSINESS_REGISTRATION',
        fileUrl: uploadRes.url,
        publicId: uploadRes.publicId,
        fileType: file.mimetype || uploadRes.format,
        fileSize: uploadRes.bytes,
      },
    });

    return doc;
  }

  async getTenantDocuments(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });
    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${tenantId} not found`);
    }

    return this.prisma.tenantDocument.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async deleteTenantDocument(tenantId: string, docId: string) {
    const doc = await this.prisma.tenantDocument.findFirst({
      where: { id: docId, tenantId },
    });
    if (!doc) {
      throw new NotFoundException('Document not found');
    }

    if (doc.publicId) {
      await this.cloudinaryService.deleteFile(doc.publicId);
    }

    await this.prisma.tenantDocument.delete({
      where: { id: docId },
    });

    return { success: true, message: 'Document deleted successfully', id: docId };
  }
}
