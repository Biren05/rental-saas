import React, { useState } from 'react';
import {
  Building2,
  CreditCard,
  Shield,
  Save,
  Trash2,
  QrCode,
  AlertCircle,
} from 'lucide-react';
import { tenantService } from '../../../services';

export interface SystemSettingsData {
  platformName: string;
  supportEmail: string;
  defaultCurrency: string;
  maintenanceMode: boolean;
  esewaEnabled: boolean;
  khaltiEnabled: boolean;
  fonepayEnabled: boolean;
  autoApproveTenants: boolean;
  maxTrialDays: number;

  // eSewa QR & Config
  esewaQrUrl?: string;
  esewaId?: string;
  esewaAccountName?: string;

  // Khalti QR & Config
  khaltiQrUrl?: string;
  khaltiId?: string;
  khaltiAccountName?: string;

  // Fonepay QR & Config
  fonepayQrUrl?: string;
  fonepayMerchantCode?: string;
  fonepayAccountName?: string;

  // Bank Transfer QR & Config
  bankQrUrl?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountName?: string;
}

interface SettingsFormProps {
  settings: SystemSettingsData;
  onChange: (updated: SystemSettingsData) => void;
  onSubmit: (e: React.FormEvent) => void;
  saving: boolean;
}

type QrFieldKey = 'esewaQrUrl' | 'khaltiQrUrl' | 'fonepayQrUrl' | 'bankQrUrl';

interface CompactQrUploadProps {
  label: string;
  qrUrl?: string;
  isUploading: boolean;
  accentClass: string;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
}

const CompactQrUpload: React.FC<CompactQrUploadProps> = ({
  label,
  qrUrl,
  isUploading,
  accentClass,
  onUpload,
  onRemove,
}) => {
  if (qrUrl) {
    return (
      <div className="flex items-center justify-between gap-2.5 p-2 bg-white border border-slate-200 rounded-lg">
        <div className="flex items-center gap-2.5 min-w-0">
          <img
            src={qrUrl}
            alt={label}
            className="w-12 h-12 object-contain rounded border border-slate-100 shrink-0"
          />
          <div className="min-w-0">
            <span className="text-[11px] font-semibold text-emerald-700 block truncate">
              QR Active
            </span>
            <span className="text-[10px] text-slate-400 block truncate">{label}</span>
          </div>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors shrink-0 cursor-pointer"
        >
          <Trash2 className="w-3 h-3" />
          <span>Remove</span>
        </button>
      </div>
    );
  }

  return (
    <label
      className={`border border-dashed ${accentClass} bg-white rounded-lg px-3 py-2 flex items-center justify-center gap-2 cursor-pointer transition-colors`}
    >
      <QrCode className="w-4 h-4 shrink-0" />
      <span className="text-[11px] font-semibold text-slate-700 truncate">
        {isUploading ? 'Uploading QR...' : `Upload ${label} (Max 5MB)`}
      </span>
      <input
        type="file"
        accept="image/*"
        disabled={isUploading}
        onChange={onUpload}
        className="hidden"
      />
    </label>
  );
};

