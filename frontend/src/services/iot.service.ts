import { api } from '../lib/api';

export interface IotDevice {
  id: string;
  tenantId: string;
  vehicleId?: string | null;
  imei: string;
  deviceName: string;
  deviceType: string;
  model?: string;
  simNumber?: string;
  status: 'ONLINE' | 'OFFLINE' | 'ALARM';
  batteryLevel?: number;
  ignitionStatus: boolean;
  isEngineLocked: boolean;
  lastPingAt?: string;
  lastLatitude?: number;
  lastLongitude?: number;
  lastSpeed?: number;
  createdAt: string;
  updatedAt: string;
  vehicle?: {
    id: string;
    plateNumber: string;
    brand: string;
    model: string;
    color?: string;
    status: string;
    imageUrl?: string;
  };
}

export interface PairDeviceInput {
  imei: string;
  deviceName: string;
  vehicleId?: string;
  deviceType?: string;
  model?: string;
  simNumber?: string;
}

export const iotService = {
  getTenantDevices: (tenantId: string) =>
    api.get<IotDevice[]>('/iot/tenant-devices', { tenantId }),

  pairDevice: (tenantId: string, data: PairDeviceInput) =>
    api.post<IotDevice>('/iot/pair', data, { tenantId }),

  unpairDevice: (tenantId: string, deviceId: string) =>
    api.delete(`/iot/unpair/${deviceId}`, { tenantId }),

  toggleEngineLock: (tenantId: string, deviceId: string, lock: boolean) =>
    api.post<{ success: boolean; isEngineLocked: boolean; message: string }>(
      `/iot/device/${deviceId}/engine-lock`,
      { lock },
      { tenantId },
    ),

  getVehicleTracking: (tenantId: string, vehicleId: string) =>
    api.get<{
      vehicle: any;
      device: IotDevice | null;
      trail: Array<{ latitude: number; longitude: number; speed: number; recordedAt: string }>;
    }>(`/iot/vehicle/${vehicleId}/live`, { tenantId }),

  simulateMovement: (tenantId: string, deviceId: string) =>
    api.post(`/iot/device/${deviceId}/simulate`, {}, { tenantId }),
};
