import { api } from '../lib/api';
import { SubscriptionPlan, TenantSubscription } from '../types';

export interface PaymentGatewayConfig {
  esewa: {
    enabled: boolean;
    id: string;
    accountName: string;
    qrUrl: string;
  };
  khalti: {
    enabled: boolean;
    id: string;
    accountName: string;
    qrUrl: string;
  };
  fonepay: {
    enabled: boolean;
    merchantCode: string;
    accountName: string;
    qrUrl: string;
  };
  bank: {
    enabled: boolean;
    bankName: string;
    accountNumber: string;
    accountName: string;
    qrUrl: string;
  };
}

export const subscriptionService = {
  getAllPlans: () => api.get<SubscriptionPlan[]>('/subscriptions/plans'),

  getPaymentConfig: () =>
    api.get<PaymentGatewayConfig>('/subscriptions/payment-config'),

  createPlan: (data: {
    name: string;
    slug: string;
    description?: string;
    price: number;
    billingCycle: 'MONTHLY' | 'YEARLY';
    maxVehicles: number;
    maxStaff: number;
    features: string[];
  }) => api.post<SubscriptionPlan>('/subscriptions/plans', data),

  updatePlan: (id: string, data: Partial<SubscriptionPlan>) =>
    api.patch<SubscriptionPlan>(`/subscriptions/plans/${id}`, data),

  togglePlanActive: (id: string) =>
    api.patch<SubscriptionPlan>(`/subscriptions/plans/${id}/toggle`),

  deletePlan: (id: string) =>
    api.delete(`/subscriptions/plans/${id}`),

  getCurrentSubscription: (tenantId: string) =>
    api.get<TenantSubscription>('/subscriptions/current', { tenantId }),

  subscribe: (tenantId: string, planId: string, paymentMethod: string) =>
    api.post('/subscriptions/subscribe', { planId, paymentMethod }, { tenantId }),
};
