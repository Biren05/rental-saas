import React, { useState } from 'react';
import { AlertTriangle, Trash2, ShieldAlert } from 'lucide-react';
import { Modal } from '../../ui/Modal';
import { Tenant } from '../../../types';

interface DeleteTenantModalProps {
  tenant: Tenant | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id: string) => Promise<void>;
  submitting: boolean;
}

export const DeleteTenantModal: React.FC<DeleteTenantModalProps> = ({
  tenant,
  isOpen,
  onClose,
  onConfirm,
  submitting,
}) => {
  const [confirmationInput, setConfirmationInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!tenant) return null;

  const handleDelete = async () => {
    setError(null);
    try {
      await onConfirm(tenant.id);
      setConfirmationInput('');
    } catch (err: any) {
      setError(err.message || 'Failed to delete tenant');
    }
  };

  const isConfirmed = confirmationInput.trim().toLowerCase() === tenant.name.trim().toLowerCase();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Rental Tenant"
      subtitle="Permanent removal of rental organization and associated subscriptions"
      icon={ShieldAlert}
      maxWidth="md"
    >
      <div className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
            {error}
          </div>
        )}

        <div className="p-4 rounded-xl bg-rose-50/80 border border-rose-200/90 text-xs text-rose-800 space-y-2">
          <div className="flex items-center gap-2 font-semibold text-rose-900">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            Warning: Destructive Action
          </div>
          <p>
            You are about to permanently delete <strong>{tenant.name}</strong> (/{tenant.slug}).
          </p>
          <ul className="list-disc list-inside space-y-1 text-[11px] text-rose-700 pl-1">
            <li>Associated SaaS subscriptions and plan history will be terminated.</li>
            <li>All staff & manager memberships for this tenant will be revoked.</li>
            <li>Fleet vehicles will be detached and unassigned from this tenant.</li>
          </ul>
        </div>

        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 flex justify-between items-center">
          <div>
            <span className="font-semibold text-slate-800">Fleet Vehicles: </span>
            {tenant._count?.vehicles ?? 0}
          </div>
          <div>
            <span className="font-semibold text-slate-800">Staff Members: </span>
            {tenant._count?.members ?? 1}
          </div>
          <div>
            <span className="font-semibold text-slate-800">Bookings: </span>
            {tenant._count?.bookings ?? 0}
          </div>
        </div>

        <div>
          <label className="form-label">
            Type <strong className="text-slate-900 font-bold">{tenant.name}</strong> to confirm:
          </label>
          <input
            type="text"
            value={confirmationInput}
            onChange={(e) => setConfirmationInput(e.target.value)}
            className="input-field"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="btn-secondary text-xs px-4 py-2"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={submitting || !isConfirmed}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1.5 shadow-sm shadow-rose-600/30"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {submitting ? 'Deleting Tenant...' : 'Permanently Delete'}
          </button>
        </div>
      </div>
    </Modal>
  );
};
