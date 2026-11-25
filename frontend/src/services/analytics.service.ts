import { api } from '../lib/api';

export interface VehicleTypeDistribution {
  vehicleType: string;
  _count: { id: number };
}

export interface MonthlyRegistration {
  period: string;
  newUsers: number;
  newVehicles: number;
}

export const analyticsService = {
  getVehicleTypeDistribution: () =>
    api.get<VehicleTypeDistribution[]>('/analytics/vehicle-types'),

  getMonthlyRegistrations: () =>
    api.get<MonthlyRegistration>('/analytics/monthly'),
};
