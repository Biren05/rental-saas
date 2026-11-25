'use client';

import React, { useEffect, useState } from 'react';
import { adminService } from '../../../../services';
import { CreditCard, AlertCircle, RefreshCw } from 'lucide-react';
import { SearchInput } from '../../../../components/ui/SearchInput';
import { BillingSummary } from '../../../../components/superadmin/billing/BillingSummary';
import { BillingTable, PlatformPayment } from '../../../../components/superadmin/billing/BillingTable';

export default function AdminBillingPage() {
  const [payments, setPayments] = useState<PlatformPayment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const data = await adminService.getAllBilling();
      setPayments(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load billing records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const totalSuccessRevenue = payments
    .filter((p) => p.status === 'SUCCESS')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalPendingVolume = payments
    .filter((p) => p.status === 'PENDING')
    .reduce((sum, p) => sum + p.amount, 0);

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.id.toLowerCase().includes(search.toLowerCase()) ||
      (payment.transactionId && payment.transactionId.toLowerCase().includes(search.toLowerCase())) ||
      payment.user.fullName.toLowerCase().includes(search.toLowerCase()) ||
      payment.user.email.toLowerCase().includes(search.toLowerCase()) ||
      (payment.tenant && payment.tenant.name.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || payment.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-['Outfit']">
            Billing & <span className="text-indigo-600">Invoices</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Platform-wide transaction history across eSewa, Khalti, Fonepay, and cash payments.
          </p>
        </div>

        <button
          onClick={fetchPayments}
          className="btn-secondary text-xs px-3.5 py-2 self-start sm:self-auto"
          title="Refresh Billing"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-xs text-rose-700">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Financial Summary Component */}
      <BillingSummary
        totalSuccessRevenue={totalSuccessRevenue}
        totalPendingVolume={totalPendingVolume}
        totalTransactions={payments.length}
      />

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by ID, customer name, or rental company..."
          className="flex-1 max-w-md"
        />

        <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-xs">
          {['ALL', 'SUCCESS', 'PENDING', 'FAILED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                statusFilter === st
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-100 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions Table Component */}
      {loading ? (
        <div className="text-center py-16 text-sm text-slate-500">Loading platform transactions...</div>
      ) : filteredPayments.length === 0 ? (
        <div className="glass-panel p-12 text-center bg-white border border-slate-200">
          <CreditCard className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-900">No Billing Records Found</h3>
          <p className="text-xs text-slate-500 mt-1">
            {search ? 'Try adjusting your search criteria.' : 'No transactions recorded yet.'}
          </p>
        </div>
      ) : (
        <BillingTable payments={filteredPayments} />
      )}
    </div>
  );
}
