import { api } from '../lib/api';
import { PlatformUser } from '../components/superadmin/users/UsersTable';
import { PlatformPayment } from '../components/superadmin/billing/BillingTable';
import { AuditLog } from '../components/superadmin/logs/AuditLogsTable';
import { SystemSettingsData } from '../components/superadmin/settings/SettingsForm';

export interface DashboardMetrics {
  totalUsers: number;
  totalVehicles: number;
  totalQrCodes: number;
  totalPayments: number;
}

export const adminService = {
  getDashboardStats: () => api.get<DashboardMetrics>('/admin/stats'),

  getAllUsers: () => api.get<PlatformUser[]>('/admin/users'),

  updateUserRole: (userId: string, role: string) =>
    api.patch<PlatformUser>(`/admin/users/${userId}/role`, { role }),

  getAllBilling: () => api.get<PlatformPayment[]>('/admin/billing'),

  getAuditLogs: () => api.get<AuditLog[]>('/admin/logs'),

  getSystemSettings: () => api.get<SystemSettingsData>('/admin/settings'),

  updateSystemSettings: (settings: Partial<SystemSettingsData>) =>
    api.patch<SystemSettingsData>('/admin/settings', settings),
};
