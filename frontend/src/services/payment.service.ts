import { api } from '../lib/api';
import { TenantPayment, PaymentStats, UdharoCustomer, RecordPaymentInput } from '../types';

export const paymentService = {
  /**
   * Get all payment transactions / statements for a tenant organization
   */
  getTenantPayments: (tenantId: string) =>
    api.get<TenantPayment[]>(`/rentals/${tenantId}/payments`, { tenantId }),

  /**
   * Get financial KPIs (Total Billed, Cash Collected, Online Collected, Outstanding Udharo)
   */
  getTenantPaymentStats: (tenantId: string) =>
    api.get<PaymentStats>(`/rentals/${tenantId}/payments/stats`, { tenantId }),

  /**
   * Get customer credit / udharo ledger (who owes what)
   */
  getTenantUdharoLedger: (tenantId: string) =>
    api.get<UdharoCustomer[]>(`/rentals/${tenantId}/payments/udharo`, { tenantId }),

  /**
   * Record a payment (Cash or Online) against a booking to reduce customer udharo
   */
  recordTenantPayment: (tenantId: string, data: RecordPaymentInput) =>
    api.post<TenantPayment>(`/rentals/${tenantId}/payments`, data, { tenantId }),
};
