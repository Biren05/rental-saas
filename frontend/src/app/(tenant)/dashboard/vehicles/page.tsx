'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useTenant } from '@/context/TenantContext';
import { vehicleService, CreateVehicleInput, UpdateVehicleInput } from '@/services/vehicle.service';
import { Vehicle } from '@/types';
import { VehicleTable } from '@/components/tenant/vehicles/VehicleTable';
import { CreateVehicleModal } from '@/components/tenant/vehicles/CreateVehicleModal';
import { EditVehicleModal } from '@/components/tenant/vehicles/EditVehicleModal';
import { VehicleQrModal } from '@/components/tenant/vehicles/VehicleQrModal';
import { Plus, AlertCircle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function TenantVehiclesPage() {
  const { tenant, tenantId, refreshTenant } = useTenant();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [qrVehicle, setQrVehicle] = useState<Vehicle | null>(null);

  // Notifications
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  const fetchVehicles = useCallback(async () => {
    if (!tenantId) return;
    try {
      setLoading(true);
      const res: any = await vehicleService.getTenantVehicles(tenantId);
      const list = res?.data || (Array.isArray(res) ? res : []);
      setVehicles(list);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Failed to load fleet vehicles.' });
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const handleCreateVehicle = async (data: CreateVehicleInput) => {
    if (!tenantId) return;
    await vehicleService.createVehicle(data, tenantId);
    setFeedback({ type: 'success', message: `Vehicle ${data.brand} ${data.model} added.` });
    await fetchVehicles();
    await refreshTenant();
  };

  const handleUpdateVehicle = async (id: string, data: UpdateVehicleInput) => {
    await vehicleService.updateVehicle(id, data);
    setFeedback({ type: 'success', message: 'Vehicle updated.' });
    await fetchVehicles();
  };

  const handleDeleteVehicle = async (vehicle: Vehicle) => {
    if (!confirm(`Are you sure you want to remove ${vehicle.brand} ${vehicle.model} (${vehicle.plateNumber})?`)) {
      return;
    }

    try {
      await vehicleService.deleteVehicle(vehicle.id);
      setFeedback({ type: 'success', message: `Vehicle ${vehicle.plateNumber} deleted.` });
      await fetchVehicles();
      await refreshTenant();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Failed to delete vehicle.' });
    }
  };

  const plan = tenant?.subscriptions?.[0]?.plan;
  const maxVehicles = plan?.maxVehicles || 10;
  const isAtLimit = vehicles.length >= maxVehicles;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Vehicles</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage your fleet inventory, rental status, and daily rates.
          </p>
        </div>

        <button
          type="button"
          disabled={isAtLimit}
          onClick={() => setIsCreateOpen(true)}
          className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0 shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Vehicle</span>
        </button>
      </div>

      {/* Quota Limit Warning */}
      {isAtLimit && (
        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-between text-xs text-amber-700 dark:text-amber-300 shadow-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>
              You have reached your limit of <strong>{maxVehicles} vehicles</strong> on your current plan.
            </span>
          </div>
          <Link
            href="/dashboard/subscription"
            className="text-amber-600 dark:text-amber-400 hover:underline font-medium ml-4 shrink-0"
          >
            Upgrade Plan
          </Link>
        </div>
      )}

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-3 rounded-lg border flex items-center justify-between text-xs shadow-xs ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/20 text-rose-700 dark:text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white text-xs ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* Vehicle Table */}
      <VehicleTable
        vehicles={vehicles}
        loading={loading}
        onEdit={(v) => setEditingVehicle(v)}
        onDelete={handleDeleteVehicle}
        onViewQr={(v) => setQrVehicle(v)}
      />

      {/* Modals */}
      <CreateVehicleModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateVehicle}
      />

      <EditVehicleModal
        vehicle={editingVehicle}
        isOpen={!!editingVehicle}
        onClose={() => setEditingVehicle(null)}
        onSubmit={handleUpdateVehicle}
      />

      <VehicleQrModal
        vehicle={qrVehicle}
        isOpen={!!qrVehicle}
        onClose={() => setQrVehicle(null)}
      />
    </div>
  );
}
