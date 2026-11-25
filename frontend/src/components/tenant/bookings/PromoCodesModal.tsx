'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { rentalService, PromoCodeItem } from '@/services/rental.service';
import { X, Tag, Plus, Trash2, AlertCircle } from 'lucide-react';

interface PromoCodesModalProps {
  isOpen: boolean;
  tenantId: string | null;
  onClose: () => void;
}

export const PromoCodesModal: React.FC<PromoCodesModalProps> = ({
  isOpen,
  tenantId,
  onClose,
}) => {
  const [promos, setPromos] = useState<PromoCodeItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState('10');
  const [minDays, setMinDays] = useState('1');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPromos = useCallback(async () => {
    if (!tenantId || !isOpen) return;
    try {
      setLoading(true);
      const res = await rentalService.getTenantPromos(tenantId);
      const list = (res as any)?.data || (Array.isArray(res) ? res : []);
      setPromos(list);
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  }, [tenantId, isOpen]);

  useEffect(() => {
    loadPromos();
  }, [loadPromos]);

  if (!isOpen) return null;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId || !code.trim()) return;
    try {
      setSaving(true);
      setError(null);
      await rentalService.createTenantPromo(
        {
          code: code.trim().toUpperCase(),
          discountPercent: Number(discountPercent || 10),
          minDays: Number(minDays || 1),
        },
        tenantId,
      );
      setCode('');
      setDiscountPercent('10');
      setMinDays('1');
      await loadPromos();
    } catch (err: any) {
      setError(err?.message || 'Failed to create promo code.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!tenantId) return;
    await rentalService.deleteTenantPromo(id, tenantId);
    await loadPromos();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs">
      <div className="bg-white dark:bg-[#111827] rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Promo & Discount Codes
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-4 text-xs">
          {error && (
            <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Create Form */}
          <form onSubmit={handleCreate} className="grid grid-cols-12 gap-2 items-end">
            <div className="col-span-5">
              <label className="block text-[10px] font-semibold text-slate-500 mb-1">Code</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="DASHAIN10"
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0c111d] font-mono uppercase"
              />
            </div>
            <div className="col-span-3">
              <label className="block text-[10px] font-semibold text-slate-500 mb-1">% Off</label>
              <input
                type="number"
                min="1"
                max="90"
                required
                value={discountPercent}
                onChange={(e) => setDiscountPercent(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0c111d] font-mono"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-[10px] font-semibold text-slate-500 mb-1">Min Days</label>
              <input
                type="number"
                min="1"
                value={minDays}
                onChange={(e) => setMinDays(e.target.value)}
                className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0c111d] font-mono"
              />
            </div>
            <div className="col-span-2">
              <button
                type="submit"
                disabled={saving}
                className="w-full py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center justify-center cursor-pointer disabled:opacity-50"
                title="Add Promo"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* List */}
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {loading ? (
              <p className="text-center text-slate-400 py-4">Loading promo codes...</p>
            ) : promos.length === 0 ? (
              <p className="text-center text-slate-400 py-4">
                No promo codes yet. Create one above! (7+ days gets 10% & 30+ days gets 20% auto-discount.)
              </p>
            ) : (
              promos.map((p) => (
                <div
                  key={p.id}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 flex items-center justify-between"
                >
                  <div>
                    <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {p.code}
                    </span>
                    <span className="ml-2 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                      {p.discountPercent}% OFF
                    </span>
                    <div className="text-[10px] text-slate-400">
                      Min {p.minDays} day(s)
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(p.id)}
                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                    title="Delete Promo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
