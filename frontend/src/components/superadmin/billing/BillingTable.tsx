import React from 'react';
import { Building2, Calendar } from 'lucide-react';
import { Badge } from '../../ui/Badge';

export interface PlatformPayment {
  id: string;
  amount: number;
  paymentMethod: 'ESEWA' | 'KHALTI' | 'FONEPAY' | 'CASH';
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
  transactionId?: string | null;
  createdAt: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    phone: string;
  };
  tenant?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  booking?: {
    id: string;
    vehicle: {
      plateNumber: string;
      brand: string;
      model: string;
    };
  } | null;
}

interface BillingTableProps {
  payments: PlatformPayment[];
}

export const BillingTable: React.FC<BillingTableProps> = ({ payments }) => {
  return (
    <div className="glass-panel overflow-hidden bg-white border border-slate-200/80 shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/80">
              <th className="py-4 px-6">Transaction / Payer</th>
              <th className="py-4 px-6">Tenant Organization</th>
              <th className="py-4 px-6">Amount</th>
              <th className="py-4 px-6">Payment Method</th>
              <th className="py-4 px-6">Status</th>
              <th className="py-4 px-6 text-right">Date & Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
            {payments.map((p) => (
              <tr
                key={p.id}
                className="hover:bg-slate-50/80 transition-colors"
              >
                <td className="py-4 px-6">
                  <div className="font-semibold text-slate-900">
                    {p.user.fullName}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    ID: {p.id.substring(0, 8)}... &bull; {p.user.email}
                  </div>
                </td>

                <td className="py-4 px-6">
                  {p.tenant ? (
                    <div className="flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                      <span className="font-medium text-slate-900">{p.tenant.name}</span>
                    </div>
                  ) : (
                    <span className="text-slate-400">Direct / Personal</span>
                  )}
                </td>

                <td className="py-4 px-6">
                  <span className="font-bold text-slate-900 text-sm font-['Outfit']">
                    NPR {p.amount.toLocaleString()}
                  </span>
                </td>

                <td className="py-4 px-6">
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-100 border border-slate-200 text-slate-700">
                    {p.paymentMethod}
                  </span>
                </td>

                <td className="py-4 px-6">
                  <Badge status={p.status} />
                </td>

                <td className="py-4 px-6 text-right text-slate-500">
                  <div className="flex items-center justify-end gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {new Date(p.createdAt).toLocaleString()}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
