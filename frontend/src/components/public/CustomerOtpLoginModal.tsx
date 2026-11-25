'use client';

import React, { useState } from 'react';
import {
  Mail,
  KeyRound,
  X,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ArrowLeft,
} from 'lucide-react';
import {
  publicRentalService,
  CustomerPortalProfile,
  CustomerSavedDocuments,
} from '@/services/public-rental.service';

interface CustomerOtpLoginModalProps {
  isOpen: boolean;
  slug: string;
  tenantName: string;
  initialEmail?: string;
  onClose: () => void;
  onSuccess: (data: {
    token: string;
    customer: CustomerPortalProfile;
    savedDocuments: CustomerSavedDocuments;
  }) => void;
}

export const CustomerOtpLoginModal: React.FC<CustomerOtpLoginModalProps> = ({
  isOpen,
  slug,
  tenantName,
  initialEmail = '',
  onClose,
  onSuccess,
}) => {
  const [step, setStep] = useState<'EMAIL' | 'OTP'>('EMAIL');
  const [email, setEmail] = useState<string>(initialEmail);
  const [code, setCode] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setInfoMsg(null);
      const res = await publicRentalService.requestCustomerOtp(slug, email.trim());
      const payload = (res as any)?.data || res;

      if (payload.notFound || !payload.sent) {
        setInfoMsg(
          payload.message ||
            'No previous bookings found for this email. You can book directly as a guest!'
        );
        return;
      }

      setInfoMsg(payload.message || `6-digit code sent to ${email.trim()}`);
      setStep('OTP');
    } catch (err: any) {
      setError(err?.message || 'Could not send verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim().length < 6) {
      setError('Please enter the 6-digit verification code sent to your email.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await publicRentalService.verifyCustomerOtp(slug, email.trim(), code.trim());
      const payload = (res as any)?.data || res;
      onSuccess(payload);
    } catch (err: any) {
      setError(err?.message || 'Invalid or expired verification code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#111827] rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                Customer Portal & Auto-Fill
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Passwordless Email OTP • {tenantName}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {infoMsg && (
            <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-indigo-600 dark:text-indigo-400" />
              <span>{infoMsg}</span>
            </div>
          )}

          {step === 'EMAIL' ? (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Enter the email address you used for a previous booking to view your{' '}
                <strong>My Bookings</strong>, download receipts, and auto-fill your saved verification
                documents.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. ramesh@example.com"
                    className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0c111d] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Sending Code...</span>
                  </>
                ) : (
                  <>
                    <span>Send 6-Digit OTP</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Enter 6-Digit Verification Code *
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="6-digit OTP"
                    className="w-full pl-9 pr-3 py-2.5 text-sm font-mono tracking-[0.35em] font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0c111d] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setStep('EMAIL');
                    setCode('');
                    setError(null);
                  }}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Change Email</span>
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Verify & Continue</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
