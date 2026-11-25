'use client';

import React from 'react';
import { RentalBooking, Tenant } from '@/types';
import { X, Printer, FileText, ShieldCheck } from 'lucide-react';

interface RentalAgreementModalProps {
  booking: RentalBooking | null;
  tenant: Tenant | null;
  onClose: () => void;
}

export const RentalAgreementModal: React.FC<RentalAgreementModalProps> = ({
  booking,
  tenant,
  onClose,
}) => {
  if (!booking) return null;

  const customerName = booking.customerName || booking.customer?.fullName || 'Customer';
  const customerPhone = booking.customerPhone || booking.customer?.phone || 'N/A';
  const customerEmail = booking.customerEmail || booking.customer?.email || 'N/A';

  const startFormatted = new Date(booking.startDate).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
  const endFormatted = new Date(booking.endDate).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const durationDays = Math.max(
    1,
    Math.ceil(
      (new Date(booking.endDate).getTime() - new Date(booking.startDate).getTime()) /
        (1000 * 60 * 60 * 24),
    ),
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs overflow-y-auto">
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          .agreement-print-area,
          .agreement-print-area * {
            visibility: visible !important;
          }
          .agreement-print-area {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 12mm !important;
            background: #ffffff !important;
            color: #000000 !important;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print-btn {
            display: none !important;
          }
        }
      `}</style>

      <div className="bg-white dark:bg-[#111827] rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto">
        {/* Modal Action Header */}
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/60 shrink-0 no-print-btn">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Vehicle Rental Agreement (#AGR-{booking.id.slice(0, 8).toUpperCase()})
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Contract Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs text-slate-800 dark:text-slate-200 agreement-print-area">
          {/* Agency & Contract Header */}
          <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">
                {tenant?.name || 'AutoRent Agency'}
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {tenant?.address || 'Kathmandu, Nepal'} • {tenant?.phone || ''} •{' '}
                {tenant?.email || ''}
              </p>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                <ShieldCheck className="w-3 h-3" />
                Rental Contract
              </span>
              <div className="font-mono text-[11px] font-bold mt-1">
                #AGR-{booking.id.slice(0, 8).toUpperCase()}
              </div>
            </div>
          </div>

          {/* Parties & Vehicle Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Hirer / Customer Details
              </div>
              <div className="font-bold text-slate-900 dark:text-white">{customerName}</div>
              <div>Phone: {customerPhone}</div>
              <div>Email: {customerEmail}</div>
              <div className="pt-1 text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">
                Docs: {booking.citizenshipUrl ? '✓ Citizenship ' : ''}
                {booking.drivingLicenseUrl ? '✓ License ' : ''}
                {booking.bankChequeUrl ? '✓ Security Cheque' : ''}
              </div>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Vehicle & Schedule
              </div>
              <div className="font-bold text-slate-900 dark:text-white">
                {booking.vehicle?.brand} {booking.vehicle?.model} ({booking.vehicle?.plateNumber})
              </div>
              <div>Pickup: {startFormatted}</div>
              <div>Return: {endFormatted}</div>
              <div>
                Duration: <strong>{durationDays} Day(s)</strong> • Pickup KM:{' '}
                <strong>{booking.pickupOdometerKm ?? '—'}</strong> • Fuel:{' '}
                <strong>{booking.pickupFuelLevel || '—'}</strong>
              </div>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2 bg-indigo-50/30 dark:bg-indigo-950/20">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Agreed Rental Total
              </span>
              <span className="text-sm font-black text-slate-900 dark:text-white">
                NPR {Number(booking.totalAmount || 0).toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Advance / Deposit
              </span>
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                NPR {Number(booking.depositAmount || 0).toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Damage / Extra Fee
              </span>
              <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
                NPR {Number(booking.returnDamageFee || 0).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Standard Terms & Conditions */}
          <div className="space-y-1.5 text-[11px] leading-relaxed text-slate-600 dark:text-slate-300 border-t border-slate-200 dark:border-slate-700 pt-3">
            <h4 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
              Terms & Conditions
            </h4>
            <ol className="list-decimal pl-4 space-y-1">
              <li>
                The Hirer confirms holding a valid driving license and agrees not to sub-rent,
                transfer, or use the vehicle for illegal or commercial racing purposes.
              </li>
              <li>
                The vehicle must be returned on or before the agreed return date/time in the same
                mechanical and physical condition, with matching fuel level.
              </li>
              <li>
                All traffic fines, speeding tickets, parking penalties, or third-party damages
                incurred during the rental period are the sole responsibility of the Hirer.
              </li>
              <li>
                Security deposit and guarantee bank cheque will be released after final return
                inspection and settlement of any remaining rental or damage charges.
              </li>
            </ol>
          </div>

          {/* Signature Lines */}
          <div className="grid grid-cols-2 gap-8 pt-8">
            <div className="border-t border-slate-400 pt-1.5 text-center">
              <div className="font-bold text-slate-900 dark:text-white">{customerName}</div>
              <div className="text-[10px] text-slate-500">Hirer / Customer Signature & Date</div>
            </div>
            <div className="border-t border-slate-400 pt-1.5 text-center">
              <div className="font-bold text-slate-900 dark:text-white">
                {tenant?.name || 'Authorized Signatory'}
              </div>
              <div className="text-[10px] text-slate-500">Agency Representative Signature</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
