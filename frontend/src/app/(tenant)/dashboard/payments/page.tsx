'use client';

import React, { useState, useEffect } from 'react';
import { useTenant } from '@/context/TenantContext';
import { paymentService } from '@/services/payment.service';
import { PaymentStatementTable } from '@/components/tenant/payments/PaymentStatementTable';
import { UdharoLedgerTable } from '@/components/tenant/payments/UdharoLedgerTable';
import { RecordPaymentModal } from '@/components/tenant/payments/RecordPaymentModal';
import { TenantPayment, PaymentStats, UdharoCustomer, RecordPaymentInput } from '@/types';
import {
  Banknote,
  Smartphone,
  AlertCircle,
  Receipt,
  Plus,
  ArrowUpRight,
  CheckCircle2,
  Wallet,
  TrendingUp,
  RefreshCw,
} from 'lucide-react';

export default function TenantPaymentsPage() {
  const { tenantId } = useTenant();
  const [activeTab, setActiveTab] = useState<'STATEMENTS' | 'UDHARO'>('STATEMENTS');
  const [payments, setPayments] = useState<TenantPayment[]>([]);
  const [udharoLedger, setUdharoLedger] = useState<UdharoCustomer[]>([]);
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<UdharoCustomer | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadData = async (isSilent = false) => {
    if (!tenantId) return;
    try {
      if (!isSilent) setLoading(true);
      else setRefreshing(true);

      const [paymentsData, statsData, udharoData] = await Promise.all([
        paymentService.getTenantPayments(tenantId),
        paymentService.getTenantPaymentStats(tenantId),
        paymentService.getTenantUdharoLedger(tenantId),
      ]);

      setPayments(paymentsData || []);
      setStats(statsData || null);
      setUdharoLedger(udharoData || []);
    } catch (err: any) {
      console.error('Failed to load payments data:', err);
      setFeedback({
        type: 'error',
        message: err?.message || 'Failed to load payments & udharo records.',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [tenantId]);

  const handleOpenRecordModal = (record?: UdharoCustomer) => {
    setSelectedRecord(record || null);
    setIsModalOpen(true);
  };

  const handleRecordPayment = async (input: RecordPaymentInput) => {
    if (!tenantId) return;
    await paymentService.recordTenantPayment(tenantId, input);
    setFeedback({
      type: 'success',
      message: `Payment of NPR ${input.amount.toLocaleString()} recorded successfully via ${input.paymentMethod}.`,
    });
    await loadData(true);
  };

  const pendingUdharoCount = udharoLedger.filter((r) => r.dueAmount > 0).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight font-['Outfit']">
            Payments & Credit Ledger
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Complete statements for Cash and Online transactions, customer dues, and credit collections.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shrink-0 shadow-2xs"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-indigo-600' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => handleOpenRecordModal()}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-sm shadow-indigo-600/20 hover:shadow-indigo-600/30 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Record Payment</span>
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between text-xs shadow-2xs ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-800 dark:text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/20 text-rose-800 dark:text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            )}
            <span className="font-medium">{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white text-xs p-1 rounded hover:bg-slate-200/50 dark:hover:bg-slate-800"
          >
            ✕
          </button>
        </div>
      )}

      {/* 4 Financial KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Billed */}
        <div
          className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-xs flex flex-col justify-between"
          style={{ backgroundColor: 'var(--bg-card, #ffffff)' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Invoiced</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl font-black text-slate-900 dark:text-white font-['Outfit']">
              NPR {stats?.totalBilled?.toLocaleString() ?? 0}
            </div>
            <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
              Across {stats?.activeBookingsCount ?? 0} bookings
            </div>
          </div>
        </div>

        {/* Card 2: Cash Collected */}
        <div
          className="p-5 rounded-2xl border border-emerald-200/80 dark:border-emerald-500/20 bg-emerald-50/30 dark:bg-emerald-500/5 shadow-xs flex flex-col justify-between"
          style={{ backgroundColor: 'var(--bg-card, #ffffff)' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-400">Cash Received</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
              <Banknote className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl font-black text-emerald-700 dark:text-emerald-400 font-['Outfit']">
              NPR {stats?.totalCashCollected?.toLocaleString() ?? 0}
            </div>
            <div className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 mt-0.5">
              Direct counter receipts
            </div>
          </div>
        </div>

        {/* Card 3: Online Collected */}
        <div
          className="p-5 rounded-2xl border border-indigo-200/80 dark:border-indigo-500/20 bg-indigo-50/30 dark:bg-indigo-500/5 shadow-xs flex flex-col justify-between"
          style={{ backgroundColor: 'var(--bg-card, #ffffff)' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-indigo-800 dark:text-indigo-400">Online Received</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 flex items-center justify-center">
              <Smartphone className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl font-black text-indigo-700 dark:text-indigo-400 font-['Outfit']">
              NPR {stats?.totalOnlineCollected?.toLocaleString() ?? 0}
            </div>
            <div className="text-[11px] text-indigo-600/80 dark:text-indigo-400/80 mt-0.5">
              eSewa, Khalti & Fonepay QR
            </div>
          </div>
        </div>

        {/* Card 4: Total Udharo Due */}
        <div
          className="p-5 rounded-2xl border border-rose-200/90 dark:border-rose-500/30 bg-rose-50/40 dark:bg-rose-500/10 shadow-xs flex flex-col justify-between"
          style={{ backgroundColor: 'var(--bg-card, #ffffff)' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-800 dark:text-rose-400">Total Credit Due</span>
            <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-500/25 text-rose-700 dark:text-rose-400 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl font-black text-rose-600 dark:text-rose-400 font-['Outfit']">
              NPR {stats?.totalUdharo?.toLocaleString() ?? 0}
            </div>
            <div className="text-[11px] text-rose-700/80 dark:text-rose-400/80 mt-0.5 font-medium">
              {pendingUdharoCount} customers with unpaid dues
            </div>
          </div>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="border-b border-slate-200 dark:border-slate-800 flex items-center gap-6">
        <button
          type="button"
          onClick={() => setActiveTab('STATEMENTS')}
          className={`pb-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'STATEMENTS'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Payment Statements</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono">
            {payments.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('UDHARO')}
          className={`pb-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'UDHARO'
              ? 'border-rose-600 text-rose-600 dark:text-rose-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <AlertCircle className="w-4 h-4" />
          <span>Credit Ledger (Receivables Due)</span>
          {pendingUdharoCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 font-mono font-bold animate-pulse">
              {pendingUdharoCount} Pending
            </span>
          )}
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'STATEMENTS' ? (
        <PaymentStatementTable payments={payments} loading={loading} />
      ) : (
        <UdharoLedgerTable
          records={udharoLedger}
          loading={loading}
          onCollectPayment={(rec) => handleOpenRecordModal(rec)}
        />
      )}

      {/* Record Payment Modal */}
      <RecordPaymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedRecord={selectedRecord}
        allRecords={udharoLedger}
        onSubmit={handleRecordPayment}
      />
    </div>
  );
}
