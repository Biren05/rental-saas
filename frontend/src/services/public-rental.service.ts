import { api } from '../lib/api';
import { Vehicle, RentalBooking } from '../types';

export interface PublicTenantInfo {
  id: string;
  name: string;
  slug: string;
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
  status: string;
  createdAt: string;
}

export interface PublicBookingInput {
  vehicleId: string;
  startDate: string;
  endDate: string;
  fullName: string;
  email: string;
  phone: string;
  pickupLocation?: string;
  returnLocation?: string;
  notes?: string;
  documentUrl?: string;
  citizenshipUrl?: string;
  bankChequeUrl?: string;
  drivingLicenseUrl?: string;
  paymentType?: 'FULL' | 'ADVANCE' | 'PAY_ON_PICKUP';
  paymentMethod?: 'CASH' | 'ESEWA' | 'KHALTI' | 'FONEPAY';
  paidAmount?: number;
  transactionId?: string;
  paymentNote?: string;
  paymentReceiptUrl?: string;
  withDriver?: boolean;
  promoCode?: string;
}

export interface PublicBookingResponse {
  message?: string;
  booking: RentalBooking & {
    tenant: PublicTenantInfo;
    customer: { id: string; fullName: string; email: string; phone: string };
    documentUrl?: string | null;
    citizenshipUrl?: string | null;
    bankChequeUrl?: string | null;
    drivingLicenseUrl?: string | null;
    paymentReceiptUrl?: string | null;
  };
  payment?: any;
  summary: {
    durationDays: number;
    dailyRate: number;
    totalAmount: number;
    depositAmount: number;
    paidAmount?: number;
    dueAmount?: number;
    paymentMethod?: string | null;
    paymentStatus?: 'PAID' | 'PARTIAL' | 'UNPAID';
    latestPayment?: any;
  };
}

export type PublicBookingConfirmation = PublicBookingResponse;

export interface CustomerPortalProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
}

export interface CustomerSavedDocuments {
  citizenshipUrl: string | null;
  drivingLicenseUrl: string | null;
  bankChequeUrl: string | null;
}

export interface CustomerPortalBooking extends Omit<RentalBooking, 'vehicle'> {
  vehicle: {
    id: string;
    brand: string;
    model: string;
    plateNumber: string;
    vehicleType: string;
    dailyRate?: number | null;
    imageUrl?: string | null;
  };
  payments?: any[];
  paymentReceiptUrl?: string | null;
  summary: {
    durationDays: number;
    totalAmount: number;
    paidAmount: number;
    dueAmount: number;
  };
}

export interface CustomerPortalResponse {
  customer: CustomerPortalProfile;
  savedDocuments: CustomerSavedDocuments;
  bookings: CustomerPortalBooking[];
}

export const publicRentalService = {
  getTenantInfo: (slug: string) =>
    api.get<PublicTenantInfo>(`/public/rentals/${slug}/info`),

  getAvailableVehicles: (
    slug: string,
    filters?: { startDate?: string; endDate?: string; vehicleType?: string },
  ) => {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.vehicleType && filters.vehicleType !== 'ALL') {
      params.append('vehicleType', filters.vehicleType);
    }

    const query = params.toString() ? `?${params.toString()}` : '';
    return api.get<Vehicle[]>(`/public/rentals/${slug}/vehicles${query}`);
  },

  getVehicleDetails: (slug: string, vehicleId: string) =>
    api.get<Vehicle>(`/public/rentals/${slug}/vehicles/${vehicleId}`),

  uploadDocument: async (
    slug: string,
    file: File,
  ): Promise<{ documentUrl: string; publicId: string }> => {
    const formData = new FormData();
    formData.append('file', file);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
    const res = await fetch(`${apiUrl}/public/rentals/${slug}/upload-document`, {
      method: 'POST',
      body: formData,
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      throw new Error(data?.message || 'Failed to upload document.');
    }
    return data && data.data ? data.data : data;
  },

  createBooking: (slug: string, data: PublicBookingInput) =>
    api.post<PublicBookingResponse>(`/public/rentals/${slug}/book`, data),

  getBookingConfirmation: (slug: string, bookingId: string) =>
    api.get<PublicBookingResponse>(`/public/rentals/${slug}/bookings/${bookingId}`),

  sendBookingReceiptEmail: (slug: string, bookingId: string) =>
    api.post<{ success: boolean; email?: string; message?: string }>(
      `/public/rentals/${slug}/bookings/${bookingId}/send-email`,
      {}
    ),

  uploadPaymentReceipt: (slug: string, bookingId: string, paymentReceiptUrl: string) =>
    api.post<{ success: boolean; message: string; paymentReceiptUrl: string }>(
      `/public/rentals/${slug}/bookings/${bookingId}/payment-receipt`,
      { paymentReceiptUrl }
    ),

  validatePromoCode: (
    slug: string,
    code: string,
    durationDays: number,
    baseAmount: number
  ) =>
    api.post<{
      valid: boolean;
      code: string;
      discountPercent: number;
      discountAmount: number;
      message: string;
    }>(`/public/rentals/${slug}/validate-promo`, {
      code,
      durationDays,
      baseAmount,
    }),

  requestCustomerOtp: (slug: string, email: string) =>
    api.post<{ sent: boolean; notFound?: boolean; message: string }>(
      `/public/rentals/${slug}/customer/request-otp`,
      { email }
    ),

  verifyCustomerOtp: (slug: string, email: string, code: string) =>
    api.post<{
      token: string;
      customer: CustomerPortalProfile;
      savedDocuments: CustomerSavedDocuments;
    }>(`/public/rentals/${slug}/customer/verify-otp`, { email, code }),

  getCustomerPortal: async (slug: string, token: string): Promise<CustomerPortalResponse> => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
    const res = await fetch(`${apiUrl}/public/rentals/${slug}/customer/me`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      throw new Error(data?.message || 'Failed to load customer portal.');
    }
    return data && data.data ? data.data : data;
  },
};
