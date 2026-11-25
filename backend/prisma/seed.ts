import { PrismaClient, Role, BillingCycle } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding master SaaS database...');

  // 1. Superadmin User
  const passwordHash = await bcrypt.hash('admin@123', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@gmail.com' },
    update: {
      passwordHash,
      role: Role.ADMIN,
    },
    create: {
      email: 'admin@gmail.com',
      phone: '+977-9800000001',
      passwordHash,
      fullName: 'Super Admin',
      role: Role.ADMIN,
    },
  });

  console.log(`Seeded Superadmin: ${adminUser.email} / admin@123`);

  // 2. SaaS Subscription Plans
  const plans = [
    {
      name: 'Starter Trial',
      slug: 'starter-trial',
      description: '14-Day Free Trial for emerging vehicle rental businesses',
      price: 0,
      billingCycle: BillingCycle.MONTHLY,
      maxVehicles: 5,
      maxStaff: 2,
      features: ['Fleet Management (up to 5)', 'Rental Booking Engine', 'eSewa & Khalti Payments', 'Digital Bluebook Vault'],
      isActive: true,
    },
    {
      name: 'Professional Fleet',
      slug: 'pro-fleet',
      description: 'Ideal for established rental operators with growing fleets',
      price: 2999,
      billingCycle: BillingCycle.MONTHLY,
      maxVehicles: 25,
      maxStaff: 8,
      features: ['Fleet Management (up to 25)', 'Real-time GPS Tracking', 'Damage Inspection Checklist', 'Advanced Analytics', 'Priority Support'],
      isActive: true,
    },
    {
      name: 'Enterprise Agency',
      slug: 'enterprise-agency',
      description: 'Unlimited capability for large commercial fleets & multi-branch operators',
      price: 7999,
      billingCycle: BillingCycle.MONTHLY,
      maxVehicles: 150,
      maxStaff: 30,
      features: ['Fleet Management (up to 150)', 'Multi-Branch Management', 'Custom Subdomain / Branding', 'Dedicated Account Manager', '24/7 Phone Support'],
      isActive: true,
    },
  ];

  for (const plan of plans) {
    await prisma.subscriptionPlan.upsert({
      where: { slug: plan.slug },
      update: plan,
      create: plan,
    });
    console.log(`Seeded Plan: ${plan.name} (NPR ${plan.price})`);
  }

  console.log('Seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
