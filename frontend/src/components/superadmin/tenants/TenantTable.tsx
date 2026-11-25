import React from 'react';
import { Tenant } from '../../../types';
import { Car, Calendar, Eye, Edit3, Trash2, CheckCircle2, Ban, FileText } from 'lucide-react';
import { Badge } from '../../ui/Badge';

interface TenantTableProps {
  tenants: Tenant[];
  onInspect: (tenant: Tenant) => void;
  onEdit: (tenant: Tenant) => void;
  onDelete: (tenant: Tenant) => void;
  onManageDocuments?: (tenant: Tenant) => void;
  onToggleStatus: (tenantId: string, currentStatus: string) => void;
  updatingId: string | null;
}

export const TenantTable: React.FC<TenantTableProps> = ({
  tenants,
  onInspect,
  onEdit,
  onDelete,
  onManageDocuments,
  onToggleStatus,
  updatingId,
}) => {
  return (
    <div className="glass-panel overflow-hidden bg-white border border-slate-200/80 shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/80">
              <th className="py-4 px-6">Company / Slug</th>
              <th className="py-4 px-6">Status</th>
              <th className="py-4 px-6">Fleet Vehicles</th>
              <th className="py-4 px-6">Active Plan</th>
              <th className="py-4 px-6">Registered On</th>
              <th className="py-4 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
            {tenants.map((tenant) => {
              const activeSub = tenant.subscriptions?.[0];
              const isSuspended = tenant.status === 'SUSPENDED';

              return (
                <tr
                  key={tenant.id}
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                  onClick={() => onInspect(tenant)}
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-indigo-700 uppercase">
                        {tenant.name.substring(0, 2)}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 text-sm hover:text-indigo-600 transition-colors">
                          {tenant.name}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          /{tenant.slug}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-6">
                    <Badge status={tenant.status} />
                  </td>

                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <Car className="w-3.5 h-3.5 text-indigo-600" />
                      <span className="font-semibold text-slate-900">
                        {tenant._count?.vehicles ?? 0}
                      </span>
                      <span className="text-slate-500">vehicles</span>
                    </div>
                  </td>

                  <td className="py-4 px-6">
                    {activeSub ? (
                      <div>
                        <span className="font-medium text-indigo-600">
                          {activeSub.plan?.name}
                        </span>
                        <div className="text-[10px] text-slate-500">
                          Status: {activeSub.status}
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-400">No active plan</span>
                    )}
                  </td>

                  <td className="py-4 px-6 text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(tenant.createdAt).toLocaleDateString()}
                    </div>
                  </td>

                  <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Inspect details */}
                      <button
                        onClick={() => onInspect(tenant)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Edit tenant */}
                      <button
                        onClick={() => onEdit(tenant)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                        title="Edit Organization"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      {/* Manage Documents (Cloudinary) */}
                      {onManageDocuments && (
                        <button
                          onClick={() => onManageDocuments(tenant)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                          title="Manage Compliance Documents (Cloudinary)"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      )}

                      {/* Toggle Active / Suspended / Approve */}
                      {tenant.status === 'PENDING' ? (
                        <button
                          onClick={() => onToggleStatus(tenant.id, 'PENDING')}
                          disabled={updatingId === tenant.id}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                          title="Approve registration and dispatch welcome credentials email"
                        >
                          {updatingId === tenant.id ? (
                            'Approving...'
                          ) : (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                              <span>Approve & Mail</span>
                            </>
                          )}
                        </button>
                      ) : (
                        <button
                          onClick={() => onToggleStatus(tenant.id, tenant.status)}
                          disabled={updatingId === tenant.id}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                            isSuspended
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                          }`}
                          title={isSuspended ? 'Reactivate Tenant' : 'Suspend / Deactivate Tenant'}
                        >
                          {updatingId === tenant.id ? (
                            'Updating...'
                          ) : isSuspended ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Activate</span>
                            </>
                          ) : (
                            <>
                              <Ban className="w-3 h-3 text-rose-600" />
                              <span>Suspend</span>
                            </>
                          )}
                        </button>
                      )}

                      {/* Delete tenant */}
                      <button
                        onClick={() => onDelete(tenant)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete Tenant"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
