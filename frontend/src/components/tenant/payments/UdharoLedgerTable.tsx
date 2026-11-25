'use client';

import React, { useState } from 'react';
import { Search, Phone, PlusCircle, AlertCircle, CheckCircle2, User, Car } from 'lucide-react';
import { UdharoCustomer } from '../../../types';

interface UdharoLedgerTableProps {
  records: UdharoCustomer[];
  loading: boolean;
  onCollectPayment: (record: UdharoCustomer) => void;
}

export const UdharoLedgerTable: React.FC<UdharoLedgerTableProps> = ({
  records,
  loading,
  onCollectPayment,
}) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'PENDING_ONLY' | 'CLEARED'>('PENDING_ONLY');

  const filtered = records.filter((r) => {
    const matchesSearch =
      (r.customer?.fullName || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.customer?.phone || '').includes(search) ||
      (r.customer?.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.vehicle?.brand || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.vehicle?.model || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.vehicle?.plateNumber || '').toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (filter === 'PENDING_ONLY') return r.dueAmount > 0;
    if (filter === 'CLEARED') return r.dueAmount === 0;
    return true;
  });

  const totalOutstanding = records.reduce((sum, r) => sum + r.dueAmount, 0);
  const pendingCount = records.filter((r) => r.dueAmount > 0).length;

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
            placeholder="Search by customer name, phone, plate..."
          />
        </div>

        {/* Filter Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setFilter('PENDING_ONLY')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              filter === 'PENDING_ONLY'
                ? 'bg-rose-600 text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <AlertCircle className="w-3 h-3" />
            <span>Pending Receivables ({pendingCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filter === 'ALL'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All Accounts ({records.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('CLEARED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              filter === 'CLEARED'
                ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-3 h-3" />
            <span>Cleared</span>
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
                <th className="py-3.5 px-5">Customer</th>
                <th className="py-3.5 px-5">Vehicle</th>
                <th className="py-3.5 px-5">Total Bill</th>
                <th className="py-3.5 px-5">Paid</th>
                <th className="py-3.5 px-5">Remaining Due</th>
                <th className="py-3.5 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-14 text-center text-slate-400 dark:text-slate-500">
                    <div className="inline-block w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-2" />
                    <p className="text-xs">Loading customer credit ledger...</p>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-14 text-center text-slate-400 dark:text-slate-500">
                    <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {filter === 'PENDING_ONLY' ? 'No outstanding customer dues!' : 'No customer records found'}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {filter === 'PENDING_ONLY'
                        ? 'All customers have cleared their rental balances.'
                        : 'New bookings with balances will appear here.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((r) => {
                  const isDue = r.dueAmount > 0;
                  return (
                    <tr key={r.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors">
                      {/* Customer */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 font-semibold text-xs shrink-0">
                            {r.customer?.fullName?.charAt(0) || 'C'}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-white">
                              {r.customer?.fullName || 'Customer'}
                            </div>
                            {r.customer?.phone ? (
                              <a
                                href={`tel:${r.customer.phone}`}
                                className="inline-flex items-center gap-1 text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-mono"
                              >
                                <Phone className="w-3 h-3" />
                                <span>{r.customer.phone}</span>
                              </a>
                            ) : (
                              <div className="text-[11px] text-slate-400">{r.customer?.email}</div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Vehicle */}
                      <td className="py-3.5 px-5">
                        {r.vehicle ? (
                          <div>
                            <div className="font-medium text-slate-800 dark:text-slate-200">
                              {r.vehicle.brand} {r.vehicle.model}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                              {r.vehicle.plateNumber}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px] italic">Rental Booking</span>
                        )}
                      </td>

                      {/* Total Amount */}
                      <td className="py-3.5 px-5 whitespace-nowrap font-medium text-slate-800 dark:text-slate-200">
                        NPR {r.totalAmount.toLocaleString()}
                      </td>

                      {/* Paid So Far */}
                      <td className="py-3.5 px-5 whitespace-nowrap">
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                          NPR {r.paidAmount.toLocaleString()}
                        </span>
                        {r.payments && r.payments.length > 0 && (
                          <div className="text-[10px] text-slate-400">
                            {r.payments.length} payment{r.payments.length > 1 ? 's' : ''}
                          </div>
                        )}
                      </td>

                      {/* Due / Udharo Balance */}
                      <td className="py-3.5 px-5 whitespace-nowrap">
                        {isDue ? (
                          <div className="inline-flex flex-col">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-50 dark:bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                              NPR {r.dueAmount.toLocaleString()} Due
                            </span>
                            <span className="text-[10px] text-rose-600/80 dark:text-rose-400/80 mt-0.5 font-medium pl-1">
                              {r.paymentStatus === 'PARTIAL' ? 'Partially Paid' : 'Unpaid'}
                            </span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Cleared</span>
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-5 text-right whitespace-nowrap">
                        {isDue ? (
                          <button
                            type="button"
                            onClick={() => onCollectPayment(r)}
                            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 ml-auto shadow-sm shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all active:scale-95"
                          >
                            <PlusCircle className="w-3.5 h-3.5" />
                            <span>Collect Payment</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onCollectPayment(r)}
                            className="px-3 py-1 rounded-lg text-[11px] font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ml-auto"
                          >
                            + Extra Receipt
                          </button>
                        )}
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
