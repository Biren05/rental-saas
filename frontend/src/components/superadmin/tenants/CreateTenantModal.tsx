import React, { useState } from 'react';
import { Building2 } from 'lucide-react';
import { Modal } from '../../ui/Modal';
import { SubscriptionPlan } from '../../../types';
import { CreateTenantInput } from '../../../services/tenant.service';

interface CreateTenantModalProps {
  isOpen: boolean;
  onClose: () => void;
  plans: SubscriptionPlan[];
  onSubmit: (tenantData: CreateTenantInput) => Promise<void>;
  submitting: boolean;
}

export const CreateTenantModal: React.FC<CreateTenantModalProps> = ({
  isOpen,
  onClose,
  plans,
  onSubmit,
  submitting,
}) => {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [domain, setDomain] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [planId, setPlanId] = useState(plans[0]?.id || '');
  const [status, setStatus] = useState<'ACTIVE' | 'SUSPENDED' | 'PENDING'>('ACTIVE');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const formattedSlug = slug
      ? slug.toLowerCase().trim().replace(/[^a-z0-9-]+/g, '-')
      : name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');

    try {
      await onSubmit({
        name,
        slug: formattedSlug,
        ownerName: ownerName.trim() || undefined,
        domain: domain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/+$/, '') || undefined,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
        planId: planId || undefined,
        status,
      });

      // Reset form
      setName('');
      setSlug('');
      setOwnerName('');
      setDomain('');
      setEmail('');
      setPhone('');
      setAddress('');
      setStatus('ACTIVE');
    } catch (err: any) {
      setError(err.message || 'Failed to create tenant organization');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Register New Tenant"
      subtitle="Onboard a rental business or fleet enterprise to the SaaS platform"
      icon={Building2}
      maxWidth="xl"
    >
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="form-label">
              Company / Business Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!slug || slug === name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-')) {
                  setSlug(e.target.value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-'));
                }
              }}
              className="input-field"
            />
          </div>

          <div>
            <label className="form-label">
              Unique Slug Identifier *
            </label>
            <input
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="input-field font-mono text-xs"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="form-label">
              Owner / Contact Name
            </label>
            <input
              type="text"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              className="input-field"
            />
          </div>

          <div>
            <label className="form-label">
              Official Email Address *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
            />
            <p className="text-[11px] text-slate-500 mt-1">A temporary password will be generated & sent here.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="form-label">
              Phone Number
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="input-field"
            />
          </div>

          <div>
            <label className="form-label">
              Custom Subdomain / Domain
            </label>
            <input
              type="text"
              placeholder="e.g. agency1.com"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="input-field"
            />
          </div>
        </div>

        <div>
          <label className="form-label">
            Physical Address
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="input-field"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div>
            <label className="form-label">
              Initial Subscription Plan
            </label>
            <select
              value={planId}
              onChange={(e) => setPlanId(e.target.value)}
              className="input-field"
            >
              <option value="">-- Default Starter Plan --</option>
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (NPR {p.price}/{p.billingCycle.toLowerCase()}) - Up to {p.maxVehicles} vehicles
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label">
              Initial Tenant Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="input-field"
            >
              <option value="ACTIVE">ACTIVE (Operational immediately)</option>
              <option value="PENDING">PENDING (Awaiting KYC / Setup)</option>
              <option value="SUSPENDED">SUSPENDED (Restricted access)</option>
            </select>
          </div>
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
            className="btn-primary text-xs px-5 py-2 flex items-center gap-2"
          >
            {submitting ? 'Registering...' : 'Create Tenant'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
