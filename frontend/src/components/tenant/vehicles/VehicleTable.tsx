'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Vehicle, VehicleStatus } from '../../../types';
import { Car, Search, Edit2, Trash2, QrCode, Radio, Lock } from 'lucide-react';

interface VehicleTableProps {
  vehicles: Vehicle[];
  loading: boolean;
  onEdit: (vehicle: Vehicle) => void;
  onDelete: (vehicle: Vehicle) => void;
  onViewQr?: (vehicle: Vehicle) => void;
}

const statusBadges: Record<VehicleStatus, { label: string; style: string }> = {
  AVAILABLE: {
    label: 'Available',
    style: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20',
  },
  RENTED: {
    label: 'Rented',
    style: 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20',
  },
  MAINTENANCE: {
    label: 'Maintenance',
    style: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20',
  },
  RESERVED: {
    label: 'Reserved',
    style: 'bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-500/20',
  },
};

const VehicleThumbnail: React.FC<{ src?: string | null; alt: string }> = ({ src, alt }) => {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
        <Car className="w-4 h-4" />
      </div>
    );
  }

  return (
    <div className="w-10 h-8 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shrink-0">
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        onError={() => setHasError(true)}
      />
    </div>
  );
};

export const VehicleTable: React.FC<VehicleTableProps> = ({
  vehicles,
  loading,
  onEdit,
  onDelete,
  onViewQr,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filteredVehicles = vehicles.filter((v) => {
    const matchesSearch =
      v.brand?.toLowerCase().includes(search.toLowerCase()) ||
      v.model?.toLowerCase().includes(search.toLowerCase()) ||
      v.plateNumber?.toLowerCase().includes(search.toLowerCase()) ||
      v.vehicleType?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || v.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500 shadow-xs"
            placeholder="Search brand, model, plate..."
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter by Status"
            className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-indigo-500 shadow-xs"
          >
            <option value="ALL">All Statuses</option>
            <option value="AVAILABLE">Available</option>
            <option value="RENTED">Rented</option>
            <option value="MAINTENANCE">Maintenance</option>
            <option value="RESERVED">Reserved</option>
          </select>
        </div>
      </div>

      {/* Clean Table Container */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-[#111827] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 text-[11px] font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Vehicle</th>
                <th className="py-3 px-4">Plate & Category</th>
                <th className="py-3 px-4">Daily Rate</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">IoT / Live GPS</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400 dark:text-slate-500">
                    Loading vehicles...
                  </td>
                </tr>
              ) : filteredVehicles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400 dark:text-slate-500">
                    No vehicles found.
                  </td>
                </tr>
              ) : (
                filteredVehicles.map((vehicle) => {
                  const badge = statusBadges[vehicle.status] || {
                    label: vehicle.status,
                    style: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700',
                  };

                  return (
                    <tr key={vehicle.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      {/* Brand & Model */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <VehicleThumbnail src={vehicle.imageUrl} alt={`${vehicle.brand} ${vehicle.model}`} />
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-white">
                              {vehicle.brand} {vehicle.model}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400">{vehicle.color || 'Standard'}</div>
                          </div>
                        </div>
                      </td>

                      {/* Plate & Type */}
                      <td className="py-3 px-4">
                        <div className="font-mono text-slate-800 dark:text-slate-200">{vehicle.plateNumber}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          {vehicle.vehicleType || 'Standard'}
                        </div>
                      </td>

                      {/* Rate */}
                      <td className="py-3 px-4 font-mono text-emerald-600 dark:text-emerald-400 font-medium">
                        NPR {vehicle.dailyRate ? Number(vehicle.dailyRate).toLocaleString() : '0'}/day
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium border ${badge.style}`}
                        >
                          {badge.label}
                        </span>
                      </td>

                      {/* IoT / Live GPS */}
                      <td className="py-3 px-4">
                        {vehicle.iotDevice ? (
                          <Link
                            href="/dashboard/tracking"
                            className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold border transition-colors hover:shadow-xs"
                          >
                            {vehicle.iotDevice.isEngineLocked ? (
                              <span className="flex items-center gap-1 text-rose-600">
                                <Lock className="w-3 h-3" /> Cutoff
                              </span>
                            ) : (vehicle.iotDevice.lastSpeed || 0) > 0 ? (
                              <span className="flex items-center gap-1 text-emerald-600">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                {vehicle.iotDevice.lastSpeed} km/h
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                                <Radio className="w-3 h-3 text-indigo-500" />
                                Standby
                              </span>
                            )}
                          </Link>
                        ) : (
                          <Link
                            href="/dashboard/tracking"
                            className="text-[11px] text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium inline-flex items-center gap-1"
                          >
                            <span>+ Pair GPS</span>
                          </Link>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {vehicle.qrCodeUrl && (
                            <button
                              type="button"
                              onClick={() => onViewQr?.(vehicle)}
                              className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                              title="View QR Code"
                            >
                              <QrCode className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => onEdit(vehicle)}
                            className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDelete(vehicle)}
                            className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
