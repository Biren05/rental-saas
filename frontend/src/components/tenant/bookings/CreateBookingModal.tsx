'use client';

import React, { useState } from 'react';
import { X, Calendar, AlertCircle } from 'lucide-react';
import { Vehicle } from '../../../types';
import { CreateBookingInput } from '../../../services/rental.service';

interface CreateBookingModalProps {
  vehicles: Vehicle[];
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateBookingInput) => Promise<void>;
}

export const CreateBookingModal: React.FC<CreateBookingModalProps> = ({
  vehicles,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<CreateBookingInput>({
    vehicleId: vehicles.length > 0 ? vehicles[0].id : '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    depositAmount: 2000,
    pickupLocation: 'Main Depot',
    returnLocation: 'Main Depot',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openDatePicker = (e: React.MouseEvent<HTMLInputElement>) => {
    try {
      if ('showPicker' in HTMLInputElement.prototype) {
        e.currentTarget.showPicker();
      }
    } catch {
      // Ignore user activation restriction
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.vehicleId) {
      setError('Please select a vehicle for this reservation.');
      return;
    }

    if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      setError('End date must be after start date.');
      return;
    }

    try {
      setLoading(true);
      await onSubmit({
        ...formData,
        depositAmount: Number(formData.depositAmount) || 0,
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to create booking.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />
      <div
        className="relative w-full max-w-lg bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-900 dark:text-slate-100 z-10 my-auto"
        style={{ backgroundColor: 'var(--bg-card, #ffffff)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Calendar className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white font-['Outfit']">Create New Reservation</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mx-5 mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-2.5 text-xs text-rose-600 dark:text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Select Vehicle <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={formData.vehicleId}
              onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            >
              {vehicles.length === 0 ? (
                <option value="">No vehicles available in fleet</option>
              ) : (
                vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.brand} {v.model} ({v.plateNumber}) - NPR {Number(v.dailyRate || 0).toLocaleString()}/day [{v.status}]
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Start Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                onClick={openDatePicker}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 cursor-pointer [color-scheme:light] dark:[color-scheme:dark] focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                End Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.endDate}
                min={formData.startDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                onClick={openDatePicker}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 cursor-pointer [color-scheme:light] dark:[color-scheme:dark] focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Pickup Location
              </label>
              <input
                type="text"
                value={formData.pickupLocation || ''}
                onChange={(e) => setFormData({ ...formData, pickupLocation: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Return Location
              </label>
              <input
                type="text"
                value={formData.returnLocation || ''}
                onChange={(e) => setFormData({ ...formData, returnLocation: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Deposit Amount (NPR)
            </label>
            <input
              type="number"
              min="0"
              step="1"
              value={formData.depositAmount}
              onChange={(e) => setFormData({ ...formData, depositAmount: parseFloat(e.target.value) || 0 })}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || vehicles.length === 0}
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md shadow-indigo-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Creating Reservation...</span>
                </>
              ) : (
                'Confirm Booking'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
