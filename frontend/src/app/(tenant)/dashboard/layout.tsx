'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { TenantProvider, useTenant } from '@/context/TenantContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { TenantSidebar } from '@/components/tenant/TenantSidebar';
import { TenantHeader } from '@/components/tenant/TenantHeader';
import { Building2, AlertTriangle, ShieldCheck, Clock, CreditCard, ArrowRight } from 'lucide-react';
import { SubscriptionExpiryModal } from '@/components/tenant/SubscriptionExpiryModal';
import Link from 'next/link';

function TenantLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, logout, loading: authLoading, isAdmin } = useAuth();
  const { tenant, loading: tenantLoading, availableTenants, switchTenant, isTenantDomain } = useTenant();
  const [showManualExpiryModal, setShowManualExpiryModal] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Expiry calculation for top banner
  const subscription = tenant?.subscriptions?.[0];
  const endDate = subscription?.endDate ? new Date(subscription.endDate) : null;
  const now = new Date();
  const diffMs = endDate ? endDate.getTime() - now.getTime() : 0;
  const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const isExpired = endDate ? daysLeft <= 0 || subscription?.status === 'EXPIRED' : false;
  const isExpiringSoon = endDate ? !isExpired && daysLeft <= 2 : false;
  const isTrial = subscription?.plan?.price === 0 || subscription?.status === 'TRIALING';

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  if (authLoading || (tenantLoading && !tenant)) {
    return (
      <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0b0f19] flex items-center justify-center text-slate-500 dark:text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-medium tracking-wide">Loading workspace...</span>
        </div>
      </div>
    );
  }

  // If no tenant is available for non-admin user
  if (!tenant && !isAdmin) {
    return (
      <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0b0f19] flex items-center justify-center p-6">
        <div className="max-w-md w-full p-8 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white font-['Outfit']">No Organization Found</h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Your account is not currently associated with an active rental company organization.
            Please reach out to your administrator or platform support to be added.
          </p>
          <div className="pt-2">
            <button
              onClick={() => {
                logout();
                router.push('/login');
              }}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition-colors"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#f8fafc] dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 overflow-hidden font-['Inter'] transition-colors">
      {/* Persistent Left Sidebar */}
      <TenantSidebar
        tenant={tenant}
        isAdmin={isAdmin}
        isTenantDomain={isTenantDomain}
        availableTenants={availableTenants}
        onSwitchTenant={switchTenant}
      />

      {/* Main App Workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TenantHeader
          tenant={tenant}
          user={user}
          onLogout={() => {
            logout();
            router.push('/login');
          }}
        />

        {/* Sticky Top Expiry Warning Banner (<= 2 days or Expired) */}
        {(isExpiringSoon || isExpired) && (
          <div
            className={`px-4 py-2.5 border-b text-xs flex flex-wrap items-center justify-between gap-3 shrink-0 transition-colors ${
              isExpired
                ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60 text-rose-900 dark:text-rose-200'
                : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <div
                className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${
                  isExpired ? 'bg-rose-200 dark:bg-rose-900 text-rose-700' : 'bg-amber-200 dark:bg-amber-900 text-amber-700'
                }`}
              >
                {isExpired ? <AlertTriangle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5 animate-pulse" />}
              </div>
              <div>
                <span className="font-semibold">
                  {isExpired
                    ? '⚠️ Package Expired:'
                    : `⏳ Subscription Expiry Warning (${daysLeft} day${daysLeft === 1 ? '' : 's'} left):`}
                </span>{' '}
                <span className="opacity-90">
                  {isExpired
                    ? `Your ${isTrial ? '14-Day Free Trial' : 'Subscription'} has expired. Please renew your package to continue accessing all services without disruption.`
                    : `Your ${isTrial ? '14-Day Free Trial' : 'Subscription'} will expire in ${daysLeft} day${daysLeft === 1 ? '' : 's'} (${endDate?.toLocaleDateString()}). Please renew your package or contact platform support.`}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowManualExpiryModal(true)}
                className="px-2.5 py-1 rounded-lg border border-current opacity-80 hover:opacity-100 font-medium transition-opacity"
              >
                View Notice
              </button>
              <Link
                href="/dashboard/subscription"
                className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-colors ${
                  isExpired
                    ? 'bg-rose-600 hover:bg-rose-700 text-white'
                    : 'bg-amber-600 hover:bg-amber-700 text-white'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Renew Now</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        )}

        {/* Auto-Pop Expiry Alert Modal */}
        <SubscriptionExpiryModal
          tenant={tenant}
          isOpenOverride={showManualExpiryModal ? true : undefined}
          onCloseOverride={() => setShowManualExpiryModal(false)}
        />

        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
}

export default function TenantDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TenantProvider>
      <TenantLayoutContent>{children}</TenantLayoutContent>
    </TenantProvider>
  );
}
