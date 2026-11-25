'use client';

import React, { useState } from 'react';
import { useTenant } from '@/context/TenantContext';
import { useAuth } from '@/context/AuthContext';
import { tenantService } from '@/services/tenant.service';
import { StaffTable } from '@/components/tenant/staff/StaffTable';
import { AddStaffModal } from '@/components/tenant/staff/AddStaffModal';
import { TenantRole } from '@/types';
import { Plus, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function TenantStaffPage() {
  const { tenant, tenantId, refreshTenant } = useTenant();
  const { user } = useAuth();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  const handleAddMember = async (email: string, role: TenantRole) => {
    if (!tenantId) return;
    try {
      setLoading(true);
      await tenantService.addMember(tenantId, { email, role });
      setFeedback({
        type: 'success',
        message: `Member ${email} added as ${role}.`,
      });
      await refreshTenant();
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err?.message || 'Failed to add member.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (member: any) => {
    if (!tenantId) return;
    if (
      !confirm(
        `Are you sure you want to remove ${member.user?.fullName || member.user?.email}?`
      )
    ) {
      return;
    }

    try {
      setLoading(true);
      await tenantService.removeMember(tenantId, member.userId);
      setFeedback({
        type: 'success',
        message: `Member removed successfully.`,
      });
      await refreshTenant();
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err?.message || 'Failed to remove member.',
      });
    } finally {
      setLoading(false);
    }
  };

  const members = (tenant?.members as any[]) || [];
  const plan = tenant?.subscriptions?.[0]?.plan;
  const maxStaff = plan?.maxStaff || 5;
  const isAtLimit = members.length >= maxStaff;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight font-['Outfit']">
            Staff & Drivers
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage your operations team, frontdesk staff, and assigned fleet drivers.
          </p>
        </div>

        <button
          type="button"
          disabled={isAtLimit}
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0 shadow-sm shadow-indigo-600/20 hover:shadow-indigo-600/30"
        >
          <Plus className="w-4 h-4" />
          <span>Add Member</span>
        </button>
      </div>

      {/* Staff Quota Pill */}
      {isAtLimit && (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between text-xs text-amber-800 dark:text-amber-300 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>
              You have reached your staff limit of <strong>{maxStaff} members</strong> on your current plan.
            </span>
          </div>
          <Link
            href="/dashboard/subscription"
            className="text-amber-700 dark:text-amber-400 font-semibold hover:underline ml-4 shrink-0"
          >
            Upgrade Plan &rarr;
          </Link>
        </div>
      )}

      {/* Feedback Alert */}
      {feedback && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between text-xs shadow-2xs ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-800 dark:text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/20 text-rose-800 dark:text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            )}
            <span className="font-medium">{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white text-xs p-1 rounded hover:bg-slate-200/50 dark:hover:bg-slate-800"
          >
            ✕
          </button>
        </div>
      )}

      {/* Staff Table */}
      <StaffTable
        members={members}
        currentUserId={user?.id}
        loading={loading}
        onRemove={handleRemoveMember}
      />

      {/* Add Staff Modal */}
      <AddStaffModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddMember}
      />
    </div>
  );
}
