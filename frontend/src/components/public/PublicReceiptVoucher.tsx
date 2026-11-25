'use client';

import React from 'react';
import {
  MapPin,
  Phone,
  Mail,
  CheckCircle2,
  Upload,
} from 'lucide-react';
import { PublicBookingConfirmation } from '@/services/public-rental.service';

interface PublicReceiptVoucherProps {
  bookingData: PublicBookingConfirmation;
  uploadingSlip?: boolean;
  onUploadSlip?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const PublicReceiptVoucher: React.FC<PublicReceiptVoucherProps> = ({
  bookingData,
  uploadingSlip = false,
  onUploadSlip,
}) => {
  const { booking, summary } = bookingData;
  const { vehicle, tenant, customer } = booking;

  const startDateFormatted = new Date(booking.startDate).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const endDateFormatted = new Date(booking.endDate).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md overflow-hidden print-full text-xs">
      {/* Header Section: Agency Branding & Invoice Meta */}
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
            {tenant.name.slice(0, 1).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-extrabold text-slate-900 dark:text-white leading-tight">
                {tenant.name}
              </h1>
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Verified Host
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
              {tenant.address && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-2.5 h-2.5 text-slate-400" />
                  {tenant.address}
                </span>
              )}
              {tenant.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-2.5 h-2.5 text-slate-400" />
                  {tenant.phone}
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="sm:text-right shrink-0">
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
            Booking Receipt Voucher
          </span>
          <div className="text-xs font-mono font-black text-indigo-600 dark:text-indigo-400">
            #BK-{booking.id.slice(0, 8).toUpperCase()}
          </div>
          <div className="text-[9px] text-slate-400 mt-0.5">
            Issued: {new Date(booking.createdAt || Date.now()).toLocaleDateString('en-US', { dateStyle: 'medium' })}
          </div>
        </div>
      </div>

      {/* Compact Status Ribbon */}
      <div className="px-4 py-1.5 bg-indigo-50/50 dark:bg-indigo-950/20 border-b border-indigo-100 dark:border-indigo-900/50 flex flex-wrap items-center justify-between gap-1 text-[11px]">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="font-bold text-slate-800 dark:text-slate-200">
            Reservation Confirmed:
          </span>
          <span className="text-slate-600 dark:text-slate-400 text-[10px]">
            Vehicle reserved for <strong>{booking.customerName || customer?.fullName || 'Customer'}</strong>
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-[10px]">
          <span className="text-slate-500">Payment:</span>
          <span
            className={`font-bold px-1.5 py-0.2 rounded-full text-[9px] ${
              summary.dueAmount === 0
                ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                : summary.paidAmount && summary.paidAmount > 0
                ? 'bg-indigo-500/10 text-indigo-600 border border-indigo-500/20'
                : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
            }`}
          >
            {summary.dueAmount === 0
              ? 'Fully Paid'
              : summary.paidAmount
              ? `Advance (${summary.paymentMethod || 'Online'})`
              : 'Pay on Pickup'}
          </span>
        </div>
      </div>

      {/* Email Dispatched Confirmation Banner */}
      <div className="px-4 py-1.5 bg-emerald-500/10 dark:bg-emerald-500/15 border-b border-emerald-500/20 flex items-center justify-between gap-2 text-xs text-emerald-800 dark:text-emerald-300">
        <div className="flex items-center gap-1.5">
          <Mail className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="text-[10px]">
            Receipt voucher automatically emailed to <strong>{booking.customerEmail || customer?.email || 'your email'}</strong>
          </span>
        </div>
        <span className="text-[9px] font-bold text-emerald-700 dark:text-emerald-300 bg-white dark:bg-slate-900 px-2 py-0.5 rounded-full border border-emerald-500/30">
          ✓ Emailed
        </span>
      </div>

      {/* Core Info 3-Column Strip: Customer, Vehicle, Rental Duration */}
      <div className="p-3.5 grid grid-cols-1 sm:grid-cols-3 gap-2.5 border-b border-slate-200 dark:border-slate-800 text-[11px]">
        {/* Col 1: Customer Details */}
        <div className="space-y-0.5">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
            Customer Info
          </span>
          <p className="font-bold text-slate-900 dark:text-white">
            {booking.customerName || customer?.fullName || 'Customer'}
          </p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Phone className="w-2.5 h-2.5 text-slate-400" />
            {booking.customerPhone || customer?.phone || 'N/A'}
          </p>
          {(booking.customerEmail || customer?.email) && (
            <p className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1 truncate">
              <Mail className="w-2.5 h-2.5 text-slate-400 shrink-0" />
              <span className="truncate">{booking.customerEmail || customer?.email}</span>
            </p>
          )}
        </div>

        {/* Col 2: Vehicle Reserved */}
        <div className="space-y-0.5">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
            Vehicle Assigned
          </span>
          <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
            <span>
              {vehicle.brand} {vehicle.model}
            </span>
            <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              {vehicle.plateNumber}
            </span>
          </p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">
            Color: {vehicle.color || 'Standard'} &bull; Type: {vehicle.vehicleType}
          </p>
          <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">
            Daily Rate: NPR {(summary.dailyRate || vehicle.dailyRate || 2500).toLocaleString()}
          </p>
        </div>

        {/* Col 3: Schedule & Duration */}
        <div className="space-y-0.5">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
            Schedule ({summary.durationDays} Days)
          </span>
          <div className="text-[10px] space-y-0.5">
            <p className="text-slate-700 dark:text-slate-300">
              <strong className="text-slate-900 dark:text-white">Pickup:</strong> {startDateFormatted}
            </p>
            <p className="text-slate-700 dark:text-slate-300">
              <strong className="text-slate-900 dark:text-white">Return:</strong> {endDateFormatted}
            </p>
            <p className="text-[9px] text-slate-400">
              Hub: {booking.pickupLocation || 'Main Hub'}
            </p>
          </div>
        </div>
      </div>

      {/* Line Items & Financial Breakdown Table */}
      <div className="p-3.5 border-b border-slate-200 dark:border-slate-800">
        <table className="w-full text-[11px] text-left">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700 text-[9px] font-bold uppercase tracking-wider text-slate-400">
              <th className="pb-1.5">Description</th>
              <th className="pb-1.5 text-center">Duration</th>
              <th className="pb-1.5 text-right">Rate</th>
              <th className="pb-1.5 text-right">Amount (NPR)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            <tr>
              <td className="py-1.5">
                <span className="font-bold text-slate-900 dark:text-white block">
                  {vehicle.brand} {vehicle.model} - Vehicle Rental
                </span>
                <span className="text-[9px] text-slate-400">
                  Self-drive fleet booking ({vehicle.plateNumber})
                </span>
              </td>
              <td className="py-1.5 text-center font-medium text-slate-700 dark:text-slate-300">
                {summary.durationDays} {summary.durationDays === 1 ? 'day' : 'days'}
              </td>
              <td className="py-1.5 text-right font-medium text-slate-700 dark:text-slate-300">
                NPR {(summary.dailyRate || vehicle.dailyRate || 2500).toLocaleString()}
              </td>
              <td className="py-1.5 text-right font-bold text-slate-900 dark:text-white">
                NPR {summary.totalAmount.toLocaleString()}
              </td>
            </tr>
            <tr>
              <td className="py-1">
                <span className="font-semibold text-slate-700 dark:text-slate-300 block">
                  Refundable Security Deposit
                </span>
                <span className="text-[9px] text-slate-400">
                  Refunded upon vehicle return inspection (Standard NPR 2,000)
                </span>
              </td>
              <td className="py-1 text-center text-slate-400">—</td>
              <td className="py-1 text-right text-slate-400">—</td>
              <td className="py-1 text-right font-semibold text-slate-700 dark:text-slate-300">
                NPR 2,000
              </td>
            </tr>
          </tbody>
        </table>

        {/* Totals Summary */}
        <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-end">
          <div className="w-full sm:w-72 space-y-1 text-[11px]">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Gross Rental Bill:</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                NPR {(summary.totalAmount + 2000).toLocaleString()}
              </span>
            </div>

            {summary.paidAmount !== undefined && summary.paidAmount > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded">
                <span>Payment Received ({summary.paymentMethod || 'Online'}):</span>
                <span>- NPR {summary.paidAmount.toLocaleString()}</span>
              </div>
            )}

            <div className="pt-1.5 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs font-extrabold">
              <span className="text-slate-900 dark:text-white">
                Net Due at Pickup:
              </span>
              <span
                className={`text-sm font-black ${
                  summary.dueAmount === 0
                    ? 'text-emerald-600'
                    : 'text-indigo-600 dark:text-indigo-400'
                }`}
              >
                NPR {(summary.dueAmount ?? summary.totalAmount).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Verification Documents & Host Contact Strip */}
      <div className="px-3.5 py-2.5 bg-slate-50/60 dark:bg-slate-900/30 border-b border-slate-200 dark:border-slate-800 text-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Verification &amp; Payment Documents
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {/* 1. Citizenship */}
              {booking.citizenshipUrl || booking.documentUrl ? (
                <a
                  href={booking.citizenshipUrl || booking.documentUrl || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 hover:underline"
                >
                  <span>✓ Citizenship</span>
                </a>
              ) : (
                <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-slate-100 text-slate-400 border border-slate-200">
                  — Citizenship
                </span>
              )}

              {/* 2. Bank Cheque */}
              {booking.bankChequeUrl ? (
                <a
                  href={booking.bankChequeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 hover:underline"
                >
                  <span>✓ Cheque</span>
                </a>
              ) : (
                <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-slate-100 text-slate-400 border border-slate-200">
                  — Bank Cheque
                </span>
              )}

              {/* 3. Driving License */}
              {booking.drivingLicenseUrl ? (
                <a
                  href={booking.drivingLicenseUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 hover:underline"
                >
                  <span>✓ License</span>
                </a>
              ) : (
                <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-slate-100 text-slate-400 border border-slate-200">
                  — License
                </span>
              )}

              {/* 4. Payment Receipt / Slip */}
              {booking.paymentReceiptUrl ? (
                <a
                  href={booking.paymentReceiptUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 hover:underline"
                >
                  <span>✓ Slip Attached</span>
                </a>
              ) : onUploadSlip ? (
                <label className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 cursor-pointer">
                  <Upload className="w-2.5 h-2.5" />
                  <span>{uploadingSlip ? 'Uploading...' : '+ Upload Slip'}</span>
                  <input
                    type="file"
                    accept="image/*,.avif,.webp,.png,.jpg,.jpeg"
                    onChange={onUploadSlip}
                    disabled={uploadingSlip}
                    className="hidden"
                  />
                </label>
              ) : null}
            </div>
          </div>

          <div className="text-left sm:text-right text-[10px] text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-slate-700 dark:text-slate-300 block">
              Host Contact & Depot:
            </span>
            <span>{tenant.phone || tenant.email || 'Contact station counter'}</span>
          </div>
        </div>
      </div>

      {/* Terms & Dual Physical Signature Lines (Perfect for Print!) */}
      <div className="px-4 py-3 space-y-3">
        <p className="text-[9px] text-slate-400 leading-tight italic">
          * Terms &amp; Conditions: Present your original driving license and citizenship upon vehicle pickup. Vehicle must be returned in the agreed condition with corresponding fuel level. Speed limits and traffic laws of Nepal must be strictly observed.
        </p>

        <div className="pt-3 pb-1 grid grid-cols-2 gap-6 text-[10px] text-slate-600 dark:text-slate-400">
          <div className="border-t border-dashed border-slate-400 dark:border-slate-700 pt-1 text-center font-medium">
            <span>Customer Signature</span>
          </div>
          <div className="border-t border-dashed border-slate-400 dark:border-slate-700 pt-1 text-center font-medium">
            <span>Authorized Host / Station Stamp</span>
          </div>
        </div>
      </div>
    </div>
  );
};
