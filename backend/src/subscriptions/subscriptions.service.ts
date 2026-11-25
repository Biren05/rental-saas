import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubscriptionPlanDto } from './dto/create-plan.dto';
import { SubscribePlanDto } from './dto/subscribe.dto';
import { ReminderJob } from '../scheduler/reminder.job';

@Injectable()
export class SubscriptionsService {
  constructor(
    private prisma: PrismaService,
    private reminderJob: ReminderJob,
  ) {}

  async getAllPlans() {
    return this.prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' },
    });
  }

  async createPlan(dto: CreateSubscriptionPlanDto) {
    const existing = await this.prisma.subscriptionPlan.findUnique({
      where: { slug: dto.slug },
    });
    if (existing) {
      throw new BadRequestException(`Plan with slug '${dto.slug}' already exists`);
    }

    return this.prisma.subscriptionPlan.create({
      data: dto,
    });
  }

  async updatePlan(id: string, dto: Partial<CreateSubscriptionPlanDto>) {
    const plan = await this.prisma.subscriptionPlan.findUnique({ where: { id } });
    if (!plan) throw new NotFoundException('Subscription plan not found');

    return this.prisma.subscriptionPlan.update({
      where: { id },
      data: dto,
    });
  }

  async togglePlanActive(id: string) {
    const plan = await this.prisma.subscriptionPlan.findUnique({ where: { id } });
    if (!plan) throw new NotFoundException('Subscription plan not found');

    return this.prisma.subscriptionPlan.update({
      where: { id },
      data: { isActive: !plan.isActive },
    });
  }

  async deletePlan(id: string) {
    const plan = await this.prisma.subscriptionPlan.findUnique({ where: { id } });
    if (!plan) throw new NotFoundException('Subscription plan not found');

    return this.prisma.subscriptionPlan.delete({
      where: { id },
    });
  }

  async getCurrentSubscription(tenantId: string) {
    const subscription = await this.prisma.tenantSubscription.findUnique({
      where: { tenantId },
      include: { plan: true },
    });

    if (!subscription) {
      throw new NotFoundException('No active subscription found for this tenant');
    }

    const currentVehicles = await this.prisma.vehicle.count({ where: { tenantId } });
    const currentStaff = await this.prisma.tenantUser.count({ where: { tenantId } });

    const now = new Date();
    const isExpired = now > new Date(subscription.endDate);
    const diffMs = new Date(subscription.endDate).getTime() - now.getTime();
    const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    const isExpiringSoon = !isExpired && daysLeft <= 2;

    return {
      ...subscription,
      isExpired,
      daysLeft,
      isExpiringSoon,
      usage: {
        vehicles: {
          current: currentVehicles,
          max: subscription.plan.maxVehicles,
          remaining: Math.max(0, subscription.plan.maxVehicles - currentVehicles),
        },
        staff: {
          current: currentStaff,
          max: subscription.plan.maxStaff,
          remaining: Math.max(0, subscription.plan.maxStaff - currentStaff),
        },
      },
    };
  }

  async triggerExpiryChecks() {
    return this.reminderJob.checkExpiringSubscriptions();
  }

  async checkVehicleLimit(tenantId: string): Promise<void> {
    const subscription = await this.prisma.tenantSubscription.findUnique({
      where: { tenantId },
      include: { plan: true },
    });

    if (!subscription) {
      throw new ForbiddenException('Tenant has no active subscription');
    }

    if (new Date() > new Date(subscription.endDate) && subscription.status !== 'ACTIVE') {
      throw new ForbiddenException('Subscription or trial has expired. Please renew your plan.');
    }

    const currentVehicles = await this.prisma.vehicle.count({ where: { tenantId } });
    if (currentVehicles >= subscription.plan.maxVehicles) {
      throw new ForbiddenException(
        `Vehicle quota exceeded (${currentVehicles}/${subscription.plan.maxVehicles}). Please upgrade your SaaS plan to add more vehicles.`,
      );
    }
  }

  async subscribe(tenantId: string, userId: string, dto: SubscribePlanDto) {
    const plan = await this.prisma.subscriptionPlan.findUnique({
      where: { id: dto.planId },
    });
    if (!plan) {
      throw new NotFoundException('Subscription plan not found');
    }

    const now = new Date();
    const durationDays = plan.billingCycle === 'YEARLY' ? 365 : 30;
    const endDate = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

    const payment = await this.prisma.payment.create({
      data: {
        userId,
        tenantId,
        amount: plan.price,
        paymentMethod: dto.paymentMethod,
        status: plan.price === 0 ? 'SUCCESS' : 'PENDING',
      },
    });

    // Only activate immediately for free plans; paid plans remain pending until verified
    const isFreePlan = Number(plan.price) === 0;
    const subscription = isFreePlan
      ? await this.prisma.tenantSubscription.upsert({
          where: { tenantId },
          update: {
            planId: plan.id,
            status: 'ACTIVE',
            startDate: now,
            endDate,
          },
          create: {
            tenantId,
            planId: plan.id,
            status: 'ACTIVE',
            startDate: now,
            endDate,
          },
          include: { plan: true },
        })
      : await this.prisma.tenantSubscription.findUnique({
          where: { tenantId },
          include: { plan: true },
        });

    return {
      subscription,
      payment,
      message: `Successfully subscribed to plan ${plan.name}`,
    };
  }
}
