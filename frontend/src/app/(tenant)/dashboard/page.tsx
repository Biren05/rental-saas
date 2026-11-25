'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTenant } from '@/context/TenantContext';
import { useAuth } from '@/context/AuthContext';
import {
  Car,
  Calendar,
  Users,
  FileText,
  Plus,
  ArrowRight,
  MapPin,
  Phone,
  Mail,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import { vehicleService } from '@/services/vehicle.service';
import { rentalService, TenantOperationalAlerts } from '@/services/rental.service';
import { Vehicle, RentalBooking } from '@/types';

export default function TenantDashboardOverview() {
  const { tenant, tenantId } = useTenant();
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [bookings, setBookings] = useState<RentalBooking[]>([]);
  const [alerts, setAlerts] = useState<TenantOperationalAlerts>({
    overdueBookings: [],
    expiryAlerts: [],
  });
  const [loadingStats, setLoadingStats] = useState<boolean>(true);

  useEffect(() => {
    if (!tenantId) return;

    let mounted = true;
    setLoadingStats(true);

    Promise.all([
      vehicleService.getTenantVehicles(tenantId).catch(() => []),
      rentalService.getTenantBookings(tenantId).catch(() => []),
      rentalService.getOperationalAlerts(tenantId).catch(() => ({
        overdueBookings: [],
        expiryAlerts: [],
      })),
    ]).then(([vehiclesRes, bookingsRes, alertsRes]) => {
      if (!mounted) return;
      const vList = (vehiclesRes as any)?.data || (Array.isArray(vehiclesRes) ? vehiclesRes : []);
      const bList = (bookingsRes as any)?.data || (Array.isArray(bookingsRes) ? bookingsRes : []);
      const aData = (alertsRes as any)?.data || alertsRes || { overdueBookings: [], expiryAlerts: [] };
      setVehicles(vList);
      setBookings(bList);
      setAlerts({
        overdueBookings: aData.overdueBookings || [],
        expiryAlerts: aData.expiryAlerts || [],
      });
      setLoadingStats(false);
    });

    return () => {
      mounted = false;
    };
  }, [tenantId]);

  const plan = tenant?.subscriptions?.[0]?.plan;
  const totalVehicles = vehicles.length || tenant?._count?.vehicles || 0;
  const availableVehicles = vehicles.filter((v) => v.status === 'AVAILABLE').length;

  const totalBookings = bookings.length || tenant?._count?.bookings || 0;
  const activeBookings = bookings.filter((b) => b.status === 'ACTIVE').length;

  const totalStaff = tenant?._count?.members || tenant?.members?.length || 1;
  const totalDocs = tenant?.documents?.length || 0;

  const maxVehicles = plan?.maxVehicles || 10;
  const quotaPercent = Math.min(Math.round((totalVehicles / maxVehicles) * 100), 100);

  return (
    <div className="space-y-6">
      {/* Simple Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Dashboard Overview</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Welcome back, {user?.fullName || 'Partner'}. Here is your fleet summary today.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/dashboard/vehicles"
            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Vehicle</span>
          </Link>
          <Link
            href="/dashboard/bookings"
            className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 text-xs font-medium flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Calendar className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>Bookings</span>
          </Link>
        </div>
      </div>

      {/* 4 Clean Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Vehicles */}
        <Link
          href="/dashboard/vehicles"
          className="p-4 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors block shadow-xs"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium">Fleet Vehicles</span>
            <Car className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono">{totalVehicles}</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">{availableVehicles}</span> available for rent
          </div>
        </Link>

        {/* Bookings */}
        <Link
          href="/dashboard/bookings"
          className="p-4 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors block shadow-xs"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium">Reservations</span>
            <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono">{totalBookings}</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            <span className="text-blue-600 dark:text-blue-400 font-medium">{activeBookings}</span> active trip(s)
          </div>
        </Link>

        {/* Staff */}
        <Link
          href="/dashboard/staff"
          className="p-4 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors block shadow-xs"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium">Staff & Drivers</span>
            <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono">{totalStaff}</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Authorized operators</div>
        </Link>

        {/* Documents */}
        <Link
          href="/dashboard/documents"
          className="p-4 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors block shadow-xs"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium">Compliance Docs</span>
            <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono">{totalDocs}</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Uploaded to Cloudinary</div>
        </Link>
      </div>

      {/* Operational Alerts: Late-Return Overdue & Bluebook/Insurance Expiry */}
      {(alerts.overdueBookings.length > 0 || alerts.expiryAlerts.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {alerts.overdueBookings.length > 0 && (
            <div className="p-4 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-rose-800 dark:text-rose-300">
                  <Clock className="w-4 h-4 text-rose-600" />
                  <span>Overdue Vehicle Returns ({alerts.overdueBookings.length})</span>
                </div>
                <Link
                  href="/dashboard/bookings"
                  className="text-[11px] font-semibold text-rose-700 dark:text-rose-400 hover:underline"
                >
                  Manage →
                </Link>
              </div>
              <div className="space-y-1.5">
                {alerts.overdueBookings.slice(0, 3).map((ob) => (
                  <div
                    key={ob.id}
                    className="p-2 rounded-lg bg-white dark:bg-[#111827] border border-rose-200/80 dark:border-rose-900/50 flex items-center justify-between text-xs"
                  >
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 dark:text-white truncate">
                        {ob.vehicleName} ({ob.plateNumber})
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {ob.customerName} {ob.customerPhone ? `• ${ob.customerPhone}` : ''}
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400">
                        {ob.hoursOverdue}h late
                      </span>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                        Est. Fee: NPR {ob.suggestedLateFee.toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {alerts.expiryAlerts.length > 0 && (
            <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-900 dark:text-amber-300">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Bluebook, Insurance & Servicing Alerts ({alerts.expiryAlerts.length})</span>
                </div>
                <Link
                  href="/dashboard/vehicles"
                  className="text-[11px] font-semibold text-amber-800 dark:text-amber-400 hover:underline"
                >
                  View Fleet →
                </Link>
              </div>
              <div className="space-y-1.5">
                {alerts.expiryAlerts.slice(0, 3).map((ex) => (
                  <div
                    key={ex.id}
                    className="p-2 rounded-lg bg-white dark:bg-[#111827] border border-amber-200/80 dark:border-amber-900/50 flex items-center justify-between text-xs"
                  >
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 dark:text-white truncate">
                        {ex.title} — {ex.vehicleName}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">{ex.plateNumber}</div>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded shrink-0 ml-2 ${
                        ex.isExpired
                          ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                          : 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
                      }`}
                    >
                      {ex.isExpired ? 'Expired' : `${ex.daysLeft}d left`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Content Split: Recent Bookings & Quota / Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Recent Bookings (2 Cols) */}
        <div className="lg:col-span-2 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Recent Reservations</h2>
            <Link
              href="/dashboard/bookings"
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 flex items-center gap-1 font-medium transition-colors"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loadingStats ? (
            <div className="py-12 text-center text-xs text-slate-500 dark:text-slate-400">
              Loading recent reservations...
            </div>
          ) : bookings.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500 dark:text-slate-400">
              No reservations recorded yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {bookings.slice(0, 5).map((b) => (
                <div
                  key={b.id}
                  className="py-3 flex items-center justify-between text-xs gap-3"
                >
                  <div className="min-w-0">
                    <div className="font-medium text-slate-900 dark:text-white truncate">
                      {b.customer?.fullName || 'Guest Customer'}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {b.vehicle?.brand} {b.vehicle?.model} ({b.vehicle?.plateNumber})
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <span className="font-mono text-slate-700 dark:text-slate-300 text-xs">
                      NPR {Number(b.totalAmount || 0).toLocaleString()}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                        b.status === 'ACTIVE'
                          ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                          : b.status === 'COMPLETED'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : b.status === 'CONFIRMED'
                          ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20'
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {b.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Quota & Organization Info (1 Col) */}
        <div className="space-y-6">
          {/* Quota Widget */}
          <div className="rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-900 dark:text-white">Fleet Quota</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                {plan?.name || 'Starter'}
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span>Vehicles</span>
                <span className="text-slate-800 dark:text-slate-200 font-mono">
                  {totalVehicles} / {maxVehicles}
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    quotaPercent > 80 ? 'bg-amber-500' : 'bg-indigo-600'
                  }`}
                  style={{ width: `${quotaPercent}%` }}
                />
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/dashboard/subscription"
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 font-medium block"
              >
                Manage Subscription →
              </Link>
            </div>
          </div>

          {/* Quick Business Contact */}
          <div className="rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 p-5 space-y-3 text-xs shadow-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-900 dark:text-white">Business Info</span>
              <Link
                href="/dashboard/settings"
                className="text-[11px] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                Edit
              </Link>
            </div>

            <div className="space-y-2 text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                <span className="truncate">{tenant?.email || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                <span>{tenant?.phone || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                <span className="truncate">{tenant?.address || 'Kathmandu, Nepal'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
