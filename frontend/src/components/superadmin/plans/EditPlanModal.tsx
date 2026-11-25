import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { Modal } from '../../ui/Modal';
import { SubscriptionPlan } from '../../../types';

interface EditPlanModalProps {
  plan: SubscriptionPlan | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: string, planData: {
    name: string;
    slug: string;
    description?: string;
    price: number;
    billingCycle: 'MONTHLY' | 'YEARLY';
    maxVehicles: number;
    maxStaff: number;
    features: string[];
    isActive?: boolean;
  }) => Promise<void>;
  submitting: boolean;
}

export const EditPlanModal: React.FC<EditPlanModalProps> = ({
  plan,
  isOpen,
  onClose,
  onSubmit,
  submitting,
}) => {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number>(1999);
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');
  const [maxVehicles, setMaxVehicles] = useState<number>(15);
  const [maxStaff, setMaxStaff] = useState<number>(5);
  const [featuresInput, setFeaturesInput] = useState('');
  const [isActive, setIsActive] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (plan) {
      setName(plan.name || '');
      setSlug(plan.slug || '');
      setDescription(plan.description || '');
      setPrice(plan.price || 0);
      setBillingCycle(plan.billingCycle || 'MONTHLY');
      setMaxVehicles(plan.maxVehicles || 5);
      setMaxStaff(plan.maxStaff || 2);
      setFeaturesInput(Array.isArray(plan.features) ? plan.features.join(', ') : '');
      setIsActive(plan.isActive !== false);
      setError(null);
    }
  }, [plan]);

  if (!plan) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const features = featuresInput
      .split(',')
      .map((f) => f.trim())
      .filter(Boolean);

    try {
      await onSubmit(plan.id, {
        name,
        slug: slug.toLowerCase().trim().replace(/[^a-z0-9-]+/g, '-'),
        description,
        price: Number(price),
        billingCycle,
        maxVehicles: Number(maxVehicles),
        maxStaff: Number(maxStaff),
        features,
        isActive,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to update plan');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit SaaS Plan"
      subtitle={`Configure pricing and quotas for ${plan.name}`}
      icon={Sparkles}
      maxWidth="lg"
    >
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Plan Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="form-label">Slug Identifier *</label>
            <input
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '-'))}
              className="input-field font-mono text-xs"
            />
          </div>
        </div>

        <div>
          <label className="form-label">Short Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input-field"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label className="form-label">Price (NPR) *</label>
            <input
              type="number"
              required
              min="0"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="input-field font-mono"
            />
          </div>
          <div>
            <label className="form-label">Billing Cycle</label>
            <select
              value={billingCycle}
              onChange={(e) => setBillingCycle(e.target.value as any)}
              className="input-field"
            >
              <option value="MONTHLY">Monthly</option>
              <option value="YEARLY">Yearly</option>
            </select>
          </div>
          <div>
            <label className="form-label">Max Vehicles *</label>
            <input
              type="number"
              required
              min="1"
              value={maxVehicles}
              onChange={(e) => setMaxVehicles(Number(e.target.value))}
              className="input-field font-mono"
            />
          </div>
          <div>
            <label className="form-label">Max Staff *</label>
            <input
              type="number"
              required
              min="1"
              value={maxStaff}
              onChange={(e) => setMaxStaff(Number(e.target.value))}
              className="input-field font-mono"
            />
          </div>
        </div>

        <div>
          <label className="form-label">Included Features</label>
          <textarea
            rows={3}
            value={featuresInput}
            onChange={(e) => setFeaturesInput(e.target.value)}
            className="input-field text-xs font-mono"
          />
          <p className="form-hint">Separate features with commas</p>
        </div>

        <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
          <input
            type="checkbox"
            id="isPlanActive"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
          />
          <label htmlFor="isPlanActive" className="text-xs font-medium text-slate-700 cursor-pointer">
            Plan is Active and available for subscription
          </label>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 mt-6">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="btn-secondary text-xs px-4 py-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || !name}
            className="btn-primary text-xs px-5 py-2 disabled:opacity-50"
          >
            {submitting ? 'Saving Changes...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
