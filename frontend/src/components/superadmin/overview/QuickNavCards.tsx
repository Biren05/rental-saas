import React from 'react';
import Link from 'next/link';
import { Building2, Layers, TrendingUp, ArrowUpRight } from 'lucide-react';

export const QuickNavCards: React.FC = () => {
  const cards = [
    {
      title: 'Manage Rental Tenants',
      description: 'Review registered rental companies, inspect active vehicle rosters, and manage account statuses.',
      href: '/admin/tenants',
      icon: Building2,
      color: 'indigo',
    },
    {
      title: 'SaaS Subscription Tiers',
      description: 'Configure vehicle quotas, monthly/yearly NPR rates, and feature permissions for rental companies.',
      href: '/admin/plans',
      icon: Layers,
      color: 'purple',
    },
    {
      title: 'Platform Analytics & Telemetry',
      description: 'Vehicle category distribution, registration growth trends, and platform metrics.',
      href: '/admin/analytics',
      icon: TrendingUp,
      color: 'emerald',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Link
            key={card.href}
            href={card.href}
            className="glass-panel glass-panel-hover p-6 group cursor-pointer block bg-white border border-slate-200/80 hover:border-indigo-200 hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <Icon className="w-5 h-5" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </div>
            <h3 className="font-semibold text-base text-slate-900 group-hover:text-indigo-600 transition-colors">
              {card.title}
            </h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              {card.description}
            </p>
          </Link>
        );
      })}
    </div>
  );
};
