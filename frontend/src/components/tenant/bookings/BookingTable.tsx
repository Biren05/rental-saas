'use client';

import React, { useState } from 'react';
import { RentalBooking, BookingStatus } from '../../../types';
import { Search, FileText, ClipboardCheck } from 'lucide-react';

interface BookingTableProps {
  bookings: RentalBooking[];
  loading: boolean;
  onUpdateStatus: (bookingId: string, newStatus: BookingStatus) => Promise<void>;
  onOpenAgreement?: (booking: RentalBooking) => void;
  onOpenInspection?: (booking: RentalBooking) => void;
}

const statusBadges: Record<BookingStatus, { label: string; style: string }> = {
  PENDING: {
    label: 'Pending',
    style: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20',
  },
  CONFIRMED: {
    label: 'Confirmed',
    style: 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20',
  },
  ACTIVE: {
    label: 'Active',
    style: 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20',
  },
  COMPLETED: {
    label: 'Completed',
    style: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20',
  },
  CANCELLED: {
    label: 'Cancelled',
    style: 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20',
  },
};

export const BookingTable: React.FC<BookingTableProps> = ({
  bookings,
  loading,
  onUpdateStatus,
  onOpenAgreement,
  onOpenInspection,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filteredBookings = bookings.filter((b) => {
    const customerText = `${b.customerName || ''} ${b.customer?.fullName || ''} ${b.customerEmail || ''} ${b.customer?.email || ''} ${b.customerPhone || ''} ${b.customer?.phone || ''}`.toLowerCase();
    const vehicleText = `${b.vehicle?.brand || ''} ${b.vehicle?.model || ''} ${b.vehicle?.plateNumber || ''}`.toLowerCase();
    const matchesSearch =
      customerText.includes(search.toLowerCase()) || vehicleText.includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (id: string, status: BookingStatus) => {
    try {
      setUpdatingId(id);
      await onUpdateStatus(id, status);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500 shadow-xs"
            placeholder="Search customer, vehicle..."
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter by Status"
            className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-indigo-500 shadow-xs"
          >
            <option value="ALL">All Reservations</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="ACTIVE">Active Trip</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Clean Table Container */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-[#111827] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 text-[11px] font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Vehicle</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Update Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400 dark:text-slate-500">
                    Loading reservations...
                  </td>
                </tr>
              ) : filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400 dark:text-slate-500">
                    No reservations found.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => {
                  const badge = statusBadges[b.status] || {
                    label: b.status,
                    style: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700',
                  };
                  const isUpdating = updatingId === b.id;

                  return (
                    <tr key={b.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      {/* Customer */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {b.customerName || b.customer?.fullName || 'Guest Customer'}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          {(b.customerPhone || b.customer?.phone) ? `${b.customerPhone || b.customer?.phone} • ` : ''}
                          {b.customerEmail || b.customer?.email}
                        </div>
                        {b.pickupLocation && (
                          <div className="text-[10px] text-indigo-600 dark:text-indigo-400 mt-0.5 font-medium truncate max-w-xs">
                            📍 {b.pickupLocation}
                          </div>
                        )}
                        <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                          {(b.citizenshipUrl || b.documentUrl) && (
                            <a
                              href={b.citizenshipUrl || b.documentUrl || '#'}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 px-1.5 py-0.5 rounded border border-indigo-200 dark:border-indigo-800 transition-colors"
                              title="View Citizenship Card"
                            >
                              <span>📄 Citizenship</span>
                            </a>
                          )}
                          {b.bankChequeUrl && (
                            <a
                              href={b.bankChequeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 transition-colors"
                              title="View Guarantee Bank Cheque"
                            >
                              <span>🏦 Bank Cheque</span>
                            </a>
                          )}
                          {b.drivingLicenseUrl && (
                            <a
                              href={b.drivingLicenseUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[10px] font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/60 px-1.5 py-0.5 rounded border border-purple-200 dark:border-purple-800 transition-colors"
                              title="View Driving License"
                            >
                              <span>🚗 License</span>
                            </a>
                          )}
                          {b.paymentReceiptUrl && (
                            <a
                              href={b.paymentReceiptUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/60 px-1.5 py-0.5 rounded border border-amber-300 dark:border-amber-800 transition-colors shadow-2xs"
                              title="View Customer Payment Slip"
                            >
                              <span>🧾 Payment Slip</span>
                            </a>
                          )}
                        </div>
                      </td>

                      {/* Vehicle */}
                      <td className="py-3 px-4">
                        {b.vehicle ? (
                          <div>
                            <div className="font-medium text-slate-800 dark:text-slate-200">
                              {b.vehicle.brand} {b.vehicle.model}
                            </div>
                            <div className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                              {b.vehicle.plateNumber}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-500">Unassigned</span>
                        )}
                      </td>

                      {/* Dates */}
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                        {new Date(b.startDate).toLocaleDateString()} -{' '}
                        {new Date(b.endDate).toLocaleDateString()}
                      </td>

                      {/* Amount */}
                      <td className="py-3 px-4 font-mono text-emerald-600 dark:text-emerald-400 font-medium">
                        NPR {Number(b.totalAmount || 0).toLocaleString()}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <div className="flex flex-col items-start gap-1">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium border ${badge.style}`}
                          >
                            {badge.label}
                          </span>
                          {(b.status === 'ACTIVE' || b.status === 'CONFIRMED') &&
                            new Date(b.endDate).getTime() < Date.now() && (
                              <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 animate-pulse">
                                OVERDUE ({Math.max(1, Math.ceil((Date.now() - new Date(b.endDate).getTime()) / (1000 * 60 * 60)))}h)
                              </span>
                            )}
                        </div>
                      </td>

                      {/* Actions & Inline Status Dropdown */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {onOpenAgreement && (
                            <button
                              type="button"
                              onClick={() => onOpenAgreement(b)}
                              title="Print Rental Agreement PDF"
                              className="inline-flex items-center gap-1 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 hover:border-indigo-500 text-[11px] font-medium text-slate-700 dark:text-slate-200 cursor-pointer"
                            >
                              <FileText className="w-3 h-3 text-indigo-500" />
                              <span className="hidden xl:inline">Contract</span>
                            </button>
                          )}
                          {onOpenInspection && (
                            <button
                              type="button"
                              onClick={() => onOpenInspection(b)}
                              title="Pickup / Return Inspection Checklist"
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded border text-[11px] font-medium cursor-pointer ${
                                b.pickupInspectedAt || b.returnInspectedAt
                                  ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                                  : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 hover:border-indigo-500 text-slate-700 dark:text-slate-200'
                              }`}
                            >
                              <ClipboardCheck className="w-3 h-3" />
                              <span className="hidden xl:inline">Inspect</span>
                            </button>
                          )}
                          <select
                            disabled={isUpdating}
                            value={b.status}
                            onChange={(e) =>
                              handleStatusChange(b.id, e.target.value as BookingStatus)
                            }
                            aria-label={`Update status for booking ${b.id}`}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-2 py-1 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-indigo-500 disabled:opacity-50 shadow-xs"
                          >
                            <option value="PENDING">Pending</option>
                            <option value="CONFIRMED">Confirm</option>
                            <option value="ACTIVE">Mark Active</option>
                            <option value="COMPLETED">Complete</option>
                            <option value="CANCELLED">Cancel</option>
                          </select>
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
