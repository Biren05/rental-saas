import { api } from '../lib/api';
import { Vehicle, VehicleStatus } from '../types';

export interface CreateVehicleInput {
  plateNumber: string;
  vehicleType: string;
  brand: string;
  model: string;
  color: string;
  chassisNumber?: string;
  engineNumber?: string;
  dailyRate?: number;
  hourlyRate?: number;
  status?: VehicleStatus;
  imageUrl?: string;
}

export interface UpdateVehicleInput {
  plateNumber?: string;
  brand?: string;
  model?: string;
  color?: string;
  dailyRate?: number;
  hourlyRate?: number;
  status?: VehicleStatus;
  imageUrl?: string;
}

export const vehicleService = {
  getTenantVehicles: (tenantId?: string) =>
    api.get<Vehicle[]>('/vehicles/tenant', { tenantId }),

  getVehicleById: (id: string) =>
    api.get<Vehicle>(`/vehicles/${id}`),

  uploadVehicleImage: async (file: File): Promise<{ imageUrl: string; publicId: string }> => {
    const formData = new FormData();
    formData.append('file', file);

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const headers: Record<string, string> = {};
    if (token && token !== 'undefined' && token !== 'null') {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
    const res = await fetch(`${apiUrl}/vehicles/upload-image`, {
      method: 'POST',
      headers,
      body: formData,
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      throw new Error(data?.message || 'Failed to upload vehicle image.');
    }
    return data && data.data ? data.data : data;
  },

  createVehicle: (data: CreateVehicleInput, tenantId?: string) =>
    api.post<Vehicle>('/vehicles/tenant', data, { tenantId }),

  updateVehicle: (id: string, data: UpdateVehicleInput) =>
    api.patch<Vehicle>(`/vehicles/${id}`, data),

  deleteVehicle: (id: string) =>
    api.delete<{ success: boolean; message: string }>(`/vehicles/${id}`),
};
