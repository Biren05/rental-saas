'use client';

import React from 'react';
import { CheckCircle2, Mail, Download } from 'lucide-react';

export interface BookingSuccessData {
  bookingId: string;
  customerName: string;
  vehicleName: string;
  email: string;
  phone: string;
  duration: number;
  totalAmount: number;
  paidAmount: number;
  paymentType: string;
}

interface BookingSuccessModalProps {
  data: BookingSuccessData;
  slug: string;
  onClose: () => void;
}

export const BookingSuccessModal: React.FC<BookingSuccessModalProps> = ({
  data,
  slug,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#111827] rounded-3xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-6 text-center space-y-4 animate-in zoom-in-95 duration-200">
        {/* Success Icon */}
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-sm shadow-emerald-500/20">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        {/* Header info */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-black tracking-widest uppercase text-emerald-600 dark:text-emerald-400">
            Reservation Confirmed
          </span>
          <h3 className="text-xl font-black text-slate-900 dark:text-white font-['Outfit']">
            Thank you, {data.customerName}!
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-xs mx-auto">
            Your reservation for <strong>{data.vehicleName}</strong> has been registered.
          </p>
        </div>

        {/* Direct Email Receipt Notification Banner */}
        <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/80 text-left flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
            <Mail className="w-4 h-4" />
          </div>
          <div className="text-xs space-y-1">
            <span className="font-bold text-slate-900 dark:text-white block">
              Receipt Dispatched to Your Email
            </span>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-normal">
              Your official booking receipt voucher has been directly sent to{' '}
              <strong className="text-indigo-600 dark:text-indigo-400">{data.email}</strong>.
            </p>
            <div className="p-1.5 rounded-lg bg-white/70 dark:bg-slate-900/60 border border-indigo-100 dark:border-indigo-900/50 text-[10.5px] font-medium text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Please visit your email and download or view your receipt.</span>
            </div>
          </div>
        </div>

        {/* Booking Details Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs text-left p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 font-mono">
          <div>
            <span className="text-[9px] text-slate-400 uppercase font-sans font-bold block">Booking Ref</span>
            <span className="font-bold text-indigo-600 dark:text-indigo-400">
              #BK-{data.bookingId.slice(0, 8).toUpperCase()}
            </span>
          </div>
          <div>
            <span className="text-[9px] text-slate-400 uppercase font-sans font-bold block">Duration</span>
            <span className="font-bold text-slate-900 dark:text-white">
              {data.duration} Day(s)
            </span>
          </div>
          <div>
            <span className="text-[9px] text-slate-400 uppercase font-sans font-bold block">Total Amount</span>
            <span className="font-bold text-slate-900 dark:text-white">
              NPR {data.totalAmount.toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-[9px] text-slate-400 uppercase font-sans font-bold block">Payment Status</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              {data.paymentType === 'FULL'
                ? `Paid (NPR ${data.paidAmount.toLocaleString()})`
                : data.paymentType === 'ADVANCE'
                ? `Advance (NPR ${data.paidAmount.toLocaleString()})`
                : 'Pay on Pickup'}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 space-y-2">
          <a
            href={`/rent/${slug}/confirmation/${data.bookingId}?download=1`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download Receipt (PDF)</span>
          </a>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 px-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
          >
            Done / Back to Fleet
          </button>
        </div>
      </div>
    </div>
  );
};