export const SettingsForm: React.FC<SettingsFormProps> = ({
  settings,
  onChange,
  onSubmit,
  saving,
}) => {
  const [uploadingTarget, setUploadingTarget] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileUpload = async (
    key: QrFieldKey,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image size must be less than 5MB.');
      return;
    }

    setUploadingTarget(key);
    setUploadError(null);

    try {
      const res = await tenantService.uploadApplicantDocument(file);
      onChange({
        ...settings,
        [key]: res.fileUrl,
      });
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload QR image.');
    } finally {
      setUploadingTarget(null);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {uploadError && (
        <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Section 1: General Platform Branding */}
      <div className="glass-panel p-4 space-y-3 bg-white border border-slate-200/80 shadow-xs rounded-xl">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
          <Building2 className="w-4 h-4 text-indigo-600" />
          <h3 className="font-semibold text-xs text-slate-900 uppercase tracking-wider">
            General SaaS Configuration
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="form-label text-[11px]">Platform Name</label>
            <input
              type="text"
              value={settings.platformName}
              onChange={(e) => onChange({ ...settings, platformName: e.target.value })}
              className="input-field text-xs py-1.5"
            />
          </div>

          <div>
            <label className="form-label text-[11px]">Support Email</label>
            <input
              type="email"
              value={settings.supportEmail}
              onChange={(e) => onChange({ ...settings, supportEmail: e.target.value })}
              className="input-field text-xs py-1.5"
            />
          </div>

          <div>
            <label className="form-label text-[11px]">Currency</label>
            <input
              type="text"
              disabled
              value={`${settings.defaultCurrency} (NPR)`}
              className="input-field text-xs py-1.5 bg-slate-50 opacity-90 cursor-not-allowed font-medium text-slate-700"
            />
          </div>
        </div>
      </div>

      {/* Section 2: Nepal Payment Gateways & QR Codes (Compact 2x2 Grid) */}
      <div className="glass-panel p-4 space-y-3 bg-white border border-slate-200/80 shadow-xs rounded-xl">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-indigo-600" />
            <div>
              <h3 className="font-semibold text-xs text-slate-900 uppercase tracking-wider">
                Payment Gateways & Official QR Codes (Nepal)
              </h3>
              <p className="text-[11px] text-slate-500">
                Shown to tenants when purchasing or upgrading subscription plans.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* 1. eSewa */}
          <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/30 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <h4 className="font-bold text-[11px] text-emerald-950 uppercase tracking-wider">
                  eSewa Wallet
                </h4>
              </div>
              <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-semibold text-emerald-800">
                <span>Enable</span>
                <input
                  type="checkbox"
                  checked={settings.esewaEnabled}
                  onChange={(e) => onChange({ ...settings, esewaEnabled: e.target.checked })}
                  className="w-3.5 h-3.5 accent-emerald-600 rounded cursor-pointer"
                />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                  eSewa ID / Phone
                </label>
                <input
                  type="text"
                  placeholder="9800000001"
                  value={settings.esewaId || ''}
                  onChange={(e) => onChange({ ...settings, esewaId: e.target.value })}
                  className="input-field text-xs py-1.5 font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                  Account Name
                </label>
                <input
                  type="text"
                  placeholder="AutoRent SaaS"
                  value={settings.esewaAccountName || ''}
                  onChange={(e) => onChange({ ...settings, esewaAccountName: e.target.value })}
                  className="input-field text-xs py-1.5"
                />
              </div>
            </div>

            <CompactQrUpload
              label="eSewa QR"
              qrUrl={settings.esewaQrUrl}
              isUploading={uploadingTarget === 'esewaQrUrl'}
              accentClass="border-emerald-300 hover:border-emerald-500 text-emerald-700"
              onUpload={(e) => handleFileUpload('esewaQrUrl', e)}
              onRemove={() => onChange({ ...settings, esewaQrUrl: '' })}
            />
          </div>

          {/* 2. Khalti */}
          <div className="p-3 rounded-xl border border-purple-200 bg-purple-50/30 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-600" />
                <h4 className="font-bold text-[11px] text-purple-950 uppercase tracking-wider">
                  Khalti Wallet
                </h4>
              </div>
              <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-semibold text-purple-800">
                <span>Enable</span>
                <input
                  type="checkbox"
                  checked={settings.khaltiEnabled}
                  onChange={(e) => onChange({ ...settings, khaltiEnabled: e.target.checked })}
                  className="w-3.5 h-3.5 accent-purple-600 rounded cursor-pointer"
                />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                  Khalti ID / Phone
                </label>
                <input
                  type="text"
                  placeholder="9800000001"
                  value={settings.khaltiId || ''}
                  onChange={(e) => onChange({ ...settings, khaltiId: e.target.value })}
                  className="input-field text-xs py-1.5 font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                  Merchant Name
                </label>
                <input
                  type="text"
                  placeholder="AutoRent SaaS"
                  value={settings.khaltiAccountName || ''}
                  onChange={(e) => onChange({ ...settings, khaltiAccountName: e.target.value })}
                  className="input-field text-xs py-1.5"
                />
              </div>
            </div>

            <CompactQrUpload
              label="Khalti QR"
              qrUrl={settings.khaltiQrUrl}
              isUploading={uploadingTarget === 'khaltiQrUrl'}
              accentClass="border-purple-300 hover:border-purple-500 text-purple-700"
              onUpload={(e) => handleFileUpload('khaltiQrUrl', e)}
              onRemove={() => onChange({ ...settings, khaltiQrUrl: '' })}
            />
          </div>

          {/* 3. Fonepay */}
          <div className="p-3 rounded-xl border border-rose-200 bg-rose-50/30 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-600" />
                <h4 className="font-bold text-[11px] text-rose-950 uppercase tracking-wider">
                  Fonepay Merchant
                </h4>
              </div>
              <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-semibold text-rose-800">
                <span>Enable</span>
                <input
                  type="checkbox"
                  checked={settings.fonepayEnabled}
                  onChange={(e) => onChange({ ...settings, fonepayEnabled: e.target.checked })}
                  className="w-3.5 h-3.5 accent-rose-600 rounded cursor-pointer"
                />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                  Merchant Code
                </label>
                <input
                  type="text"
                  placeholder="AUTORENT_SaaS"
                  value={settings.fonepayMerchantCode || ''}
                  onChange={(e) =>
                    onChange({ ...settings, fonepayMerchantCode: e.target.value })
                  }
                  className="input-field text-xs py-1.5 font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                  Merchant Name
                </label>
                <input
                  type="text"
                  placeholder="AutoRent SaaS"
                  value={settings.fonepayAccountName || ''}
                  onChange={(e) => onChange({ ...settings, fonepayAccountName: e.target.value })}
                  className="input-field text-xs py-1.5"
                />
              </div>
            </div>

            <CompactQrUpload
              label="Fonepay QR"
              qrUrl={settings.fonepayQrUrl}
              isUploading={uploadingTarget === 'fonepayQrUrl'}
              accentClass="border-rose-300 hover:border-rose-500 text-rose-700"
              onUpload={(e) => handleFileUpload('fonepayQrUrl', e)}
              onRemove={() => onChange({ ...settings, fonepayQrUrl: '' })}
            />
          </div>

          {/* 4. Bank Transfer */}
          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-2.5">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-700" />
              <h4 className="font-bold text-[11px] text-slate-900 uppercase tracking-wider">
                Bank Transfer
              </h4>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                  Bank Name
                </label>
                <input
                  type="text"
                  placeholder="Nabil Bank"
                  value={settings.bankName || ''}
                  onChange={(e) => onChange({ ...settings, bankName: e.target.value })}
                  className="input-field text-xs py-1.5"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                  Account No.
                </label>
                <input
                  type="text"
                  placeholder="012010..."
                  value={settings.bankAccountNumber || ''}
                  onChange={(e) => onChange({ ...settings, bankAccountNumber: e.target.value })}
                  className="input-field text-xs py-1.5 font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                  Account Name
                </label>
                <input
                  type="text"
                  placeholder="AutoRent Pvt."
                  value={settings.bankAccountName || ''}
                  onChange={(e) => onChange({ ...settings, bankAccountName: e.target.value })}
                  className="input-field text-xs py-1.5"
                />
              </div>
            </div>

            <CompactQrUpload
              label="Bank QR (Optional)"
              qrUrl={settings.bankQrUrl}
              isUploading={uploadingTarget === 'bankQrUrl'}
              accentClass="border-slate-300 hover:border-indigo-500 text-slate-600"
              onUpload={(e) => handleFileUpload('bankQrUrl', e)}
              onRemove={() => onChange({ ...settings, bankQrUrl: '' })}
            />
          </div>
        </div>
      </div>

      {/* Section 3: Platform Safeguards & Maintenance */}
      <div className="glass-panel p-4 space-y-2.5 bg-white border border-slate-200/80 shadow-xs rounded-xl">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
          <Shield className="w-4 h-4 text-rose-600" />
          <h3 className="font-semibold text-xs text-slate-900 uppercase tracking-wider">
            Platform Safeguards & Maintenance
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 cursor-pointer hover:bg-slate-100/70 transition-colors">
            <div>
              <div className="font-semibold text-slate-900 text-xs">Auto-Approve New Tenants</div>
              <div className="text-[10px] text-slate-500">
                Provision 14-day trial without manual approval
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.autoApproveTenants}
              onChange={(e) => onChange({ ...settings, autoApproveTenants: e.target.checked })}
              className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-2.5 rounded-xl bg-rose-50 border border-rose-200 cursor-pointer hover:bg-rose-100/70 transition-colors">
            <div>
              <div className="font-semibold text-rose-800 text-xs">Platform Maintenance Mode</div>
              <div className="text-[10px] text-rose-600">
                Halt all non-admin traffic during upgrades
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.maintenanceMode}
              onChange={(e) => onChange({ ...settings, maintenanceMode: e.target.checked })}
              className="w-4 h-4 accent-rose-600 rounded cursor-pointer"
            />
          </label>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving || uploadingTarget !== null}
          className="btn-primary text-xs px-5 py-2 disabled:opacity-50 flex items-center gap-2 shadow-sm shadow-indigo-500/20 cursor-pointer"
        >
          <Save className="w-3.5 h-3.5" />
          {saving ? 'Saving Settings...' : 'Save Configuration & QR Codes'}
        </button>
      </div>
    </form>
  );
};
