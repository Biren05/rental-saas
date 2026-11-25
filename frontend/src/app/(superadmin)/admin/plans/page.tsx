'use client';

import React, { useEffect, useState } from 'react';
import { subscriptionService } from '../../../../services';
import { SubscriptionPlan } from '../../../../types';
import { Layers, Plus, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';
import { PlanCard } from '../../../../components/superadmin/plans/PlanCard';
import { CreatePlanModal } from '../../../../components/superadmin/plans/CreatePlanModal';
import { EditPlanModal } from '../../../../components/superadmin/plans/EditPlanModal';

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const data = await subscriptionService.getAllPlans();
      setPlans(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load subscription plans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleCreatePlan = async (planData: {
    name: string;
    slug: string;
    description: string;
    price: number;
    billingCycle: 'MONTHLY' | 'YEARLY';
    maxVehicles: number;
    maxStaff: number;
    features: string[];
  }) => {
    setSubmitting(true);
    setError(null);

    try {
      const created = await subscriptionService.createPlan(planData);
      setPlans((prev) => [...prev, created]);
      setModalOpen(false);
      showFeedback('success', `Plan "${created.name}" created successfully!`);
    } catch (err: any) {
      setError(err.message || 'Failed to create subscription plan');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditPlan = async (
    id: string,
    planData: {
      name: string;
      slug: string;
      description?: string;
      price: number;
      billingCycle: 'MONTHLY' | 'YEARLY';
      maxVehicles: number;
      maxStaff: number;
      features: string[];
      isActive?: boolean;
    },
  ) => {
    setSubmitting(true);
    setError(null);

    try {
      const updated = await subscriptionService.updatePlan(id, planData);
      setPlans((prev) => prev.map((p) => (p.id === id ? { ...p, ...updated } : p)));
      setEditingPlan(null);
      showFeedback('success', `Plan "${updated.name}" updated successfully!`);
    } catch (err: any) {
      setError(err.message || 'Failed to update subscription plan');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePlan = async (plan: SubscriptionPlan) => {
    if (!window.confirm(`Are you sure you want to delete the plan "${plan.name}"?`)) {
      return;
    }

    try {
      await subscriptionService.deletePlan(plan.id);
      setPlans((prev) => prev.filter((p) => p.id !== plan.id));
      showFeedback('success', `Plan "${plan.name}" has been deleted.`);
    } catch (err: any) {
      showFeedback('error', err.message || 'Failed to delete plan. It may have active subscriptions.');
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-['Outfit']">
            Plans & <span className="text-indigo-600">Subscriptions</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Define pricing tiers, fleet quotas, and feature flags available to rental operators.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchPlans}
            className="btn-secondary text-xs px-3.5 py-2"
            title="Refresh Plans"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => setModalOpen(true)}
            className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5 shadow-sm shadow-indigo-600/20"
          >
            <Plus className="w-3.5 h-3.5" />
            New Pricing Tier
          </button>
        </div>
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div
          className={`p-3.5 rounded-xl border flex items-center gap-2.5 text-xs transition-all animate-in fade-in ${
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

      {/* Plans Grid Component */}
      {loading ? (
        <div className="text-center py-16 text-sm text-slate-500 flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <span>Loading subscription tiers...</span>
        </div>
      ) : plans.length === 0 ? (
        <div className="glass-panel p-12 text-center bg-white border border-slate-200">
          <Layers className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-900">No Subscription Plans Yet</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Create your first pricing tier to allow rental businesses to subscribe and scale their fleets.
          </p>
          <button onClick={() => setModalOpen(true)} className="btn-primary text-xs mt-4">
            <Plus className="w-3.5 h-3.5" /> Create Plan
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              onEdit={(p) => setEditingPlan(p)}
              onDelete={handleDeletePlan}
            />
          ))}
        </div>
      )}

      {/* Create Plan Modal Component */}
      <CreatePlanModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreatePlan}
        submitting={submitting}
      />

      {/* Edit Plan Modal Component */}
      <EditPlanModal
        plan={editingPlan}
        isOpen={!!editingPlan}
        onClose={() => setEditingPlan(null)}
        onSubmit={handleEditPlan}
        submitting={submitting}
      />
    </div>
  );
}
