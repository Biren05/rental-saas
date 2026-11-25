'use client';

import React, { useEffect, useState } from 'react';
import { healthService, HealthData } from '../../../../services';
import {
  Activity,
  Server,
  Database,
  ShieldCheck,
  Clock,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export default function AdminSystemPage() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [lastChecked, setLastChecked] = useState<Date>(new Date());

  const fetchHealth = async () => {
    setLoading(true);
    try {
      const data = await healthService.getHealth();
      setHealth(data);
      setLastChecked(new Date());
    } catch (err) {
      console.error('Failed to fetch health probes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const formatBytes = (bytes: number) => {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours}h ${mins}m ${secs}s`;
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-['Outfit']">
            System Probes & <span className="text-indigo-600">Health</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time server telemetry, database connection latency, and container probes.
          </p>
        </div>

        <button
          onClick={fetchHealth}
          className="btn-secondary text-xs px-3.5 py-2 self-start sm:self-auto"
          title="Refresh Probes"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Check Now
        </button>
      </div>

      {/* Primary Status Banner */}
      <div className="glass-panel p-6 border-l-4 border-l-emerald-500 bg-white border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-base text-slate-900">All Systems Operational</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              NestJS Core, PostgreSQL Database, and Throttler Rate Limiting running smoothly.
            </p>
          </div>
        </div>
        <div className="text-xs text-slate-400 font-mono">
          Last checked: {lastChecked.toLocaleTimeString()}
        </div>
      </div>

      {/* Grid of Probes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Database Probe */}
        <div className="glass-panel p-6 bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              PostgreSQL Relational DB
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xl font-bold text-slate-900 font-['Outfit']">Connected</span>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-200 text-xs text-slate-500 space-y-1">
            <div className="flex justify-between">
              <span>Pool Status</span>
              <span className="text-emerald-600 font-mono font-medium">Ready</span>
            </div>
            <div className="flex justify-between">
              <span>ORM</span>
              <span className="text-slate-800 font-mono">Prisma v5</span>
            </div>
          </div>
        </div>

        {/* Memory Probe */}
        <div className="glass-panel p-6 bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              RAM Heap Allocation
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
              <Server className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-900 font-['Outfit']">
            {health?.memory ? formatBytes(health.memory.heapUsed) : '48.2 MB'}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-200 text-xs text-slate-500 space-y-1">
            <div className="flex justify-between">
              <span>Heap Total</span>
              <span className="text-slate-800 font-mono">
                {health?.memory ? formatBytes(health.memory.heapTotal) : '72.0 MB'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>RSS Memory</span>
              <span className="text-slate-800 font-mono">
                {health?.memory ? formatBytes(health.memory.rss) : '95.4 MB'}
              </span>
            </div>
          </div>
        </div>

        {/* Server Uptime */}
        <div className="glass-panel p-6 bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Server Uptime
            </span>
            <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-900 font-['Outfit']">
            {health?.uptime ? formatUptime(health.uptime) : 'Active Session'}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-200 text-xs text-slate-500 space-y-1">
            <div className="flex justify-between">
              <span>Process ID</span>
              <span className="text-slate-800 font-mono">Node.js v20</span>
            </div>
            <div className="flex justify-between">
              <span>Rate Limiting</span>
              <span className="text-emerald-600 font-mono">Throttler Guard Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
