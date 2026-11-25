import React from 'react';
import { Banknote, Clock, CreditCard, CheckCircle2 } from 'lucide-react';

interface BillingSummaryProps {
  totalSuccessRevenue: number;
  totalPendingVolume: number;
  totalTransactions: number;
}

export const BillingSummary: React.FC<BillingSummaryProps> = ({
  totalSuccessRevenue,
  totalPendingVolume,
  totalTransactions,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
      <div className="glass-panel p-6 bg-white border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Settled Revenue
          </span>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <Banknote className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-extrabold text-slate-900 font-['Outfit']">
          NPR {totalSuccessRevenue.toLocaleString()}
        </div>
        <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-600 font-medium">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Fully captured & verified</span>
        </div>
      </div>

      <div className="glass-panel p-6 bg-white border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Pending Volume
          </span>
          <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-extrabold text-slate-900 font-['Outfit']">
          NPR {totalPendingVolume.toLocaleString()}
        </div>
        <div className="flex items-center gap-1.5 mt-2 text-xs text-amber-600 font-medium">
          <span>Awaiting gateway confirmation</span>
        </div>
      </div>

      <div className="glass-panel p-6 bg-white border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Transactions
          </span>
          <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <CreditCard className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-extrabold text-slate-900 font-['Outfit']">
          {totalTransactions}
        </div>
        <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500">
          <span>eSewa, Khalti, Fonepay</span>
        </div>
      </div>
    </div>
  );
};
