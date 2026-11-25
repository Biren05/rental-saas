'use client';

import React, { useEffect, useState } from 'react';
import { tenantService, subscriptionService } from '../../../../services';
import { Tenant, SubscriptionPlan } from '../../../../types';
import { Building2, AlertCircle, RefreshCw, Plus, CheckCircle2, Copy, Check } from 'lucide-react';
import { SearchInput } from '../../../../components/ui/SearchInput';
import { Modal } from '../../../../components/ui/Modal';
import { TenantTable } from '../../../../components/superadmin/tenants/TenantTable';
import { TenantInspectionModal } from '../../../../components/superadmin/tenants/TenantInspectionModal';
import { CreateTenantModal } from '../../../../components/superadmin/tenants/CreateTenantModal';
import { EditTenantModal } from '../../../../components/superadmin/tenants/EditTenantModal';
import { DeleteTenantModal } from '../../../../components/superadmin/tenants/DeleteTenantModal';
import { TenantDocumentsModal } from '../../../../components/superadmin/tenants/TenantDocumentsModal';
import { CreateTenantInput, UpdateTenantInput } from '../../../../services/tenant.service';

export default function AdminTenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [deletingTenant, setDeletingTenant] = useState<Tenant | null>(null);
  const [documentsTenant, setDocumentsTenant] = useState<Tenant | null>(null);
  const [createdCredentials, setCreatedCredentials] = useState<{
    tenantName: string;
    email: string;
    temporaryPassword: string;
    ownerName?: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  const fetchTenantsAndPlans = async () => {
    setLoading(true);
    setError(null);
    try {
      const [tenantsData, plansData] = await Promise.all([
        tenantService.getAllTenants(),
        subscriptionService.getAllPlans(),
      ]);
      setTenants(tenantsData || []);
      setPlans(plansData || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load rental tenants');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenantsAndPlans();
  }, []);

  const handleCreateTenant = async (data: CreateTenantInput) => {
    setSubmitting(true);
    try {
      const created = await tenantService.createTenant(data);
      setTenants((prev) => [created, ...prev]);
      setIsCreateOpen(false);
      showFeedback('success', `Tenant "${created.name}" registered successfully!`);

      if (created.temporaryCredentials) {
        setCreatedCredentials({
          tenantName: created.name,
          email: created.temporaryCredentials.email,
          temporaryPassword: created.temporaryCredentials.temporaryPassword,
          ownerName: created.temporaryCredentials.ownerName,
        });
      }
    } catch (err: any) {
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditTenant = async (id: string, data: UpdateTenantInput) => {
    setSubmitting(true);
    try {
      const updated = await tenantService.updateTenant(id, data);
      setTenants((prev) => prev.map((t) => (t.id === id ? { ...t, ...updated } : t)));
      setEditingTenant(null);
      if (selectedTenant?.id === id) {
        setSelectedTenant((prev) => (prev ? { ...prev, ...updated } : null));
      }
      showFeedback('success', `Tenant "${updated.name}" updated successfully!`);
    } catch (err: any) {
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTenant = async (id: string) => {
    setSubmitting(true);
    try {
      const tenantName = deletingTenant?.name || 'Tenant';
      await tenantService.deleteTenant(id);
      setTenants((prev) => prev.filter((t) => t.id !== id));
      setDeletingTenant(null);
      if (selectedTenant?.id === id) {
        setSelectedTenant(null);
      }
      showFeedback('success', `Organization "${tenantName}" has been deleted.`);
    } catch (err: any) {
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  const toggleTenantStatus = async (tenantId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    setUpdatingId(tenantId);
    try {
      const updated = await tenantService.updateTenantStatus(tenantId, newStatus as any);
      setTenants((prev) =>
        prev.map((t) => (t.id === tenantId ? { ...t, status: newStatus as any } : t)),
      );
      if (selectedTenant && selectedTenant.id === tenantId) {
        setSelectedTenant((prev) => (prev ? { ...prev, status: newStatus as any } : null));
      }
      showFeedback(
        'success',
        currentStatus === 'PENDING'
          ? `Tenant "${updated.name}" approved! Welcome email with temporary password dispatched.`
          : `Tenant status set to ${newStatus === 'ACTIVE' ? 'Active' : 'Suspended'}.`,
      );

      if (updated.temporaryCredentials) {
        setCreatedCredentials({
          tenantName: updated.name,
          email: updated.temporaryCredentials.email,
          temporaryPassword: updated.temporaryCredentials.temporaryPassword,
          ownerName: updated.temporaryCredentials.ownerName,
        });
      }
    } catch (err: any) {
      showFeedback('error', err.message || 'Failed to update tenant status');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredTenants = tenants.filter((tenant) => {
    const matchesSearch =
      tenant.name.toLowerCase().includes(search.toLowerCase()) ||
      tenant.slug.toLowerCase().includes(search.toLowerCase()) ||
      (tenant.email && tenant.email.toLowerCase().includes(search.toLowerCase())) ||
      (tenant.phone && tenant.phone.toLowerCase().includes(search.toLowerCase()));

    const matchesFilter = filterStatus === 'ALL' || tenant.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-['Outfit']">
            Tenant <span className="text-indigo-600">Management</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Create, update, activate/deactivate, and manage registered vehicle rental businesses.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchTenantsAndPlans}
            className="btn-secondary text-xs px-3.5 py-2"
            title="Refresh Directory"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5 shadow-sm shadow-indigo-600/20"
          >
            <Plus className="w-3.5 h-3.5" />
            Register New Tenant
          </button>
        </div>
      </div>

      {/* Floating Feedback Notification */}
      {feedback && (
        <div
          className={`p-3.5 rounded-xl border flex items-center gap-2.5 text-xs transition-all animate-in fade-in slide-in-from-top-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-xs text-rose-700">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Controls: Search & Status Filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by company name, slug, phone or email..."
          className="flex-1 max-w-md"
        />

        <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-xs">
          {['ALL', 'ACTIVE', 'SUSPENDED', 'PENDING'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filterStatus === status
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-100 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Tenants Table */}
      {loading ? (
        <div className="text-center py-16 text-sm text-slate-500 flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <span>Loading rental companies...</span>
        </div>
      ) : filteredTenants.length === 0 ? (
        <div className="glass-panel p-12 text-center bg-white border border-slate-200">
          <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-900">No Rental Tenants Found</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            {search
              ? 'Try adjusting your search query or status filter.'
              : 'No rental companies have been registered on the SaaS platform yet.'}
          </p>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="btn-primary text-xs px-4 py-2 inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Register First Tenant
          </button>
        </div>
      ) : (
        <TenantTable
          tenants={filteredTenants}
          onInspect={setSelectedTenant}
          onEdit={setEditingTenant}
          onDelete={setDeletingTenant}
          onManageDocuments={setDocumentsTenant}
          onToggleStatus={toggleTenantStatus}
          updatingId={updatingId}
        />
      )}

      {/* 1. Create Tenant Modal */}
      <CreateTenantModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        plans={plans}
        onSubmit={handleCreateTenant}
        submitting={submitting}
      />

      {/* 2. Edit Tenant Modal */}
      <EditTenantModal
        tenant={editingTenant}
        isOpen={!!editingTenant}
        onClose={() => setEditingTenant(null)}
        onSubmit={handleEditTenant}
        submitting={submitting}
      />

      {/* 3. Delete Tenant Confirmation Modal */}
      <DeleteTenantModal
        tenant={deletingTenant}
        isOpen={!!deletingTenant}
        onClose={() => setDeletingTenant(null)}
        onConfirm={handleDeleteTenant}
        submitting={submitting}
      />

      {/* 4. Tenant Inspection Modal */}
      <TenantInspectionModal
        tenant={selectedTenant}
        onClose={() => setSelectedTenant(null)}
        onEdit={(t) => setEditingTenant(t)}
        onDelete={(t) => setDeletingTenant(t)}
        onManageDocuments={(t) => setDocumentsTenant(t)}
        onToggleStatus={toggleTenantStatus}
        updatingId={updatingId}
      />

      {/* 5. Client Generated Credentials Modal */}
      {createdCredentials && (
        <Modal
          isOpen={!!createdCredentials}
          onClose={() => {
            setCreatedCredentials(null);
            setCopied(false);
          }}
          title="Client Temporary Credentials"
          subtitle={`Onboarding access created for ${createdCredentials.tenantName}`}
          maxWidth="md"
        >
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-emerald-900">Welcome Email Dispatched!</p>
                <p className="mt-0.5 text-emerald-700">
                  Login instructions and the temporary password have been sent to the client. Upon their first login, they will be prompted to generate a permanent password.
                </p>
              </div>
            </div>

            <div className="bg-[#0b1120] text-slate-200 p-4 rounded-xl space-y-3 font-mono text-xs border border-slate-800 shadow-inner">
              <div>
                <span className="text-slate-400 block text-[11px] font-sans">Organization:</span>
                <span className="text-white font-semibold">{createdCredentials.tenantName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px] font-sans">Client Sign-in Email:</span>
                <span className="text-indigo-300 font-semibold">{createdCredentials.email}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px] font-sans">Temporary Password:</span>
                <div className="flex items-center justify-between mt-1 bg-black/40 px-3 py-2 rounded-lg border border-slate-700">
                  <span className="text-emerald-400 font-bold tracking-wider">{createdCredentials.temporaryPassword}</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(createdCredentials.temporaryPassword);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 3000);
                    }}
                    className="text-xs text-indigo-300 hover:text-white flex items-center gap-1.5 font-sans bg-indigo-500/20 hover:bg-indigo-500/30 px-2.5 py-1 rounded transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setCreatedCredentials(null);
                  setCopied(false);
                }}
                className="btn-primary text-xs px-5 py-2"
              >
                Understood & Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* 6. Tenant Documents Modal (Cloudinary) */}
      <TenantDocumentsModal
        tenant={documentsTenant}
        isOpen={!!documentsTenant}
        onClose={() => setDocumentsTenant(null)}
      />
    </div>
  );
}
