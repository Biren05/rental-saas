'use client';

import React, { useState, useEffect } from 'react';
import { X, Edit3, AlertCircle, Upload, Trash2, CheckCircle2 } from 'lucide-react';
import { Vehicle, VehicleStatus } from '../../../types';
import { UpdateVehicleInput, vehicleService } from '../../../services/vehicle.service';

interface EditVehicleModalProps {
  vehicle: Vehicle | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: string, data: UpdateVehicleInput) => Promise<void>;
}

export const EditVehicleModal: React.FC<EditVehicleModalProps> = ({
  vehicle,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<UpdateVehicleInput>({
    brand: '',
    model: '',
    plateNumber: '',
    color: '',
    dailyRate: 0,
    hourlyRate: 0,
    status: 'AVAILABLE' as VehicleStatus,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (vehicle) {
      setFormData({
        brand: vehicle.brand || '',
        model: vehicle.model || '',
        plateNumber: vehicle.plateNumber || '',
        color: vehicle.color || '',
        dailyRate: vehicle.dailyRate ? Number(vehicle.dailyRate) : 0,
        hourlyRate: vehicle.hourlyRate ? Number(vehicle.hourlyRate) : 0,
        status: vehicle.status,
      });
      setImageUrl(vehicle.imageUrl || null);
      setImagePreview(vehicle.imageUrl || null);
      setImageFile(null);
      setError(null);
    }
  }, [vehicle]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImageExt = /\.(jpg|jpeg|png|webp|avif|gif|svg)$/i.test(file.name);
    if (!file.type.startsWith('image/') && !isImageExt) {
      setError('Please upload a valid image file (JPG, PNG, WEBP, AVIF).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Image size exceeds 10MB limit.');
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setError(null);

    try {
      setUploadingImage(true);
      const res = await vehicleService.uploadVehicleImage(file);
      setImageUrl(res.imageUrl);
    } catch (err: any) {
      setError(err?.message || 'Failed to upload vehicle image.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setImageUrl(null);
  };

  if (!isOpen || !vehicle) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (uploadingImage) {
      setError('Please wait for the vehicle photo to finish uploading.');
      return;
    }

    try {
      setLoading(true);
      await onSubmit(vehicle.id, {
        ...formData,
        dailyRate: Number(formData.dailyRate) || 0,
        hourlyRate: formData.hourlyRate ? Number(formData.hourlyRate) : undefined,
        imageUrl: imageUrl || undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to update vehicle.');
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
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white font-['Outfit']">Edit Vehicle</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">{vehicle.plateNumber}</p>
            </div>
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
          {/* Vehicle Photo Upload */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
              <span>Vehicle Photo</span>
              {uploadingImage && (
                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium animate-pulse">
                  Uploading photo...
                </span>
              )}
            </label>

            {imagePreview ? (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-16 h-12 rounded-lg bg-slate-200 dark:bg-slate-800 overflow-hidden border border-slate-300 dark:border-slate-700 shrink-0">
                    <img
                      src={imagePreview}
                      alt="Vehicle Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="truncate">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {imageFile?.name || 'Current Photo'}
                      </span>
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        Attached
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      {imageFile ? `${(imageFile.size / 1024).toFixed(1)} KB` : 'Saved in cloud/storage'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors shrink-0"
                  title="Remove Image"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center p-3.5 border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 rounded-xl bg-slate-50/60 dark:bg-slate-900/60 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/20 transition-all cursor-pointer text-center group">
                <div className="w-7 h-7 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                  <Upload className="w-3.5 h-3.5" />
                </div>
                <p className="text-xs font-medium text-slate-700 dark:text-slate-200">
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold">Upload Vehicle Photo</span> (JPG, PNG, WEBP, AVIF)
                </p>
                <input
                  type="file"
                  accept="image/*,.avif,.webp,.png,.jpg,.jpeg"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Brand</label>
              <input
                type="text"
                required
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Model</label>
              <input
                type="text"
                required
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Plate Number
              </label>
              <input
                type="text"
                required
                value={formData.plateNumber}
                onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 font-mono uppercase focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Color</label>
              <input
                type="text"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Daily Rate (NPR)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.dailyRate}
                onChange={(e) => setFormData({ ...formData, dailyRate: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Hourly Rate (NPR)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.hourlyRate || ''}
                onChange={(e) => setFormData({ ...formData, hourlyRate: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as VehicleStatus })}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            >
              <option value="AVAILABLE">Available for Rent</option>
              <option value="RENTED">Currently Rented</option>
              <option value="MAINTENANCE">In Maintenance</option>
              <option value="RESERVED">Reserved</option>
            </select>
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
              disabled={loading}
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md shadow-indigo-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
