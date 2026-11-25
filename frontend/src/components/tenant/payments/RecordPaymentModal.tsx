'use client';

import React, { useState, useEffect } from 'react';
import { X, Receipt, Banknote, Smartphone, AlertCircle, CheckCircle2 } from 'lucide-react';
import { UdharoCustomer, PaymentMethod, RecordPaymentInput } from '../../../types';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRecord: UdharoCustomer | null;
  allRecords: UdharoCustomer[];
  onSubmit: (data: RecordPaymentInput) => Promise<void>;
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  isOpen,
  onClose,
  selectedRecord,
  allRecords,
  onSubmit,
}) => {
  const [bookingId, setBookingId] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [transactionId, setTransactionId] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedRecord) {
      setBookingId(selectedRecord.bookingId);
      setAmount(selectedRecord.dueAmount > 0 ? selectedRecord.dueAmount : selectedRecord.totalAmount);
    } else if (allRecords.length > 0) {
      const firstWithDue = allRecords.find((r) => r.dueAmount > 0) || allRecords[0];
      setBookingId(firstWithDue.bookingId);
      setAmount(firstWithDue.dueAmount > 0 ? firstWithDue.dueAmount : firstWithDue.totalAmount);
    }
  }, [selectedRecord, allRecords, isOpen]);

  if (!isOpen) return null;

  const currentRecord = allRecords.find((r) => r.bookingId === bookingId) || selectedRecord;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!bookingId) {
      setError('Please select a booking to record payment for.');
      return;
    }

    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      setError('Please enter a valid positive payment amount.');
      return;
    }

    try {
      setLoading(true);
      await onSubmit({
        bookingId,
        amount: numAmount,
        paymentMethod,
        transactionId: transactionId.trim() || undefined,
        note: note.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to record payment transaction.');
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
        className="relative w-full max-w-lg bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-900 dark:text-slate-100 z-10 my-auto"
        style={{ backgroundColor: 'var(--bg-card, #ffffff)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/15 border border-indigo-100 dark:border-indigo-500/25 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 shadow-2xs">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white font-['Outfit']">
                Record Payment
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Collect rental fee, settle customer udharo, or record advance
              </p>
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
          <div className="mx-5 mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-2.5 text-xs text-rose-700 dark:text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Select Customer / Booking */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Customer & Rental Booking <span className="text-rose-500">*</span>
            </label>
            <select
              value={bookingId}
              onChange={(e) => {
                const bId = e.target.value;
                setBookingId(bId);
                const rec = allRecords.find((r) => r.bookingId === bId);
                if (rec) {
                  setAmount(rec.dueAmount > 0 ? rec.dueAmount : rec.totalAmount);
                }
              }}
              className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-2xs"
            >
              {allRecords.map((r) => (
                <option key={r.bookingId} value={r.bookingId}>
                  {r.customer?.fullName || 'Customer'} — {r.vehicle?.brand} {r.vehicle?.model} ({r.vehicle?.plateNumber}) — [Due: NPR {r.dueAmount.toLocaleString()}]
                </option>
              ))}
            </select>
          </div>

          {/* Account Summary Pill */}
          {currentRecord && (
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 grid grid-cols-3 gap-2 text-center text-xs">
              <div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase font-medium">
                  Total Bill
                </span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  NPR {currentRecord.totalAmount.toLocaleString()}
                </span>
              </div>
              <div className="border-x border-slate-200 dark:border-slate-700 px-2">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase font-medium">
                  Paid
                </span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  NPR {currentRecord.paidAmount.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase font-medium">
                  Balance Due
                </span>
                <span className="font-bold text-rose-600 dark:text-rose-400">
                  NPR {currentRecord.dueAmount.toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Payment Method <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('CASH')}
                className={`p-2.5 rounded-xl border text-xs font-medium flex flex-col items-center gap-1 transition-all ${
                  paymentMethod === 'CASH'
                    ? 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Banknote className="w-4 h-4 text-emerald-600" />
                <span>Cash</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('ESEWA')}
                className={`p-2.5 rounded-xl border text-xs font-medium flex flex-col items-center gap-1 transition-all ${
                  paymentMethod === 'ESEWA'
                    ? 'border-green-500 bg-green-50/80 dark:bg-green-500/15 text-green-700 dark:text-green-300 ring-2 ring-green-500/20 shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Smartphone className="w-4 h-4 text-green-600" />
                <span>eSewa</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('KHALTI')}
                className={`p-2.5 rounded-xl border text-xs font-medium flex flex-col items-center gap-1 transition-all ${
                  paymentMethod === 'KHALTI'
                    ? 'border-purple-500 bg-purple-50/80 dark:bg-purple-500/15 text-purple-700 dark:text-purple-300 ring-2 ring-purple-500/20 shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Smartphone className="w-4 h-4 text-purple-600" />
                <span>Khalti</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('FONEPAY')}
                className={`p-2.5 rounded-xl border text-xs font-medium flex flex-col items-center gap-1 transition-all ${
                  paymentMethod === 'FONEPAY'
                    ? 'border-rose-500 bg-rose-50/80 dark:bg-rose-500/15 text-rose-700 dark:text-rose-300 ring-2 ring-rose-500/20 shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Smartphone className="w-4 h-4 text-rose-600" />
                <span>Fonepay / QR</span>
              </button>
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Amount to Collect (NPR) <span className="text-rose-500">*</span>
              </label>
              {currentRecord && currentRecord.dueAmount > 0 && (
                <button
                  type="button"
                  onClick={() => setAmount(currentRecord.dueAmount)}
                  className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                >
                  Full Due (NPR {currentRecord.dueAmount.toLocaleString()})
                </button>
              )}
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                NPR
              </span>
              <input
                type="number"
                required
                min={1}
                step={1}
                value={amount}
                onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-sm font-bold text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-2xs"
                placeholder="2500"
              />
            </div>
          </div>

          {/* Transaction / Reference ID */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Receipt / Transaction Reference (optional)
            </label>
            <input
              type="text"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              placeholder="e.g. REC-8492 or eSewa TXN ID"
              className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-2xs font-mono"
            />
          </div>

          {/* Internal Memo / Note */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Remarks / Memo
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Vehicle return final settlement"
              className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-2xs"
            />
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
              className="px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md shadow-indigo-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Recording Payment...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm Payment</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
