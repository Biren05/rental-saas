import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { Modal } from '../../ui/Modal';

interface CreatePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (planData: {
    name: string;
    slug: string;
    description: string;
    price: number;
    billingCycle: 'MONTHLY' | 'YEARLY';
    maxVehicles: number;
    maxStaff: number;
    features: string[];
  }) => Promise<void>;
  submitting: boolean;
}

export const CreatePlanModal: React.FC<CreatePlanModalProps> = ({
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
  const [featuresInput, setFeaturesInput] = useState('Fleet Management, Rental Booking Engine, eSewa Payments');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const features = featuresInput
      .split(',')
      .map((f) => f.trim())
      .filter(Boolean);

    await onSubmit({
      name,
      slug: slug.toLowerCase().replace(/\s+/g, '-'),
      description,
      price: Number(price),
      billingCycle,
      maxVehicles: Number(maxVehicles),
      maxStaff: Number(maxStaff),
      features,
    });

    setName('');
    setSlug('');
    setDescription('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create SaaS Plan"
      subtitle="Configure new pricing tier for rental companies"
      icon={Sparkles}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Plan Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!slug) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '-'));
              }}
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
          <label className="form-label">
            Included Features
          </label>
          <textarea
            rows={3}
            value={featuresInput}
            onChange={(e) => setFeaturesInput(e.target.value)}
            className="input-field text-xs font-mono"
          />
          <p className="form-hint">Separate features with commas (e.g. GPS Tracking, Digital Bluebook, Inspection Checklist)</p>
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
            {submitting ? 'Creating...' : 'Save & Publish Plan'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
