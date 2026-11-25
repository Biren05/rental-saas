'use client';

import React, { useEffect, useState } from 'react';
import { adminService, subscriptionService, DashboardMetrics } from '../../../services';
import { RefreshCw, Plus } from 'lucide-react';
import Link from 'next/link';
import { OverviewMetrics } from '../../../components/superadmin/overview/OverviewMetrics';
import { QuickNavCards } from '../../../components/superadmin/overview/QuickNavCards';

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [plansCount, setPlansCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const [adminStats, plans] = await Promise.all([
        adminService.getDashboardStats(),
        subscriptionService.getAllPlans(),
      ]);
      setMetrics(adminStats);
      setPlansCount(plans?.length || 0);
    } catch (err) {
      console.error('Failed to fetch admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-['Outfit']">
            Dashboard <span className="text-indigo-600">Overview</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time telemetry and platform metrics across all rental fleets and subscriptions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchStats}
            className="btn-secondary text-xs px-3.5 py-2"
            title="Refresh Metrics"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <Link href="/admin/plans" className="btn-primary text-xs px-4 py-2">
            <Plus className="w-3.5 h-3.5" />
            Create SaaS Plan
          </Link>
        </div>
      </div>

      {/* KPI Cards Component */}
      <OverviewMetrics
        loading={loading}
        totalVehicles={metrics?.totalVehicles ?? 0}
        totalUsers={metrics?.totalUsers ?? 0}
        plansCount={plansCount}
        totalQrCodes={metrics?.totalQrCodes ?? 0}
      />

      {/* Quick Navigation Cards Component */}
      <QuickNavCards />
    </div>
  );
}
