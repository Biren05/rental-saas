'use client';

import React, { useEffect, useState } from 'react';
import { useTenant } from '@/context/TenantContext';
import { subscriptionService, tenantService } from '@/services';
import { SubscriptionPlan } from '@/types';
import { PaymentGatewayConfig } from '@/services/subscription.service';
import { Modal } from '@/components/ui/Modal';
import {
  CheckCircle2,
  Car,
  Users,
  CreditCard,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Check,
  QrCode,
  AlertCircle,
  Copy,
  Upload,
} from 'lucide-react';

export default function TenantSubscriptionPage() {
  const { tenant, refreshTenant } = useTenant();

  const subscription = tenant?.subscriptions?.[0];
  const plan = subscription?.plan;

  const vehicleCount = tenant?._count?.vehicles || 0;
  const maxVehicles = plan?.maxVehicles || 10;
  const vehiclePercent = Math.min(Math.round((vehicleCount / maxVehicles) * 100), 100);

  const staffCount = tenant?._count?.members || tenant?.members?.length || 1;
  const maxStaff = plan?.maxStaff || 5;
  const staffPercent = Math.min(Math.round((staffCount / maxStaff) * 100), 100);

  // Upgrade Modal State
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [paymentConfig, setPaymentConfig] = useState<PaymentGatewayConfig | null>(null);
  const [loadingPlans, setLoadingPlans] = useState<boolean>(true);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'ESEWA' | 'KHALTI' | 'FONEPAY' | 'CASH'>('ESEWA');
  const [transactionId, setTransactionId] = useState('');
  const [receiptUrl, setReceiptUrl] = useState('');
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    Promise.all([
      subscriptionService.getAllPlans(),
      subscriptionService.getPaymentConfig().catch(() => null),
    ])
      .then(([plansData, configData]) => {
        setPlans(plansData || []);
        if (configData) setPaymentConfig(configData);
      })
      .catch(() => {})
      .finally(() => setLoadingPlans(false));
  }, []);

  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingReceipt(true);
    try {
      const res = await tenantService.uploadApplicantDocument(file);
      setReceiptUrl(res.fileUrl);
    } catch {
      // Ignore
    } finally {
      setUploadingReceipt(false);
    }
  };

  const handleSubscribe = async () => {
    if (!tenant?.id || !selectedPlan) return;

    setSubmitting(true);
    setFeedback(null);

    try {
      await subscriptionService.subscribe(tenant.id, selectedPlan.id, paymentMethod);
      await refreshTenant();
      setFeedback({
        type: 'success',
        message: `Successfully upgraded to "${selectedPlan.name}" plan! Your fleet capacity and quotas have been updated.`,
      });
      setSelectedPlan(null);
      setReceiptUrl('');
      setTransactionId('');
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to update subscription plan. Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Resolve details based on selected payment gateway
  const getSelectedGatewayDetails = () => {
    if (paymentMethod === 'ESEWA') {
      return {
        name: 'eSewa Digital Wallet',
        id: paymentConfig?.esewa?.id || '9800000001',
        accountName: paymentConfig?.esewa?.accountName || 'AutoRent SaaS (eSewa)',
        qrUrl: paymentConfig?.esewa?.qrUrl || '',
        colorText: 'text-emerald-600',
        borderColor: 'border-emerald-500',
      };
    } else if (paymentMethod === 'KHALTI') {
      return {
        name: 'Khalti Digital Wallet',
        id: paymentConfig?.khalti?.id || '9800000001',
        accountName: paymentConfig?.khalti?.accountName || 'AutoRent SaaS (Khalti)',
        qrUrl: paymentConfig?.khalti?.qrUrl || '',
        colorText: 'text-purple-600',
        borderColor: 'border-purple-500',
      };
    } else if (paymentMethod === 'FONEPAY') {
      return {
        name: 'Fonepay Merchant QR',
        id: paymentConfig?.fonepay?.merchantCode || 'AUTORENT_SaaS',
        accountName: paymentConfig?.fonepay?.accountName || 'AutoRent SaaS (Fonepay)',
        qrUrl: paymentConfig?.fonepay?.qrUrl || '',
        colorText: 'text-rose-600',
        borderColor: 'border-rose-500',
      };
    } else {
      return {
        name: paymentConfig?.bank?.bankName || 'Nabil Bank Ltd.',
        id: paymentConfig?.bank?.accountNumber || '01201017500001',
        accountName: paymentConfig?.bank?.accountName || 'AutoRent Technologies Pvt. Ltd.',
        qrUrl: paymentConfig?.bank?.qrUrl || '',
        colorText: 'text-slate-700 dark:text-slate-200',
        borderColor: 'border-slate-500',
      };
    }
  };

  const activeGateway = getSelectedGatewayDetails();

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Subscription & Plan</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          View your active plan, current fleet capacity, authorized member seats, and upgrade options.
        </p>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center justify-between gap-3 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/20'
              : 'bg-rose-50 dark:bg-rose-500/10 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-500/20'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-[11px] underline font-semibold hover:opacity-80"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Plan Details Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{plan?.name || 'Starter Trial'}</h2>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
              {subscription?.status || 'ACTIVE'}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
            {plan?.description || 'Commercial vehicle rental operations platform.'}
          </p>
          {subscription?.endDate && (
            <div className="text-[11px] text-slate-400 mt-2 font-mono">
              Billing renewal: {new Date(subscription.endDate).toLocaleDateString('en-US', { dateStyle: 'medium' })}
            </div>
          )}
        </div>

        <div className="text-right sm:border-l sm:border-slate-200 dark:sm:border-slate-800 sm:pl-6 shrink-0">
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
            {plan?.price === 0 ? 'FREE' : `NPR ${plan?.price?.toLocaleString() || 0}`}
            <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">
              /{plan?.billingCycle?.toLowerCase() || 'mo'}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 dark:text-slate-500">Active SaaS License</span>
        </div>
      </div>

      {/* Quota Progress Meters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Vehicles Meter */}
        <div className="p-5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Car className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-xs font-semibold text-slate-900 dark:text-white">Vehicle Capacity</span>
            </div>
            <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-200">
              {vehicleCount} / {maxVehicles}
            </span>
          </div>

          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                vehiclePercent > 85 ? 'bg-rose-500' : vehiclePercent > 60 ? 'bg-amber-500' : 'bg-indigo-600'
              }`}
              style={{ width: `${vehiclePercent}%` }}
            />
          </div>

          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>
              {maxVehicles - vehicleCount > 0
                ? `${maxVehicles - vehicleCount} vehicle slots available`
                : 'Fleet limit reached'}
            </span>
            <span>{vehiclePercent}% Used</span>
          </div>
        </div>

        {/* Staff Meter */}
        <div className="p-5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="text-xs font-semibold text-slate-900 dark:text-white">Staff Seats</span>
            </div>
            <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-200">
              {staffCount} / {maxStaff}
            </span>
          </div>

          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                staffPercent > 85 ? 'bg-rose-500' : staffPercent > 60 ? 'bg-amber-500' : 'bg-purple-600'
              }`}
              style={{ width: `${staffPercent}%` }}
            />
          </div>

          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>
              {maxStaff - staffCount > 0
                ? `${maxStaff - staffCount} member seats available`
                : 'Staff seats full'}
            </span>
            <span>{staffPercent}% Used</span>
          </div>
        </div>
      </div>

      {/* Available Plans & Upgrades Section */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span>Available Subscription Tiers</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Scale your fleet capacity with Nepal payment methods (eSewa, Khalti, Fonepay, Bank Transfer).
            </p>
          </div>
        </div>

        {loadingPlans ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading subscription tiers...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((p) => {
              const isCurrent = plan?.id === p.id;
              return (
                <div
                  key={p.id}
                  className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                    isCurrent
                      ? 'bg-indigo-50/50 dark:bg-indigo-900/10 border-indigo-500 ring-1 ring-indigo-500'
                      : 'bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">{p.name}</span>
                      {isCurrent ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-600 text-white">
                          Current Plan
                        </span>
                      ) : null}
                    </div>

                    <div className="text-xl font-black font-['Outfit'] text-indigo-600 dark:text-indigo-400">
                      {p.price === 0 ? 'FREE' : `NPR ${p.price.toLocaleString()}`}
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">
                        /{p.billingCycle.toLowerCase()}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 min-h-[32px] line-clamp-2">
                      {p.description || 'Enterprise fleet management and booking operations.'}
                    </p>

                    <div className="py-2.5 border-y border-slate-100 dark:border-slate-800 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Max Fleet Capacity:</span>
                        <span className="font-semibold text-slate-900 dark:text-white font-mono">{p.maxVehicles} Vehicles</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Authorized Staff:</span>
                        <span className="font-semibold text-slate-900 dark:text-white font-mono">{p.maxStaff} Users</span>
                      </div>
                    </div>

                    {/* Features list */}
                    <div className="space-y-1.5 pt-1">
                      {(p.features || ['Fleet Operations', 'Booking Engine', 'Digital Bluebook']).slice(0, 4).map((f, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-400">
                          <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span className="capitalize">{f.replace(/_/g, ' ')}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-5">
                    {isCurrent ? (
                      <button
                        disabled
                        className="w-full py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 text-xs font-semibold cursor-not-allowed"
                      >
                        Active Tier
                      </button>
                    ) : (
                      <button
                        onClick={() => setSelectedPlan(p)}
                        className="w-full py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                      >
                        <span>Upgrade to {p.name}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Upgrade / Payment Modal with Admin QR Code Display */}
      {selectedPlan && (
        <Modal
          isOpen={!!selectedPlan}
          onClose={() => setSelectedPlan(null)}
          title={`Subscribe to ${selectedPlan.name}`}
          subtitle={`Upgrade your rental agency capacity to ${selectedPlan.maxVehicles} vehicles`}
          icon={CreditCard}
          maxWidth="lg"
        >
          <div className="space-y-5">
            {/* Plan Summary Box */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 block">Selected Tier</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">{selectedPlan.name}</span>
                <span className="text-[11px] text-slate-500 block">
                  Capacity: {selectedPlan.maxVehicles} Vehicles &bull; {selectedPlan.maxStaff} Staff
                </span>
              </div>
              <div className="text-right">
                <span className="text-lg font-black text-indigo-600 dark:text-indigo-400 font-mono">
                  {selectedPlan.price === 0 ? 'FREE' : `NPR ${selectedPlan.price.toLocaleString()}`}
                </span>
                <span className="text-[10px] text-slate-400 block font-normal">
                  /{selectedPlan.billingCycle.toLowerCase()}
                </span>
              </div>
            </div>

            {/* Payment Method Selector */}
            {selectedPlan.price > 0 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    1. Select Payment Method (Nepal)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'ESEWA', name: 'eSewa', badge: 'Digital Wallet' },
                      { id: 'KHALTI', name: 'Khalti', badge: 'Digital Wallet' },
                      { id: 'FONEPAY', name: 'Fonepay', badge: 'QR Interbank' },
                      { id: 'CASH', name: 'Bank Transfer', badge: 'Direct Deposit' },
                    ].map((gw) => (
                      <button
                        key={gw.id}
                        type="button"
                        onClick={() => {
                          setPaymentMethod(gw.id as any);
                          setCopied(false);
                        }}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          paymentMethod === gw.id
                            ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-900/20 ring-1 ring-indigo-500'
                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-900 dark:text-white">{gw.name}</span>
                          {paymentMethod === gw.id && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                        </div>
                        <span className="text-[10px] text-slate-500 block">{gw.badge}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Official Admin QR Code & Payment Display Box */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                      <QrCode className="w-4 h-4 text-indigo-600" />
                      <span>Scan Official Payment QR Code</span>
                    </span>
                    <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      Amount: NPR {selectedPlan.price.toLocaleString()}
                    </span>
                  </div>

                  {/* QR Image Display */}
                  <div className="flex flex-col sm:flex-row items-center gap-5 justify-center py-2">
                    {activeGateway.qrUrl ? (
                      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm shrink-0">
                        <img
                          src={activeGateway.qrUrl}
                          alt={`${paymentMethod} QR`}
                          className="w-44 h-44 object-contain rounded-xl"
                        />
                      </div>
                    ) : (
                      <div className="w-44 h-44 bg-white dark:bg-slate-900 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl flex flex-col items-center justify-center p-3 text-center shrink-0">
                        <QrCode className="w-10 h-10 text-slate-400 mb-1.5" />
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          {paymentMethod} Payment
                        </span>
                        <span className="text-[10px] text-slate-400 mt-1">
                          Transfer to account ID below
                        </span>
                      </div>
                    )}

                    {/* Account Details & 1-Click Copy */}
                    <div className="space-y-3 flex-1 w-full text-xs">
                      <div>
                        <span className="text-slate-400 block text-[11px]">Payment Gateway:</span>
                        <span className="font-bold text-slate-900 dark:text-white text-sm">
                          {activeGateway.name}
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-400 block text-[11px]">Account Holder Name:</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {activeGateway.accountName}
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-400 block text-[11px]">Receiving ID / Number:</span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-mono font-bold text-slate-900 dark:text-white px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs">
                            {activeGateway.id}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(activeGateway.id);
                              setCopied(true);
                              setTimeout(() => setCopied(false), 3000);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-colors"
                          >
                            {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            <span>{copied ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-[11px] text-amber-800 dark:text-amber-300">
                        Scan the QR code with your mobile banking or wallet app, complete payment, and enter reference below.
                      </div>
                    </div>
                  </div>

                  {/* 3. Transaction ID & Optional Receipt Upload */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200 dark:border-slate-700">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Transaction / Reference ID (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 9842109852 / TXN-9912"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        className="input-field text-xs font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Payment Receipt Screenshot (Optional)
                      </label>
                      {receiptUrl ? (
                        <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center justify-between">
                          <span className="truncate">Voucher Attached</span>
                          <button
                            type="button"
                            onClick={() => setReceiptUrl('')}
                            className="text-rose-600 font-bold ml-2 text-[11px]"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <label className="border border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-2 text-center block cursor-pointer hover:border-indigo-500 text-xs text-slate-600 dark:text-slate-400">
                          <span>{uploadingReceipt ? 'Uploading receipt...' : 'Attach Payment Screenshot'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            disabled={uploadingReceipt}
                            onChange={handleReceiptUpload}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={submitting}
                onClick={() => setSelectedPlan(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleSubscribe}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/25 flex items-center gap-2 transition-all disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Activating Subscription...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Confirm & Activate Plan</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
