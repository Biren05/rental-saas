'use client';

import React, { useState } from 'react';
import { Search, Banknote, Smartphone, Receipt, Calendar, ArrowDownRight, ExternalLink } from 'lucide-react';
import { TenantPayment } from '../../../types';

interface PaymentStatementTableProps {
  payments: TenantPayment[];
  loading: boolean;
}

export const PaymentStatementTable: React.FC<PaymentStatementTableProps> = ({
  payments,
  loading,
}) => {
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState<'ALL' | 'CASH' | 'ONLINE'>('ALL');

  const filtered = payments.filter((p) => {
    const matchesSearch =
      (p.booking?.customerName || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.user?.fullName || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.booking?.customerPhone || '').includes(search) ||
      (p.user?.phone || '').includes(search) ||
      (p.transactionId || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.booking?.vehicle?.brand || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.booking?.vehicle?.model || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.booking?.vehicle?.plateNumber || '').toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (methodFilter === 'CASH') return p.paymentMethod === 'CASH';
    if (methodFilter === 'ONLINE') return p.paymentMethod !== 'CASH';
    return true;
  });

  const getMethodBadge = (method: string) => {
    switch (method) {
      case 'CASH':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">
            <Banknote className="w-3.5 h-3.5" />
            <span>Cash</span>
          </span>
        );
      case 'ESEWA':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-green-50 dark:bg-green-500/15 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/30">
            <Smartphone className="w-3.5 h-3.5" />
            <span>eSewa</span>
          </span>
        );
      case 'KHALTI':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 dark:bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30">
            <Smartphone className="w-3.5 h-3.5" />
            <span>Khalti</span>
          </span>
        );
      case 'FONEPAY':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 dark:bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30">
            <Smartphone className="w-3.5 h-3.5" />
            <span>Fonepay / QR</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            {method}
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-2xs transition-all"
            placeholder="Search statement by customer, txn, plate..."
          />
        </div>

        {/* Method Switcher Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setMethodFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              methodFilter === 'ALL'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All Methods ({payments.length})
          </button>
          <button
            type="button"
            onClick={() => setMethodFilter('CASH')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              methodFilter === 'CASH'
                ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Banknote className="w-3 h-3" />
            <span>Cash</span>
          </button>
          <button
            type="button"
            onClick={() => setMethodFilter('ONLINE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              methodFilter === 'ONLINE'
                ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Smartphone className="w-3 h-3" />
            <span>Online</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div
        className="border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-[#111827] overflow-hidden shadow-xs"
        style={{ backgroundColor: 'var(--bg-card, #ffffff)' }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50/80 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 text-[11px] font-semibold border-b border-slate-200/90 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-5">Date & Time</th>
                <th className="py-3.5 px-5">Customer</th>
                <th className="py-3.5 px-5">Vehicle Rented</th>
                <th className="py-3.5 px-5">Method</th>
                <th className="py-3.5 px-5">Transaction / Note</th>
                <th className="py-3.5 px-5 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-14 text-center text-slate-400 dark:text-slate-500">
                    <div className="inline-block w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-2" />
                    <p className="text-xs">Loading payment transactions...</p>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-14 text-center text-slate-400 dark:text-slate-500">
                    <Receipt className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">No payment statements found</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Payments recorded via Cash or Online will appear in this ledger.
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const date = new Date(p.createdAt);
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors">
                      {/* Date & Time */}
                      <td className="py-3.5 px-5 whitespace-nowrap">
                        <div className="font-medium text-slate-900 dark:text-white">
                          {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                        <div className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                          {date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="py-3.5 px-5">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {p.booking?.customerName || p.user?.fullName || 'Customer'}
                        </div>
                        {(p.booking?.customerPhone || p.user?.phone) && (
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                            {p.booking?.customerPhone || p.user?.phone}
                          </div>
                        )}
                      </td>

                      {/* Vehicle */}
                      <td className="py-3.5 px-5">
                        {p.booking?.vehicle ? (
                          <div>
                            <div className="font-medium text-slate-800 dark:text-slate-200">
                              {p.booking.vehicle.brand} {p.booking.vehicle.model}
                            </div>
                            <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-mono">
                              {p.booking.vehicle.plateNumber}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px] italic">Rental Booking</span>
                        )}
                      </td>

                      {/* Method */}
                      <td className="py-3.5 px-5 whitespace-nowrap">
                        {getMethodBadge(p.paymentMethod)}
                      </td>

                      {/* Transaction / Note */}
                      <td className="py-3.5 px-5">
                        <div className="font-mono text-[11px] text-slate-600 dark:text-slate-400 truncate max-w-xs">
                          {p.transactionId || '—'}
                        </div>
                        {p.note && (
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 italic truncate max-w-xs">
                            {p.note}
                          </div>
                        )}
                        {(p.receiptUrl || p.booking?.paymentReceiptUrl) && (
                          <a
                            href={(p.receiptUrl || p.booking?.paymentReceiptUrl) as string}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline mt-1 bg-indigo-50 dark:bg-indigo-950/40 px-1.5 py-0.5 rounded border border-indigo-200 dark:border-indigo-800"
                            title="View Customer Payment Screenshot"
                          >
                            <ExternalLink className="w-2.5 h-2.5" />
                            <span>Payment Slip</span>
                          </a>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-5 text-right whitespace-nowrap">
                        <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-end gap-1">
                          <ArrowDownRight className="w-3.5 h-3.5 text-emerald-500" />
                          <span>NPR {p.amount.toLocaleString()}</span>
                        </div>
                        <div className="text-[10px] text-emerald-700/80 dark:text-emerald-400/80 font-medium">
                          PAID
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
