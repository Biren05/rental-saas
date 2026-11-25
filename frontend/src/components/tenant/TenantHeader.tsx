'use client';

import React from 'react';
import { LogOut, Building2, Sun, Moon } from 'lucide-react';
import { Tenant, User } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface TenantHeaderProps {
  tenant: Tenant | null;
  user: User | null;
  onLogout: () => void;
}

export const TenantHeader: React.FC<TenantHeaderProps> = ({ tenant, user, onLogout }) => {
  const { theme, toggleTheme } = useTheme();
  const plan = tenant?.subscriptions?.[0]?.plan;

  return (
    <header className="h-14 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c111d] px-6 flex items-center justify-between shrink-0 transition-colors">
      {/* Left: Organization Title & Status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          <span className="text-xs font-semibold text-slate-900 dark:text-white truncate max-w-xs">
            {tenant?.name || 'Workspace'}
          </span>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium ${
            tenant?.status === 'ACTIVE'
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              tenant?.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-rose-500'
            }`}
          />
          {tenant?.status || 'ACTIVE'}
        </span>
      </div>

      {/* Right: Plan pill, Theme Toggle, User profile, Sign Out */}
      <div className="flex items-center gap-3">
        {plan && (
          <span className="hidden sm:inline-block text-[11px] text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2.5 py-1 rounded-md">
            {plan.name}
          </span>
        )}

        {/* Theme Toggle Button (Light/Dark) */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-700" />
          )}
        </button>

        {/* User Profile Info */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
          <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center text-xs font-bold text-slate-800 dark:text-white">
            {user?.fullName?.charAt(0) || 'U'}
          </div>
          <span className="hidden sm:inline text-xs text-slate-700 dark:text-slate-300 font-medium">
            {user?.fullName || 'User'}
          </span>
        </div>

        {/* Logout */}
        <button
          type="button"
          onClick={onLogout}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors py-1 px-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-900"
          title="Sign Out"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );
};
