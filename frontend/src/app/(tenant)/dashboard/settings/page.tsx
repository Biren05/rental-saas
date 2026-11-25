'use client';

import React, { useState, useEffect } from 'react';
import { useTenant } from '@/context/TenantContext';
import { tenantService, UpdateTenantInput } from '@/services/tenant.service';
import { Save, CheckCircle2, AlertCircle, QrCode, Upload, Trash2, CreditCard } from 'lucide-react';

export default function TenantSettingsPage() {
  const { tenant, tenantId, refreshTenant } = useTenant();

  const [formData, setFormData] = useState<UpdateTenantInput>({
    name: '',
    slug: '',
    domain: '',
    email: '',
    phone: '',
    address: '',
    logoUrl: '',
    paymentQrUrl: '',
    esewaQrUrl: '',
    khaltiQrUrl: '',
    fonepayQrUrl: '',
    bankAccountDetails: '',
    whatsappUrl: '',
    tiktokUrl: '',
    facebookUrl: '',
    instagramUrl: '',
  });

  const [loading, setLoading] = useState(false);
  const [uploadingQr, setUploadingQr] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  useEffect(() => {
    if (tenant) {
      setFormData({
        name: tenant.name || '',
        slug: tenant.slug || '',
        domain: tenant.domain || '',
        email: tenant.email || '',
        phone: tenant.phone || '',
        address: tenant.address || '',
        logoUrl: tenant.logoUrl || '',
        paymentQrUrl: tenant.paymentQrUrl || '',
        esewaQrUrl: tenant.esewaQrUrl || '',
        khaltiQrUrl: tenant.khaltiQrUrl || '',
        fonepayQrUrl: tenant.fonepayQrUrl || '',
        bankAccountDetails: tenant.bankAccountDetails || '',
        whatsappUrl: tenant.whatsappUrl || '',
        tiktokUrl: tenant.tiktokUrl || '',
        facebookUrl: tenant.facebookUrl || '',
        instagramUrl: tenant.instagramUrl || '',
      });
    }
  }, [tenant]);

  const handleQrUpload = async (
    file: File,
    field: 'paymentQrUrl' | 'esewaQrUrl' | 'khaltiQrUrl' | 'fonepayQrUrl'
  ) => {
    try {
      setUploadingQr(field);
      setFeedback(null);
      const fd = new FormData();
      fd.append('file', file);
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/vehicles/upload-image`,
        {
          method: 'POST',
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: fd,
        }
      );
      const data = await res.json();
      const imageUrl = data?.data?.imageUrl || data?.imageUrl;
      if (!imageUrl) throw new Error(data?.message || 'Failed to upload QR image.');
      setFormData((prev) => ({ ...prev, [field]: imageUrl }));
      setFeedback({
        type: 'success',
        message: 'QR Code image uploaded. Click Save Settings to persist.',
      });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Failed to upload QR image.' });
    } finally {
      setUploadingQr(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId) return;
    setFeedback(null);

    try {
      setLoading(true);
      await tenantService.updateCurrentTenant(tenantId, formData);
      setFeedback({ type: 'success', message: 'Settings saved successfully.' });
      await refreshTenant();
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err?.message || 'Failed to update settings.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Company Settings</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Configure your business profile, contact details, and public portal slug.
        </p>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-3 rounded-lg border flex items-center justify-between text-xs shadow-xs ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/20 text-rose-700 dark:text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white text-xs ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* Clean Form */}
      <form
        onSubmit={handleSubmit}
        className="p-5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 space-y-5 shadow-xs"
      >
        <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
          <h2 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
            General Information
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Business Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Portal Slug <span className="text-rose-500">*</span>
            </label>
            <div className="flex">
              <span className="inline-flex items-center px-2.5 rounded-l-lg border border-r-0 border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-500 text-xs font-mono">
                /
              </span>
              <input
                type="text"
                required
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-r-lg px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Custom Domain (Optional)
            </label>
            <input
              type="text"
              value={formData.domain || ''}
              onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Logo URL
            </label>
            <input
              type="url"
              value={formData.logoUrl || ''}
              onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="border-b border-slate-200 dark:border-slate-800 pb-3 pt-2">
          <h2 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
            Contact & Operations
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Contact Email
            </label>
            <input
              type="email"
              value={formData.email || ''}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Phone Number
            </label>
            <input
              type="text"
              value={formData.phone || ''}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Depot / Physical Address
            </label>
            <input
              type="text"
              value={formData.address || ''}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Payment QR Codes & Banking Section */}
        <div className="border-b border-slate-200 dark:border-slate-800 pb-3 pt-2">
          <h2 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
            <QrCode className="w-3.5 h-3.5 text-indigo-600" />
            <span>Customer Payment QR Codes & Banking Details</span>
          </h2>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Upload your agency&apos;s payment QR codes so customers can scan and pay during vehicle booking.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Primary / Fonepay All-In-One QR Code */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <QrCode className="w-3.5 h-3.5 text-rose-600" />
                <span>Primary Payment QR (Fonepay / Bank QR)</span>
              </label>
              {formData.paymentQrUrl && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                  Active
                </span>
              )}
            </div>

            {formData.paymentQrUrl ? (
              <div className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 h-44 flex items-center justify-center p-2">
                <img
                  src={formData.paymentQrUrl}
                  alt="Primary Payment QR"
                  className="max-h-full max-w-full object-contain"
                />
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, paymentQrUrl: '' })}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-rose-500 text-white shadow-xs hover:bg-rose-600 transition-colors"
                  title="Remove QR"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-44 border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-indigo-500 rounded-xl bg-white dark:bg-slate-900 cursor-pointer text-center group transition-colors p-3">
                <Upload className="w-5 h-5 text-indigo-500 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  {uploadingQr === 'paymentQrUrl' ? 'Uploading QR...' : 'Upload Primary QR Code'}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">
                  Fonepay, SmartQR, or Bank QR (JPG/PNG)
                </span>
                <input
                  type="file"
                  accept="image/*"
                  disabled={!!uploadingQr}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleQrUpload(file, 'paymentQrUrl');
                  }}
                  className="hidden"
                />
              </label>
            )}

            <div>
              <label className="block text-[10px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                Or enter QR Image URL directly:
              </label>
              <input
                type="url"
                value={formData.paymentQrUrl || ''}
                onChange={(e) => setFormData({ ...formData, paymentQrUrl: e.target.value })}
                placeholder="https://..."
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-900 dark:text-slate-100 font-mono"
              />
            </div>
          </div>

          {/* Dedicated eSewa QR Code */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <div className="w-4 h-4 rounded bg-emerald-600 text-white font-bold text-[9px] flex items-center justify-center shrink-0">
                  e
                </div>
                <span>Dedicated eSewa QR (Optional)</span>
              </label>
              {formData.esewaQrUrl && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                  Active
                </span>
              )}
            </div>

            {formData.esewaQrUrl ? (
              <div className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 h-44 flex items-center justify-center p-2">
                <img
                  src={formData.esewaQrUrl}
                  alt="eSewa QR"
                  className="max-h-full max-w-full object-contain"
                />
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, esewaQrUrl: '' })}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-rose-500 text-white shadow-xs hover:bg-rose-600 transition-colors"
                  title="Remove QR"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-44 border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-emerald-500 rounded-xl bg-white dark:bg-slate-900 cursor-pointer text-center group transition-colors p-3">
                <Upload className="w-5 h-5 text-emerald-500 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  {uploadingQr === 'esewaQrUrl' ? 'Uploading eSewa QR...' : 'Upload eSewa QR'}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">
                  eSewa Merchant or Personal QR
                </span>
                <input
                  type="file"
                  accept="image/*"
                  disabled={!!uploadingQr}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleQrUpload(file, 'esewaQrUrl');
                  }}
                  className="hidden"
                />
              </label>
            )}

            <div>
              <label className="block text-[10px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                Or enter eSewa QR Image URL:
              </label>
              <input
                type="url"
                value={formData.esewaQrUrl || ''}
                onChange={(e) => setFormData({ ...formData, esewaQrUrl: e.target.value })}
                placeholder="https://..."
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-900 dark:text-slate-100 font-mono"
              />
            </div>
          </div>

          {/* Dedicated Khalti QR Code */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <div className="w-4 h-4 rounded bg-purple-600 text-white font-bold text-[9px] flex items-center justify-center shrink-0">
                  K
                </div>
                <span>Dedicated Khalti QR (Optional)</span>
              </label>
              {formData.khaltiQrUrl && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-600 border border-purple-500/20">
                  Active
                </span>
              )}
            </div>

            {formData.khaltiQrUrl ? (
              <div className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 h-44 flex items-center justify-center p-2">
                <img
                  src={formData.khaltiQrUrl}
                  alt="Khalti QR"
                  className="max-h-full max-w-full object-contain"
                />
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, khaltiQrUrl: '' })}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-rose-500 text-white shadow-xs hover:bg-rose-600 transition-colors"
                  title="Remove QR"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-44 border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-purple-500 rounded-xl bg-white dark:bg-slate-900 cursor-pointer text-center group transition-colors p-3">
                <Upload className="w-5 h-5 text-purple-500 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                  {uploadingQr === 'khaltiQrUrl' ? 'Uploading Khalti QR...' : 'Upload Khalti QR'}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">
                  Khalti Merchant or Personal QR
                </span>
                <input
                  type="file"
                  accept="image/*"
                  disabled={!!uploadingQr}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleQrUpload(file, 'khaltiQrUrl');
                  }}
                  className="hidden"
                />
              </label>
            )}

            <div>
              <label className="block text-[10px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                Or enter Khalti QR Image URL:
              </label>
              <input
                type="url"
                value={formData.khaltiQrUrl || ''}
                onChange={(e) => setFormData({ ...formData, khaltiQrUrl: e.target.value })}
                placeholder="https://..."
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-900 dark:text-slate-100 font-mono"
              />
            </div>
          </div>

          {/* Bank Account Details */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                <span>Direct Bank Account Details (Optional)</span>
              </label>
            </div>
            <textarea
              rows={5}
              value={formData.bankAccountDetails || ''}
              onChange={(e) => setFormData({ ...formData, bankAccountDetails: e.target.value })}
              placeholder="e.g.&#10;Bank Name: Nabil Bank Ltd&#10;Account Name: Kathmandu AutoRent Pvt Ltd&#10;Account Number: 01201017500123&#10;Branch: Thamel, Kathmandu"
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
            <p className="text-[10px] text-slate-400">
              Customers can copy these bank details to pay via mobile banking or connectIPS.
            </p>
          </div>
        </div>

        {/* Social Media & WhatsApp Links (Displayed in Public Storefront Footer) */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-3">
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white">
              Social Media & WhatsApp Links (Public Footer)
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Add your agency links below so customers can reach you directly from the public storefront footer.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                WhatsApp Number or Link
              </label>
              <input
                type="text"
                value={formData.whatsappUrl || ''}
                onChange={(e) => setFormData({ ...formData, whatsappUrl: e.target.value })}
                placeholder="e.g. 9862463031 or https://wa.me/9779862463031"
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                TikTok Profile URL
              </label>
              <input
                type="url"
                value={formData.tiktokUrl || ''}
                onChange={(e) => setFormData({ ...formData, tiktokUrl: e.target.value })}
                placeholder="https://www.tiktok.com/@youragency"
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Facebook Page URL
              </label>
              <input
                type="url"
                value={formData.facebookUrl || ''}
                onChange={(e) => setFormData({ ...formData, facebookUrl: e.target.value })}
                placeholder="https://www.facebook.com/youragency"
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Instagram Profile URL
              </label>
              <input
                type="url"
                value={formData.instagramUrl || ''}
                onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
                placeholder="https://www.instagram.com/youragency"
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end pt-3 border-t border-slate-200 dark:border-slate-800">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{loading ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
