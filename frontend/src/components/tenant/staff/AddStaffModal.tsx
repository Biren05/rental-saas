'use client';

import React, { useState } from 'react';
import { X, UserPlus, AlertCircle } from 'lucide-react';
import { TenantRole } from '../../../types';

interface AddStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (email: string, role: TenantRole) => Promise<void>;
}

export const AddStaffModal: React.FC<AddStaffModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<TenantRole>('STAFF');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }

    try {
      setLoading(true);
      await onSubmit(email.trim(), role);
      setEmail('');
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to add member to team.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      {/* Click outside backdrop */}
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      {/* Modal Card */}
      <div
        className="relative w-full max-w-md bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-900 dark:text-slate-100 z-10 my-auto"
        style={{ backgroundColor: 'var(--bg-card, #ffffff)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-500/15 border border-indigo-100 dark:border-indigo-500/25 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 shadow-2xs">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white font-['Outfit']">Add Team Member</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Grant operations access to your rental organization</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mx-5 mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-2.5 text-xs text-rose-600 dark:text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Email Address <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              required
              placeholder="e.g. driver@pokharawheels.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-2xs"
            />
            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
              User must be already registered or will be granted immediate access.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Assign Role <span className="text-rose-500">*</span>
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as TenantRole)}
              className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-2xs"
            >
              <option value="STAFF">Frontdesk Staff (Reservations & Check-in)</option>
              <option value="DRIVER">Fleet Driver (Assigned Trips)</option>
              <option value="MANAGER">Operations Manager (Fleet & Pricing)</option>
              <option value="ADMIN">Organization Co-Admin</option>
            </select>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md shadow-indigo-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Adding Member...</span>
                </>
              ) : (
                'Add Member'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
