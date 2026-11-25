'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Car,
  Calendar,
  Users,
  Receipt,
  CreditCard,
  Settings,
  ShieldCheck,
  Radio,
  ExternalLink,
} from 'lucide-react';
import { Tenant } from '../../types';

interface TenantSidebarProps {
  tenant: Tenant | null;
  isAdmin?: boolean;
  isTenantDomain?: boolean;
  availableTenants?: Tenant[];
  onSwitchTenant?: (tenantId: string) => void;
}

export const TenantSidebar: React.FC<TenantSidebarProps> = ({
  tenant,
  isAdmin,
  isTenantDomain = false,
  availableTenants,
  onSwitchTenant,
}) => {
  const pathname = usePathname();

  const navItems = [
    { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Vehicles', href: '/dashboard/vehicles', icon: Car },
    { label: 'Live GPS & IoT', href: '/dashboard/tracking', icon: Radio },
    { label: 'Bookings', href: '/dashboard/bookings', icon: Calendar },
    { label: 'Staff & Drivers', href: '/dashboard/staff', icon: Users },
    { label: 'Payments & Udharo', href: '/dashboard/payments', icon: Receipt },
    { label: 'Subscription', href: '/dashboard/subscription', icon: CreditCard },
    { label: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  const plan = tenant?.subscriptions?.[0]?.plan;
  const vehicleCount = tenant?._count?.vehicles || 0;
  const maxVehicles = plan?.maxVehicles || 10;
  const usagePercent = Math.min(Math.round((vehicleCount / maxVehicles) * 100), 100);

  return (
    <aside
      className="w-60 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c111d] text-slate-700 dark:text-slate-300 flex flex-col shrink-0 transition-colors"
      style={{ backgroundColor: 'var(--bg-card, #ffffff)' }}
    >
      {/* Brand & Organization */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0 font-bold shadow-xs">
            <Car className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
              {tenant?.name || 'AutoRent'}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate mt-0.5">
              /{tenant?.slug || 'portal'}
            </div>
          </div>
        </div>

        {/* Optional Workspace Switcher for Superadmin / Multiple Tenants (hidden on dedicated tenant domain) */}
        {!isTenantDomain && availableTenants && availableTenants.length > 1 && (
          <div className="mt-3">
            <select
              value={tenant?.id || ''}
              onChange={(e) => onSwitchTenant?.(e.target.value)}
              aria-label="Switch Workspace"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-2xs"
            >
              {availableTenants.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Clean Navigation Links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-50 dark:bg-indigo-600/15 text-indigo-600 dark:text-white font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <Icon
                className={`w-4 h-4 ${
                  isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'
                }`}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Simple Quota Line & Superadmin Link */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>Fleet</span>
            <span className="font-mono text-slate-700 dark:text-slate-200">
              {vehicleCount} / {maxVehicles}
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${
                usagePercent > 80 ? 'bg-amber-500' : 'bg-indigo-500'
              }`}
              style={{ width: `${usagePercent}%` }}
            />
          </div>
        </div>

        {tenant?.slug && (
          <a
            href={
              isTenantDomain
                ? '/'
                : typeof window !== 'undefined' && window.location.hostname === 'localhost'
                ? `${window.location.protocol}//${tenant.slug}.localhost${window.location.port ? `:${window.location.port}` : ''}`
                : `/rent/${tenant.slug}`
            }
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between py-1.5 px-2.5 rounded-lg text-xs text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/70 dark:border-indigo-800/60 font-medium transition-colors"
          >
            <span>Public Storefront</span>
            <ExternalLink className="w-3.5 h-3.5 shrink-0" />
          </a>
        )}

        {isAdmin && !isTenantDomain && (
          <Link
            href="/admin"
            className="flex items-center gap-2 py-1.5 px-2.5 rounded-lg text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Superadmin</span>
          </Link>
        )}
      </div>
    </aside>
  );
};
