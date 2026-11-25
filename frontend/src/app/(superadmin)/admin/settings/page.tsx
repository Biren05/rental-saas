'use client';

import React, { useEffect, useState } from 'react';
import { adminService } from '../../../../services';
import { CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';
import { SettingsForm, SystemSettingsData } from '../../../../components/superadmin/settings/SettingsForm';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SystemSettingsData>({
    platformName: 'AutoRent SaaS',
    supportEmail: 'support@autorent.com.np',
    defaultCurrency: 'NPR',
    maintenanceMode: false,
    esewaEnabled: true,
    khaltiEnabled: true,
    fonepayEnabled: true,
    autoApproveTenants: true,
    maxTrialDays: 14,
    esewaQrUrl: '',
    esewaId: '9800000001',
    esewaAccountName: 'AutoRent SaaS (eSewa)',
    khaltiQrUrl: '',
    khaltiId: '9800000001',
    khaltiAccountName: 'AutoRent SaaS (Khalti)',
    fonepayQrUrl: '',
    fonepayMerchantCode: 'AUTORENT_SaaS',
    fonepayAccountName: 'AutoRent SaaS (Fonepay)',
    bankQrUrl: '',
    bankName: 'Nabil Bank Ltd.',
    bankAccountNumber: '01201017500001',
    bankAccountName: 'AutoRent Technologies Pvt. Ltd.',
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const data = await adminService.getSystemSettings();
      if (data) setSettings(data);
    } catch (err) {
      console.error('Failed to load system settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      const updated = await adminService.updateSystemSettings(settings);
      setSettings(updated);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-['Outfit']">
            System <span className="text-indigo-600">Settings</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Global SaaS configuration, subscription defaults, and payment gateway QR codes.
          </p>
        </div>

        <button
          onClick={fetchSettings}
          className="btn-secondary text-xs px-3.5 py-2 self-start sm:self-auto"
          title="Reset to Server"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Reset to Server
        </button>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-xs text-emerald-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Platform system settings saved successfully.</span>
        </div>
      )}

      {settings.maintenanceMode && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-xs text-rose-800">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>
            <strong>Warning:</strong> Maintenance mode is currently <strong>ACTIVE</strong>. Customer bookings and public endpoints are temporarily halted.
          </span>
        </div>
      )}

      {/* Settings Form Component */}
      <SettingsForm
        settings={settings}
        onChange={setSettings}
        onSubmit={handleSave}
        saving={saving}
      />
    </div>
  );
}
