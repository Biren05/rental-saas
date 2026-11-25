import React from 'react';
import { LucideIcon, TrendingUp } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  subtext?: string;
  trendText?: string;
  colorVariant?: 'indigo' | 'purple' | 'cyan' | 'emerald';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  icon: Icon,
  subtext,
  trendText,
  colorVariant = 'indigo',
}) => {
  const colorStyles = {
    indigo: 'bg-indigo-50 border-indigo-100 text-indigo-600',
    purple: 'bg-purple-50 border-purple-100 text-purple-600',
    cyan: 'bg-sky-50 border-sky-100 text-sky-600',
    emerald: 'bg-emerald-50 border-emerald-100 text-emerald-600',
  };

  return (
    <div className="glass-panel glass-panel-hover p-6 bg-white border border-slate-200/80">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {label}
        </span>
        <div
          className={`w-10 h-10 rounded-xl border flex items-center justify-center ${colorStyles[colorVariant]}`}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="text-3xl font-extrabold text-slate-900 font-['Outfit']">
        {value}
      </div>
      {trendText && (
        <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-600 font-medium">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>{trendText}</span>
        </div>
      )}
      {subtext && !trendText && (
        <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500">
          <span>{subtext}</span>
        </div>
      )}
    </div>
  );
};
