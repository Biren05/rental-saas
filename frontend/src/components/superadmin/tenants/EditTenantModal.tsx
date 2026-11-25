import React, { useState, useEffect } from 'react';
import { Building2 } from 'lucide-react';
import { Modal } from '../../ui/Modal';
import { Tenant } from '../../../types';
import { UpdateTenantInput } from '../../../services/tenant.service';

interface EditTenantModalProps {
  tenant: Tenant | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: string, updateData: UpdateTenantInput) => Promise<void>;
  submitting: boolean;
}

export const EditTenantModal: React.FC<EditTenantModalProps> = ({
  tenant,
  isOpen,
  onClose,
  onSubmit,
  submitting,
}) => {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [domain, setDomain] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [status, setStatus] = useState<'ACTIVE' | 'SUSPENDED' | 'PENDING'>('ACTIVE');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (tenant) {
      setName(tenant.name || '');
      setSlug(tenant.slug || '');
      setDomain(tenant.domain || '');
      setEmail(tenant.email || '');
      setPhone(tenant.phone || '');
      setAddress(tenant.address || '');
      setStatus((tenant.status as any) || 'ACTIVE');
      setError(null);
    }
  }, [tenant]);

  if (!tenant) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await onSubmit(tenant.id, {
        name,
        slug: slug.toLowerCase().trim().replace(/[^a-z0-9-]+/g, '-'),
        domain: domain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/+$/, '') || undefined,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
        status,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to update tenant details');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Rental Tenant"
      subtitle={`Update organizational settings for ${tenant.name}`}
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
              onChange={(e) => setName(e.target.value)}
              className="input-field"
            />
          </div>

          <div>
            <label className="form-label">
              Slug Identifier *
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
              Official Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
            />
          </div>

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
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

          <div>
            <label className="form-label">
              Custom Domain
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
            Operational Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="input-field"
          >
            <option value="ACTIVE">ACTIVE (Normal Operations)</option>
            <option value="SUSPENDED">SUSPENDED (Fleet & Booking access restricted)</option>
            <option value="PENDING">PENDING (Awaiting Review / Verification)</option>
          </select>
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
            {submitting ? 'Saving Changes...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
