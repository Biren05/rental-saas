'use client';

import React from 'react';
import {
  X,
  User,
  LogOut,
  CheckCircle2,
  Receipt,
  Calendar,
  Car,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import {
  CustomerPortalProfile,
  CustomerSavedDocuments,
  CustomerPortalBooking,
} from '@/services/public-rental.service';

interface CustomerPortalModalProps {
  isOpen: boolean;
  slug: string;
  customer: CustomerPortalProfile;
  savedDocuments: CustomerSavedDocuments;
  bookings: CustomerPortalBooking[];
  onClose: () => void;
  onLogout: () => void;
}

export const CustomerPortalModal: React.FC<CustomerPortalModalProps> = ({
  isOpen,
  slug,
  customer,
  savedDocuments,
  bookings,
  onClose,
  onLogout,
}) => {
  if (!isOpen) return null;

  const statusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      case 'CONFIRMED':
        return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20';
      case 'COMPLETED':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'CANCELLED':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
      default:
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#111827] rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              {customer.fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                My Bookings & Profile
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {customer.fullName} • {customer.phone} • {customer.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
          {/* Saved Verification Documents Banner */}
          <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Saved Verification Documents (Auto-fill Enabled)</span>
              </span>
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">
                Ready for next booking
              </span>
            </div>

            <div className="flex flex-wrap gap-2 text-[11px]">
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border font-semibold ${
                  savedDocuments.citizenshipUrl
                    ? 'bg-white dark:bg-[#0c111d] border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400'
                    : 'bg-slate-100 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-400'
                }`}
              >
                <CheckCircle2 className="w-3 h-3" />
                <span>Citizenship {savedDocuments.citizenshipUrl ? 'Saved' : 'Not Uploaded'}</span>
              </span>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border font-semibold ${
                  savedDocuments.drivingLicenseUrl
                    ? 'bg-white dark:bg-[#0c111d] border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400'
                    : 'bg-slate-100 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-400'
                }`}
              >
                <CheckCircle2 className="w-3 h-3" />
                <span>
                  Driving License {savedDocuments.drivingLicenseUrl ? 'Saved' : 'Not Uploaded'}
                </span>
              </span>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border font-semibold ${
                  savedDocuments.bankChequeUrl
                    ? 'bg-white dark:bg-[#0c111d] border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400'
                    : 'bg-slate-100 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-400'
                }`}
              >
                <CheckCircle2 className="w-3 h-3" />
                <span>Bank Cheque {savedDocuments.bankChequeUrl ? 'Saved' : 'Optional'}</span>
              </span>
            </div>
          </div>

          {/* Bookings List */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              <span>Your Reservations ({bookings.length})</span>
            </h4>

            {bookings.length === 0 ? (
              <div className="p-8 text-center rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 space-y-2">
                <Car className="w-7 h-7 text-slate-400 mx-auto" />
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  No bookings found at this agency yet.
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Your saved profile and documents are ready whenever you reserve a vehicle.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {bookings.map((b) => (
                  <div
                    key={b.id}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c111d] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded">
                          #BK-{b.id.slice(0, 8).toUpperCase()}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded border ${statusBadge(
                            b.status
                          )}`}
                        >
                          {b.status}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {b.summary.durationDays} {b.summary.durationDays === 1 ? 'Day' : 'Days'}
                        </span>
                      </div>

                      <div className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {b.vehicle?.brand} {b.vehicle?.model}{' '}
                        <span className="text-xs font-normal text-slate-500">
                          ({b.vehicle?.plateNumber})
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                        <Calendar className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <span>
                          {new Date(b.startDate).toLocaleDateString('en-US', {
                            dateStyle: 'medium',
                          })}{' '}
                          →{' '}
                          {new Date(b.endDate).toLocaleDateString('en-US', {
                            dateStyle: 'medium',
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800 shrink-0">
                      <div className="text-left sm:text-right">
                        <div className="text-xs font-bold text-slate-900 dark:text-white">
                          NPR {b.summary.totalAmount.toLocaleString()}
                        </div>
                        <div className="text-[10px]">
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                            Paid: NPR {b.summary.paidAmount.toLocaleString()}
                          </span>
                          {b.summary.dueAmount > 0 && (
                            <span className="text-amber-600 dark:text-amber-400 font-semibold ml-1.5">
                              • Due: NPR {b.summary.dueAmount.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>

                      <a
                        href={`/rent/${slug}/confirmation/${b.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold shadow-2xs transition-colors"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        <span>Receipt</span>
                        <ExternalLink className="w-3 h-3 opacity-80" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
