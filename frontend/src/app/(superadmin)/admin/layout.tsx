'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import {
  LayoutDashboard,
  Building2,
  Layers,
  Activity,
  LogOut,
  ExternalLink,
  ShieldAlert,
  Car,
  Users,
  CreditCard,
  FileText,
  Settings,
} from 'lucide-react';

export default function SuperadminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (user.role !== 'ADMIN') {
        router.push('/dashboard');
      }
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Verifying Superadmin Session...</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { label: 'Dashboard Overview', href: '/admin', icon: LayoutDashboard },
    { label: 'Tenant Management', href: '/admin/tenants', icon: Building2 },
    { label: 'Plans & Subscriptions', href: '/admin/plans', icon: Layers },
    { label: 'Billing & Invoices', href: '/admin/billing', icon: CreditCard },
    { label: 'Platform Users & Roles', href: '/admin/users', icon: Users },
    { label: 'Audit Logs', href: '/admin/logs', icon: FileText },
    { label: 'System Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex bg-[#f8fafc] text-slate-900">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-200 bg-white flex flex-col shrink-0 shadow-xs">
        {/* Brand */}
        <div className="p-5 border-b border-slate-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-sm shadow-indigo-500/20">
            <Car className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-bold text-sm tracking-tight text-slate-900 font-['Outfit']">
              AutoRent <span className="text-indigo-600 font-black">SaaS</span>
            </div>
            <div className="text-[10px] uppercase tracking-wider text-indigo-600 font-semibold flex items-center gap-1">
              <ShieldAlert className="w-3 h-3" /> Superadmin
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <div className="text-[10px] uppercase font-semibold text-slate-400 px-3 mb-2 tracking-wider">
            Management
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <a
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                {item.label}
              </a>
            );
          })}

          <div className="pt-4 mt-4 border-t border-slate-200">
            <div className="text-[10px] uppercase font-semibold text-slate-400 px-3 mb-2 tracking-wider">
              Developer & API
            </div>
            <a
              href="http://localhost:4000/docs"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between px-3.5 py-2 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all"
            >
              <span>OpenAPI Swagger</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>
          </div>
        </nav>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/70">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-xs font-bold text-indigo-700">
                AD
              </div>
              <div className="truncate">
                <div className="text-xs font-semibold text-slate-900 truncate">{user.fullName}</div>
                <div className="text-[11px] text-slate-500 truncate">{user.email}</div>
              </div>
            </div>
            <button
              onClick={() => {
                logout();
                router.push('/login');
              }}
              title="Sign Out"
              className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-all"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-emerald-600 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Platform Operational
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Topbar */}
        <header className="h-16 border-b border-slate-200 bg-white/90 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">Portal /</span>
            <span className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
              {pathname.replace('/admin', '') ? pathname.replace('/admin/', '') : 'Overview'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="badge badge-trialing">
              SaaS Engine v1.0
            </span>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8 flex-1 bg-[#f8fafc]">
          {children}
        </main>
      </div>
    </div>
  );
}
