import { api } from '../lib/api';
import { RentalBooking, BookingStatus } from '../types';

export interface CreateBookingInput {
  vehicleId: string;
  customerId?: string;
  startDate: string;
  endDate: string;
  depositAmount?: number;
  pickupLocation?: string;
  returnLocation?: string;
  citizenshipUrl?: string;
  bankChequeUrl?: string;
  drivingLicenseUrl?: string;
}

export interface SaveInspectionInput {
  stage: 'PICKUP' | 'RETURN';
  odometerKm?: number;
  fuelLevel?: string;
  notes?: string;
  photos?: string[];
  damageFee?: number;
}

export interface PromoCodeItem {
  id: string;
  code: string;
  discountPercent: number;
  maxDiscount?: number | null;
  minDays: number;
  isActive: boolean;
  expiresAt?: string | null;
  createdAt: string;
}

export interface TenantOperationalAlerts {
  overdueBookings: Array<{
    id: string;
    customerName: string;
    customerPhone: string;
    vehicleName: string;
    plateNumber: string;
    endDate: string;
    hoursOverdue: number;
    suggestedLateFee: number;
    status: string;
  }>;
  expiryAlerts: Array<{
    id: string;
    type: 'DOCUMENT' | 'INSURANCE' | 'SERVICING';
    title: string;
    vehicleName: string;
    plateNumber: string;
    dueDate: string;
    daysLeft: number;
    isExpired: boolean;
  }>;
}

export const rentalService = {
  getTenantBookings: (tenantId?: string, status?: BookingStatus) => {
    const query = status ? `?status=${status}` : '';
    return api.get<RentalBooking[]>(`/rentals/bookings${query}`, { tenantId });
  },

  getBookingById: (id: string, tenantId?: string) =>
    api.get<RentalBooking>(`/rentals/bookings/${id}`, { tenantId }),

  createBooking: (data: CreateBookingInput, tenantId?: string) =>
    api.post<RentalBooking>('/rentals/bookings', data, { tenantId }),

  updateBookingStatus: (id: string, status: BookingStatus, tenantId?: string) =>
    api.patch<RentalBooking>(`/rentals/bookings/${id}/status`, { status }, { tenantId }),

  saveBookingInspection: (id: string, data: SaveInspectionInput, tenantId?: string) =>
    api.patch<RentalBooking>(`/rentals/bookings/${id}/inspection`, data, { tenantId }),

  getTenantPromos: (tenantId?: string) =>
    api.get<PromoCodeItem[]>('/rentals/promos', { tenantId }),

  createTenantPromo: (
    data: { code: string; discountPercent: number; maxDiscount?: number; minDays?: number; expiresAt?: string },
    tenantId?: string,
  ) => api.post<PromoCodeItem>('/rentals/promos', data, { tenantId }),

  deleteTenantPromo: (promoId: string, tenantId?: string) =>
    api.delete<{ deleted: boolean }>(`/rentals/promos/${promoId}`, { tenantId }),

  getOperationalAlerts: (tenantId?: string) =>
    api.get<TenantOperationalAlerts>('/rentals/alerts', { tenantId }),

  applyLateFee: (bookingId: string, amount: number, tenantId?: string) =>
    api.post<RentalBooking>(`/rentals/bookings/${bookingId}/late-fee`, { amount }, { tenantId }),
};
