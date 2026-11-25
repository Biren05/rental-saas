import { api } from '../lib/api';
import { Tenant, TenantDocument } from '../types';

export interface CreateTenantInput {
  name: string;
  slug?: string;
  domain?: string;
  address?: string;
  phone?: string;
  email?: string;
  logoUrl?: string;
  planId?: string;
  status?: 'ACTIVE' | 'SUSPENDED' | 'PENDING';
  ownerName?: string;
  ownerEmail?: string;
  documentUrl?: string;
  documentType?: string;
  paymentReceiptUrl?: string;
  paymentMethod?: string;
  transactionId?: string;
  paymentNote?: string;
}

export interface CreatedTenantResult extends Tenant {
  temporaryCredentials?: {
    email: string;
    temporaryPassword: string;
    ownerName?: string;
  } | null;
}

export interface UpdateTenantInput {
  name?: string;
  slug?: string;
  domain?: string;
  address?: string;
  phone?: string;
  email?: string;
  logoUrl?: string;
  paymentQrUrl?: string;
  esewaQrUrl?: string;
  khaltiQrUrl?: string;
  fonepayQrUrl?: string;
  bankAccountDetails?: string;
  whatsappUrl?: string;
  tiktokUrl?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  status?: 'ACTIVE' | 'SUSPENDED' | 'PENDING';
}

export const tenantService = {
  getAllTenants: () => api.get<Tenant[]>('/tenants'),

  getTenantById: (id: string) => api.get<Tenant>(`/tenants/${id}`, { tenantId: id }),

  updateTenantStatus: (tenantId: string, status: 'ACTIVE' | 'SUSPENDED' | 'PENDING') =>
    api.patch<CreatedTenantResult>(`/tenants/${tenantId}/status`, { status }),

  uploadApplicantDocument: async (
    file: File,
  ): Promise<{ fileUrl: string; originalFilename: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
    const res = await fetch(`${apiUrl}/tenants/apply/upload`, {
      method: 'POST',
      body: formData,
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      throw new Error(data?.message || 'Failed to upload document attachment.');
    }
    return data && data.data ? data.data : data;
  },

  applyTenant: (data: CreateTenantInput) => api.post<CreatedTenantResult>('/tenants/apply', data),

  createTenant: (data: CreateTenantInput) => api.post<CreatedTenantResult>('/tenants', data),

  updateTenant: (id: string, data: UpdateTenantInput) =>
    api.patch<Tenant>(`/tenants/${id}`, data),

  deleteTenant: (id: string) =>
    api.delete<{ message: string; id: string }>(`/tenants/${id}`),

  getMyTenants: () => api.get<Tenant[]>('/tenants/my'),

  getTenantDocuments: (tenantId: string) =>
    api.get<TenantDocument[]>(`/tenants/${tenantId}/documents`),

  uploadTenantDocument: (tenantId: string, formData: FormData) =>
    api.post<TenantDocument>(`/tenants/${tenantId}/documents`, formData),

  deleteTenantDocument: (tenantId: string, docId: string) =>
    api.delete<{ success: boolean; message: string; id: string }>(
      `/tenants/${tenantId}/documents/${docId}`,
    ),

  getCurrentTenant: (tenantId: string) =>
    api.get<Tenant>('/tenants/current', { tenantId }),

  updateCurrentTenant: (tenantId: string, data: UpdateTenantInput) =>
    api.patch<Tenant>('/tenants/current', data, { tenantId }),

  addMember: (tenantId: string, data: { email: string; role: string }) =>
    api.post('/tenants/current/members', data, { tenantId }),

  removeMember: (tenantId: string, userId: string) =>
    api.delete(`/tenants/current/members/${userId}`, { tenantId }),
};
