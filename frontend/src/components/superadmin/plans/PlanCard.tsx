import React from 'react';
import { SubscriptionPlan } from '../../../types';
import { Car, Users, Check, Edit3, Trash2 } from 'lucide-react';
import { Badge } from '../../ui/Badge';

interface PlanCardProps {
  plan: SubscriptionPlan;
  onEdit?: (plan: SubscriptionPlan) => void;
  onDelete?: (plan: SubscriptionPlan) => void;
}

export const PlanCard: React.FC<PlanCardProps> = ({ plan, onEdit, onDelete }) => {
  const borderColor =
    plan.price === 0
      ? '#6366f1'
      : plan.price > 5000
      ? '#ec4899'
      : '#8b5cf6';

  return (
    <div
      className="glass-panel glass-panel-hover p-6 flex flex-col justify-between border-t-2 relative bg-white border-x border-b border-slate-200/80 shadow-xs"
      style={{ borderTopColor: borderColor }}
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-mono font-medium text-indigo-600 uppercase tracking-wider">
            {plan.slug}
          </span>
          <Badge status={plan.billingCycle} />
        </div>

        <h3 className="text-xl font-bold text-slate-900 font-['Outfit'] mb-1">
          {plan.name}
        </h3>
        <p className="text-xs text-slate-500 min-h-[36px] line-clamp-2 mb-6">
          {plan.description || 'Configured SaaS subscription tier'}
        </p>

        {/* Price Box */}
        <div className="mb-6 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-baseline gap-1.5">
            <span className="text-xs text-slate-500 font-medium">NPR</span>
            <span className="text-3xl font-extrabold text-slate-900 font-['Outfit']">
              {plan.price.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400">/ {plan.billingCycle.toLowerCase()}</span>
          </div>
        </div>

        {/* Quotas */}
        <div className="space-y-2.5 mb-6 text-xs text-slate-700">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Car className="w-3.5 h-3.5" />
            </div>
            <span>
              Up to <strong className="text-slate-900 font-semibold">{plan.maxVehicles}</strong> fleet vehicles
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
              <Users className="w-3.5 h-3.5" />
            </div>
            <span>
              Up to <strong className="text-slate-900 font-semibold">{plan.maxStaff}</strong> staff/managers
            </span>
          </div>
        </div>

        {/* Features */}
        <div className="pt-4 border-t border-slate-200 space-y-2 mb-6">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Included Features
          </div>
          {plan.features.map((feat, idx) => (
            <div key={idx} className="flex items-start gap-2 text-xs text-slate-600">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span>{feat}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span>Status:</span>
          <Badge status={plan.isActive !== false ? 'ACTIVE' : 'SUSPENDED'} />
        </div>
        <div className="flex items-center gap-1">
          {onEdit && (
            <button
              onClick={() => onEdit(plan)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
              title="Edit Pricing Tier"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(plan)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Delete Pricing Tier"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
