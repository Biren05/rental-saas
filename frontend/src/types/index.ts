export type Role = 'USER' | 'DRIVER' | 'FLEET_MANAGER' | 'ADMIN';

export type TenantRole = 'OWNER' | 'ADMIN' | 'MANAGER' | 'STAFF' | 'DRIVER' | 'CUSTOMER';

export type TenantStatus = 'ACTIVE' | 'SUSPENDED' | 'PENDING';

export type SubscriptionStatus = 'TRIALING' | 'ACTIVE' | 'PAST_DUE' | 'EXPIRED' | 'CANCELLED';

export type VehicleStatus = 'AVAILABLE' | 'RENTED' | 'MAINTENANCE' | 'RESERVED';

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export interface User {
  id: string;
  email: string;
  phone: string;
  fullName: string;
  role: Role;
  avatarUrl?: string | null;
  mustChangePassword?: boolean;
  tenantMemberships?: any[];
  createdAt: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  price: number;
  billingCycle: 'MONTHLY' | 'YEARLY';
  maxVehicles: number;
  maxStaff: number;
  features: string[];
  isActive: boolean;
  createdAt: string;
  _count?: {
    subscriptions: number;
  };
}

export interface TenantSubscription {
  id: string;
  tenantId: string;
  planId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  startDate: string;
  endDate: string;
  trialEndsAt?: string | null;
  isExpired?: boolean;
  daysLeft?: number;
  isExpiringSoon?: boolean;
  usage?: {
    vehicles: { current: number; max: number; remaining: number };
    staff: { current: number; max: number; remaining: number };
  };
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  domain?: string | null;
  status: TenantStatus;
  logoUrl?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  paymentQrUrl?: string | null;
  esewaQrUrl?: string | null;
  khaltiQrUrl?: string | null;
  fonepayQrUrl?: string | null;
  bankAccountDetails?: string | null;
  whatsappUrl?: string | null;
  tiktokUrl?: string | null;
  facebookUrl?: string | null;
  instagramUrl?: string | null;
  createdAt: string;
  subscriptions?: TenantSubscription[];
  documents?: TenantDocument[];
  payments?: any[];
  members?: any[];
  _count?: {
    vehicles: number;
    members: number;
    bookings: number;
  };
  myRole?: TenantRole;
}

export interface TenantDocument {
  id: string;
  tenantId: string;
  title: string;
  type: string;
  fileUrl: string;
  publicId?: string | null;
  fileType?: string | null;
  fileSize?: number | null;
  createdAt: string;
  updatedAt?: string;
}

export interface Vehicle {
  id: string;
  tenantId?: string | null;
  ownerId: string;
  plateNumber: string;
  vehicleType: string;
  brand: string;
  model: string;
  color: string;
  dailyRate?: number | null;
  hourlyRate?: number | null;
  status: VehicleStatus;
  qrCodeUrl?: string | null;
  imageUrl?: string | null;
  iotDevice?: any;
  createdAt: string;
  isBooked?: boolean;
  availabilityStatus?: 'AVAILABLE' | 'BOOKED';
  bookedUntil?: string | null;
  nextAvailableDate?: string | null;
  currentBooking?: {
    startDate: string;
    endDate: string;
    status: string;
  } | null;
}

export interface RentalBooking {
  id: string;
  tenantId: string;
  vehicleId: string;
  vehicle: Vehicle;
  customerId: string;
  customer: User;
  startDate: string;
  endDate: string;
  totalAmount: number;
  depositAmount: number;
  status: BookingStatus;
  pickupLocation?: string | null;
  returnLocation?: string | null;
  documentUrl?: string | null;
  citizenshipUrl?: string | null;
  bankChequeUrl?: string | null;
  drivingLicenseUrl?: string | null;
  paymentReceiptUrl?: string | null;
  customerName?: string | null;
  customerEmail?: string | null;
  customerPhone?: string | null;
  pickupOdometerKm?: number | null;
  pickupFuelLevel?: string | null;
  pickupNotes?: string | null;
  pickupPhotos?: string[];
  pickupInspectedAt?: string | null;
  returnOdometerKm?: number | null;
  returnFuelLevel?: string | null;
  returnNotes?: string | null;
  returnPhotos?: string[];
  returnDamageFee?: number;
  returnInspectedAt?: string | null;
  createdAt: string;
}

export type PaymentMethod = 'CASH' | 'ESEWA' | 'KHALTI' | 'FONEPAY';
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';

export interface TenantPayment {
  id: string;
  userId: string;
  tenantId?: string | null;
  bookingId?: string | null;
  amount: number;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string | null;
  receiptUrl?: string | null;
  note?: string | null;
  createdAt: string;
  user?: {
    id: string;
    fullName: string;
    email: string;
    phone?: string;
  };
  booking?: {
    id: string;
    customerName?: string | null;
    customerEmail?: string | null;
    customerPhone?: string | null;
    paymentReceiptUrl?: string | null;
    vehicle?: {
      id: string;
      brand: string;
      model: string;
      plateNumber: string;
      imageUrl?: string | null;
    };
  };
}

export interface PaymentStats {
  totalBilled: number;
  totalCollected: number;
  totalCashCollected: number;
  totalOnlineCollected: number;
  totalUdharo: number;
  transactionCount: number;
  activeBookingsCount: number;
}

export interface UdharoCustomer {
  id: string;
  bookingId: string;
  customer: {
    id: string;
    fullName: string;
    email: string;
    phone?: string;
  };
  vehicle: {
    id: string;
    brand: string;
    model: string;
    plateNumber: string;
    imageUrl?: string | null;
  };
  startDate: string;
  endDate: string;
  bookingStatus: BookingStatus;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  paymentStatus: 'PAID' | 'PARTIAL' | 'UNPAID';
  lastPaymentAt?: string | null;
  payments?: TenantPayment[];
}

export interface RecordPaymentInput {
  bookingId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  transactionId?: string;
  note?: string;
}

