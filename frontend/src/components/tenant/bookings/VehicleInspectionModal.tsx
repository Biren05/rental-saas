'use client';

import React, { useState, useEffect } from 'react';
import { RentalBooking } from '@/types';
import { rentalService } from '@/services/rental.service';
import { tenantService } from '@/services/tenant.service';
import { X, Camera, CheckCircle2, Trash2, AlertCircle, Gauge, Fuel } from 'lucide-react';

interface VehicleInspectionModalProps {
  booking: RentalBooking | null;
  tenantId: string | null;
  onClose: () => void;
  onSaved: () => Promise<void>;
}

const FUEL_LEVELS = ['FULL', '3/4', '1/2', '1/4', 'EMPTY'];

export const VehicleInspectionModal: React.FC<VehicleInspectionModalProps> = ({
  booking,
  tenantId,
  onClose,
  onSaved,
}) => {
  const [stage, setStage] = useState<'PICKUP' | 'RETURN'>('PICKUP');
  const [odometerKm, setOdometerKm] = useState<string>('');
  const [fuelLevel, setFuelLevel] = useState<string>('FULL');
  const [notes, setNotes] = useState<string>('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [damageFee, setDamageFee] = useState<string>('0');
  const [uploading, setUploading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!booking) return;
    if (stage === 'PICKUP') {
      setOdometerKm(booking.pickupOdometerKm != null ? String(booking.pickupOdometerKm) : '');
      setFuelLevel(booking.pickupFuelLevel || 'FULL');
      setNotes(booking.pickupNotes || '');
      setPhotos(booking.pickupPhotos || []);
    } else {
      setOdometerKm(booking.returnOdometerKm != null ? String(booking.returnOdometerKm) : '');
      setFuelLevel(booking.returnFuelLevel || 'FULL');
      setNotes(booking.returnNotes || '');
      setPhotos(booking.returnPhotos || []);
      setDamageFee(String(booking.returnDamageFee || 0));
    }
    setError(null);
  }, [booking, stage]);

  if (!booking) return null;

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setError('Photo must be under 10MB.');
      return;
    }

    try {
      setUploading(true);
      setError(null);
      const res = await tenantService.uploadApplicantDocument(file);
      setPhotos((prev) => [...prev, res.fileUrl]);
    } catch (err: any) {
      setError(err?.message || 'Failed to upload inspection photo.');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId) return;

    try {
      setSaving(true);
      setError(null);
      await rentalService.saveBookingInspection(
        booking.id,
        {
          stage,
          odometerKm: odometerKm.trim() ? Number(odometerKm) : undefined,
          fuelLevel,
          notes: notes.trim() || undefined,
          photos,
          damageFee: stage === 'RETURN' ? Number(damageFee || 0) : undefined,
        },
        tenantId,
      );
      await onSaved();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save vehicle inspection.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-[#111827] rounded-2xl max-w-lg w-full max-h-[92vh] flex flex-col border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Vehicle Inspection Checklist
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {booking.vehicle?.brand} {booking.vehicle?.model} ({booking.vehicle?.plateNumber}) •{' '}
              {booking.customerName || booking.customer?.fullName}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Stage Switcher Tabs */}
        <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50/60 dark:bg-slate-900/30 border-b border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setStage('PICKUP')}
            className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
              stage === 'PICKUP'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                : 'bg-white dark:bg-[#0c111d] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}
          >
            <span>1. Pickup Handover</span>
            {booking.pickupInspectedAt && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />}
          </button>
          <button
            type="button"
            onClick={() => setStage('RETURN')}
            className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
              stage === 'RETURN'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                : 'bg-white dark:bg-[#0c111d] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}
          >
            <span>2. Return Check</span>
            {booking.returnInspectedAt && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />}
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-4 space-y-3.5 overflow-y-auto text-xs">
          {error && (
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
                <Gauge className="w-3.5 h-3.5 text-indigo-500" />
                <span>Odometer (KM)</span>
              </label>
              <input
                type="number"
                min="0"
                value={odometerKm}
                onChange={(e) => setOdometerKm(e.target.value)}
                placeholder="e.g. 14520"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0c111d] text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
                <Fuel className="w-3.5 h-3.5 text-indigo-500" />
                <span>Fuel Level</span>
              </label>
              <select
                value={fuelLevel}
                onChange={(e) => setFuelLevel(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0c111d] text-slate-900 dark:text-white"
              >
                {FUEL_LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {stage === 'RETURN' && (
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Damage / Fuel Difference Fee (NPR)
              </label>
              <input
                type="number"
                min="0"
                value={damageFee}
                onChange={(e) => setDamageFee(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50/30 dark:bg-amber-950/20 text-slate-900 dark:text-white font-mono font-bold"
              />
              <p className="text-[10px] text-slate-400 mt-0.5">
                Any fee entered here is automatically added to the booking total.
              </p>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Condition Notes (Scratches, Tire, Accessories)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Clean body, 2 helmets & bluebook copy handed over"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0c111d] text-slate-900 dark:text-white"
            />
          </div>

          {/* Inspection Photos */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                Inspection Photos ({photos.length})
              </label>
              <label className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 font-semibold cursor-pointer">
                <Camera className="w-3.5 h-3.5" />
                <span>{uploading ? 'Uploading...' : 'Add Photo'}</span>
                <input
                  type="file"
                  accept="image/*"
                  disabled={uploading}
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            </div>

            {photos.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {photos.map((url, idx) => (
                  <div
                    key={idx}
                    className="relative rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 h-20 bg-slate-100 dark:bg-slate-800"
                  >
                    <img src={url} alt={`Inspection ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setPhotos((prev) => prev.filter((_, i) => i !== idx))}
                      className="absolute top-1 right-1 p-1 rounded bg-rose-500 text-white cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || uploading}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {saving ? 'Saving...' : `Save ${stage === 'PICKUP' ? 'Pickup' : 'Return'} Inspection`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
