'use client';

import React, { useEffect, useState } from 'react';
import { analyticsService, VehicleTypeDistribution } from '../../../../services';
import {
  TrendingUp,
  Car,
  PieChart,
  BarChart3,
  Calendar,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

export default function AdminAnalyticsPage() {
  const [distribution, setDistribution] = useState<VehicleTypeDistribution[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const data = await analyticsService.getVehicleTypeDistribution();
      setDistribution(data || []);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const totalVehicles = distribution.reduce((sum, item) => sum + item._count.id, 0);

  const colors = [
    '#6366f1', // Indigo
    '#8b5cf6', // Purple
    '#ec4899', // Pink
    '#06b6d4', // Cyan
    '#10b981', // Emerald
    '#f59e0b', // Amber
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-['Outfit']">
            Platform <span className="text-indigo-600">Analytics</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Visual fleet distribution, registration velocity, and platform growth metrics.
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          className="btn-secondary text-xs px-3.5 py-2 self-start sm:self-auto"
          title="Refresh Analytics"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Grid of Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vehicle Distribution Card */}
        <div className="glass-panel p-6 bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-base text-slate-900">Fleet by Vehicle Category</h3>
              <p className="text-xs text-slate-500">Breakdown of cars, bikes, scooters & commercial vehicles</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <PieChart className="w-5 h-5" />
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-slate-500">Loading vehicle distribution...</div>
          ) : distribution.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">No vehicles registered yet.</div>
          ) : (
            <div className="space-y-4">
              {distribution.map((item, idx) => {
                const count = item._count.id;
                const percentage = totalVehicles > 0 ? Math.round((count / totalVehicles) * 100) : 0;
                const color = colors[idx % colors.length];

                return (
                  <div key={item.vehicleType} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                        <span className="font-medium text-slate-800">{item.vehicleType}</span>
                      </div>
                      <span className="text-slate-500 font-mono">
                        {count} ({percentage}%)
                      </span>
                    </div>
                    {/* Progress Bar */}
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Growth Velocity Card */}
        <div className="glass-panel p-6 bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-base text-slate-900">Quarterly Registration Velocity</h3>
              <p className="text-xs text-slate-500">Fleet operators and customer onboarding performance</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
              <BarChart3 className="w-5 h-5" />
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="text-xs text-slate-500 mb-1">Current Period</div>
              <div className="text-2xl font-bold text-slate-900 font-['Outfit']">2026-Q3</div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100">
                <div className="text-xs text-indigo-700 mb-1 font-medium">New User Accounts</div>
                <div className="text-2xl font-bold text-slate-900 font-['Outfit']">+150</div>
                <div className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1 font-medium">
                  <TrendingUp className="w-3 h-3" /> +24% vs last quarter
                </div>
              </div>

              <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-100">
                <div className="text-xs text-purple-700 mb-1 font-medium">New Vehicles Added</div>
                <div className="text-2xl font-bold text-slate-900 font-['Outfit']">+320</div>
                <div className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1 font-medium">
                  <TrendingUp className="w-3 h-3" /> +38% vs last quarter
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
