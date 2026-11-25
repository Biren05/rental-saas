'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Tenant } from '../../types';
import {
  AlertTriangle,
  Clock,
  ArrowRight,
  ShieldAlert,
  Headphones,
  CheckCircle2,
  X,
  CreditCard,
} from 'lucide-react';

interface SubscriptionExpiryModalProps {
  tenant: Tenant | null;
  isOpenOverride?: boolean;
  onCloseOverride?: () => void;
}

export const SubscriptionExpiryModal: React.FC<SubscriptionExpiryModalProps> = ({
  tenant,
  isOpenOverride,
  onCloseOverride,
}) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const subscription = tenant?.subscriptions?.[0];
  const plan = subscription?.plan;

  // Calculate days left
  const now = new Date();
  const endDate = subscription?.endDate ? new Date(subscription.endDate) : null;
  const diffMs = endDate ? endDate.getTime() - now.getTime() : 0;
  const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const isExpired = endDate ? daysLeft <= 0 || subscription?.status === 'EXPIRED' : false;
  const isExpiringSoon = endDate ? !isExpired && daysLeft <= 2 : false;
  const isTrial = plan?.price === 0 || subscription?.status === 'TRIALING';

  useEffect(() => {
    if (isOpenOverride !== undefined) {
      setIsOpen(isOpenOverride);
      return;
    }

    if (!subscription || !endDate) return;

    // Trigger auto-pop if package is expiring in 2 days (or has expired)
    if (isExpiringSoon || isExpired) {
      const storageKey = `autorent_expiry_modal_dismissed_${subscription.id}`;
      const dismissed = typeof window !== 'undefined' ? sessionStorage.getItem(storageKey) : null;
      if (!dismissed) {
        setIsOpen(true);
      }
    }
  }, [subscription, endDate, isExpiringSoon, isExpired, isOpenOverride]);

  const handleClose = () => {
    setIsOpen(false);
    if (subscription && typeof window !== 'undefined') {
      sessionStorage.setItem(`autorent_expiry_modal_dismissed_${subscription.id}`, 'true');
    }
    if (onCloseOverride) {
      onCloseOverride();
    }
  };

  const handleNavigateRenew = () => {
    handleClose();
    router.push('/dashboard/subscription');
  };

  if (!isOpen || (!isExpiringSoon && !isExpired && isOpenOverride === undefined)) {
    return null;
  }

  const formattedEndDate = endDate
    ? endDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'N/A';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-[#0f172a] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative text-slate-900 dark:text-slate-100">
        {/* Top Gradient Banner Header */}
        <div
          className={`px-6 py-5 flex items-center justify-between ${
            isExpired
              ? 'bg-gradient-to-r from-rose-600 to-red-700 text-white'
              : 'bg-gradient-to-r from-amber-500 to-orange-600 text-white'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shrink-0">
              {isExpired ? <ShieldAlert className="w-5 h-5" /> : <Clock className="w-5 h-5 animate-pulse" />}
            </div>
            <div>
              <h3 className="font-bold text-base tracking-tight font-['Outfit']">
                {isExpired ? 'Package Expired' : 'Subscription Expiry Notice'}
              </h3>
              <p className="text-xs text-white/90">
                {isExpired
                  ? 'Your platform access needs immediate renewal'
                  : `Remaining: ${daysLeft} day${daysLeft === 1 ? '' : 's'} before package termination`}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-lg bg-black/10 hover:bg-black/20 flex items-center justify-center text-white/90 hover:text-white transition-colors"
            title="Dismiss popup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-4">
          {/* Nepali Urgency Notice */}
          <div
            className={`p-4 rounded-xl border text-xs leading-relaxed ${
              isExpired
                ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-300'
                : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50 text-amber-900 dark:text-amber-300'
            }`}
          >
            <div className="font-semibold text-sm mb-1 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>
                {isExpired
                  ? 'Your package has expired!'
                  : 'Your package expires in less than 2 days!'}
              </span>
            </div>
            <p>
              {isExpired
                ? `Your subscription for ${tenant?.name || 'your organization'} on AutoRent has expired. To maintain uninterrupted access to fleet management, GPS tracking, and reservation services, please renew your plan or contact support.`
                : `Your subscription for ${tenant?.name || 'your organization'} on AutoRent will expire in ${daysLeft} day${daysLeft === 1 ? '' : 's'} (${formattedEndDate}). Please renew your package on time to avoid service interruption.`}
            </p>
          </div>

          {/* Subscription Meta Breakdown */}
          <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-4 border border-slate-200 dark:border-slate-800 space-y-2.5 text-xs">
            <div className="flex justify-between items-center py-1 border-b border-slate-200/60 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400">Organization:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{tenant?.name}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-200/60 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400">Current Plan:</span>
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                {plan?.name || 'Starter Plan'} ({isTrial ? '14-Day Free Trial' : 'Paid Plan'})
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-200/60 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400">Expiry Date:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{formattedEndDate}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-500 dark:text-slate-400">Status:</span>
              <span
                className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                  isExpired
                    ? 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-400'
                    : 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400'
                }`}
              >
                {isExpired ? 'EXPIRED' : `${daysLeft} DAY${daysLeft === 1 ? '' : 'S'} REMAINING`}
              </span>
            </div>
          </div>

          {/* Support / Contact info banner */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <Headphones className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>Support Contact:</span>
            </div>
            <a
              href="mailto:dhamib610@gmail.com?subject=AutoRent%20Subscription%20Support"
              className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              dhamib610@gmail.com
            </a>
          </div>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
            <button
              type="button"
              onClick={handleNavigateRenew}
              className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm shadow-indigo-600/30"
            >
              <CreditCard className="w-4 h-4" />
              <span>Renew / Upgrade Plan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={handleClose}
              className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium text-xs transition-colors"
            >
              Remind Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
