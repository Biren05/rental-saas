'use client';

import React, { useState, useEffect } from 'react';
import { Tenant, TenantDocument } from '../../../types';
import {
  Mail,
  Phone,
  MapPin,
  Globe,
  X,
  FileText,
  CreditCard,
  User,
  Building2,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Receipt,
  Download,
  Eye,
  Calendar,
  ShieldCheck,
  Ban,
  Sparkles,
} from 'lucide-react';
import { Badge } from '../../ui/Badge';
import { tenantService } from '../../../services';

interface TenantInspectionModalProps {
  tenant: Tenant | null;
  onClose: () => void;
  onToggleStatus: (tenantId: string, currentStatus: string) => void;
  onEdit?: (tenant: Tenant) => void;
  onDelete?: (tenant: Tenant) => void;
  onManageDocuments?: (tenant: Tenant) => void;
  updatingId: string | null;
}

export const TenantInspectionModal: React.FC<TenantInspectionModalProps> = ({
  tenant,
  onClose,
  onToggleStatus,
  onEdit,
  onDelete,
  onManageDocuments,
  updatingId,
}) => {
  const [activeTenant, setActiveTenant] = useState<Tenant | null>(tenant);
  const [loadingFresh, setLoadingFresh] = useState(false);
  const [previewMediaUrl, setPreviewMediaUrl] = useState<string | null>(null);

  // Sync and fetch fresh tenant details including documents & payments
  useEffect(() => {
    if (tenant?.id) {
      setActiveTenant(tenant);
      setLoadingFresh(true);
      tenantService
        .getTenantById(tenant.id)
        .then((fresh) => {
          if (fresh) setActiveTenant(fresh);
        })
        .catch(() => {})
        .finally(() => setLoadingFresh(false));
    }
  }, [tenant]);

  if (!activeTenant) return null;

  // Extract primary owner
  const ownerUser = activeTenant.members?.find((m: any) => m.role === 'OWNER')?.user || activeTenant.members?.[0]?.user;
  const activeSub = activeTenant.subscriptions?.[0];
  const allDocs = activeTenant.documents || [];

  // Filter business docs and payment receipts
  const businessDocs = allDocs.filter((d) => d.type !== 'PAYMENT_RECEIPT');
  const paymentReceiptDocs = allDocs.filter((d) => d.type === 'PAYMENT_RECEIPT');
  const latestPayment = activeTenant.payments?.[0];

  const isPending = activeTenant.status === 'PENDING';
  const isSuspended = activeTenant.status === 'SUSPENDED';

  const isImageFile = (url: string) => {
    return /\.(jpg|jpeg|png|webp|gif|avif)(\?.*)?$/i.test(url) || url.includes('/image/upload/');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-3xl p-6 sm:p-7 shadow-2xl relative max-h-[92vh] overflow-y-auto bg-white dark:bg-[#0c1222] border border-slate-200 dark:border-white/10 rounded-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-lg font-bold text-white uppercase shadow-sm">
              {activeTenant.name.substring(0, 2)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg sm:text-xl text-slate-900 dark:text-white font-['Outfit']">
                  {activeTenant.name}
                </h3>
                <Badge status={activeTenant.status} />
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                <span>/{activeTenant.slug}</span>
                <span>&bull;</span>
                <span>ID: {activeTenant.id.substring(0, 8)}...</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PENDING APPROVAL ALERT BANNER */}
        {isPending && (
          <div className="mb-6 p-4 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-amber-800 dark:text-amber-200">
                  New Application Pending Review
                </div>
                <div className="text-[11px] text-amber-700 dark:text-amber-300">
                  Inspect the applicant&apos;s business documents and payment voucher below. Clicking approve will generate a temporary password and dispatch the activation email.
                </div>
              </div>
            </div>
            <button
              onClick={() => onToggleStatus(activeTenant.id, 'PENDING')}
              disabled={updatingId === activeTenant.id}
              className="px-4 py-2 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center justify-center gap-1.5 shrink-0 transition-all active:scale-95"
            >
              {updatingId === activeTenant.id ? (
                'Approving...'
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve & Send Mail</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* 2x2 Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Card 1: Company Profile */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 space-y-2 text-xs">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-indigo-500" />
              <span>Rental Company Profile</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <Mail className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span>{activeTenant.email || 'No company email provided'}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <Phone className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span>{activeTenant.phone || 'No phone provided'}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span>{activeTenant.address || 'Kathmandu, Nepal'}</span>
            </div>
            {activeTenant.domain && (
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <Globe className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span className="text-indigo-600 dark:text-indigo-400 font-mono">{activeTenant.domain}</span>
              </div>
            )}
          </div>

          {/* Card 2: Primary Owner Account */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 space-y-2 text-xs">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-purple-500" />
              <span>Primary Owner & Credentials</span>
            </div>
            {ownerUser ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Owner Name:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100">{ownerUser.fullName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Login Email:</span>
                  <span className="font-mono text-slate-800 dark:text-slate-100">{ownerUser.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Contact Phone:</span>
                  <span className="font-mono text-slate-800 dark:text-slate-100">{ownerUser.phone || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Password Status:</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                    First-Time Login Protected
                  </span>
                </div>
              </>
            ) : (
              <span className="text-slate-400">Owner record resolving...</span>
            )}
          </div>
        </div>

        {/* SECTION: SUBMITTED BUSINESS DOCUMENTS */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
              <FileText className="w-4 h-4" />
              <span>Submitted Business Documents ({businessDocs.length})</span>
            </div>
            {onManageDocuments && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onManageDocuments(activeTenant);
                }}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold flex items-center gap-1"
              >
                <span>Upload Additional</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            )}
          </div>

          {businessDocs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {businessDocs.map((doc) => {
                const isImg = isImageFile(doc.fileUrl);
                return (
                  <div
                    key={doc.id}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02] flex items-center justify-between gap-3 group hover:border-indigo-400 transition-all"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      {isImg ? (
                        <div
                          onClick={() => setPreviewMediaUrl(doc.fileUrl)}
                          className="w-12 h-12 rounded-lg bg-slate-200 dark:bg-slate-800 overflow-hidden relative shrink-0 cursor-pointer border border-slate-300 dark:border-white/10"
                        >
                          <img
                            src={doc.fileUrl}
                            alt={doc.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 flex items-center justify-center shrink-0">
                          <FileText className="w-6 h-6" />
                        </div>
                      )}
                      <div className="text-xs truncate">
                        <div className="font-bold text-slate-800 dark:text-slate-100 truncate">
                          {doc.title || 'Registration Document'}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          Type: <span className="font-mono text-indigo-600">{doc.type}</span> &bull;{' '}
                          {new Date(doc.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-white dark:hover:bg-slate-800 border border-slate-200 dark:border-white/10 transition-colors shrink-0"
                      title="View full document"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-white/10 text-center text-xs text-slate-400">
              No business registration documents submitted with application.
            </div>
          )}
        </div>

        {/* SECTION: PAYMENT AUDIT & RECEIPT */}
        <div className="mb-6 p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02]">
          <div className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-1.5 mb-3">
            <Receipt className="w-4 h-4" />
            <span>Subscription Payment & Receipt Audit</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Payment Meta */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Plan Tier:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {activeSub?.plan?.name || 'Starter Plan'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Amount:</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                  {activeSub?.plan?.price ? `NPR ${activeSub.plan.price.toLocaleString()}` : 'NPR 0 (Trial)'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Payment Method:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {latestPayment?.paymentMethod || 'CASH / TRIAL'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Transaction ID:</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">
                  {latestPayment?.transactionId || 'None Provided'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Payment Status:</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  {latestPayment?.status || 'PENDING'}
                </span>
              </div>
              {latestPayment?.note && (
                <div className="pt-2 border-t border-slate-200 dark:border-white/5 text-[11px] text-slate-500">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Note: </span>
                  {latestPayment.note}
                </div>
              )}
            </div>

            {/* Payment Receipt Image / Voucher Preview */}
            <div className="border border-slate-200 dark:border-white/10 rounded-xl p-3 bg-white dark:bg-[#11192e] flex flex-col justify-between">
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-2">
                Attached Payment Voucher Screenshot
              </span>

              {paymentReceiptDocs.length > 0 ? (
                paymentReceiptDocs.map((rec) => {
                  const isImg = isImageFile(rec.fileUrl);
                  return (
                    <div key={rec.id} className="space-y-2">
                      {isImg ? (
                        <div
                          onClick={() => setPreviewMediaUrl(rec.fileUrl)}
                          className="w-full h-32 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden cursor-pointer relative border border-slate-200 dark:border-white/10 group"
                        >
                          <img
                            src={rec.fileUrl}
                            alt="Payment Receipt"
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-semibold gap-1 transition-opacity">
                            <Eye className="w-4 h-4" /> Click to Expand
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 rounded-lg bg-purple-50 text-purple-700 flex items-center gap-2 text-xs">
                          <Receipt className="w-5 h-5 shrink-0" />
                          <span className="truncate">{rec.title}</span>
                        </div>
                      )}
                      <div className="flex justify-end">
                        <a
                          href={rec.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-semibold text-purple-600 hover:underline flex items-center gap-1"
                        >
                          <span>Open Full Receipt</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-4 text-xs text-slate-400">
                  <Receipt className="w-6 h-6 mb-1 opacity-40" />
                  <span>No payment receipt uploaded</span>
                  <span className="text-[10px] text-slate-400">(Free trial or cash on counter)</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Metric Counters */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="p-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-center">
            <div className="text-2xl font-bold text-slate-900 dark:text-white font-['Outfit']">
              {activeTenant._count?.vehicles ?? 0}
            </div>
            <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">Fleet Vehicles</div>
          </div>
          <div className="p-3 rounded-xl bg-purple-50/60 dark:bg-purple-500/10 border border-purple-100 dark:border-purple-500/20 text-center">
            <div className="text-2xl font-bold text-slate-900 dark:text-white font-['Outfit']">
              {activeTenant._count?.members ?? 1}
            </div>
            <div className="text-[11px] text-purple-600 dark:text-purple-400 font-medium">Staff & Drivers</div>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 text-center">
            <div className="text-2xl font-bold text-slate-900 dark:text-white font-['Outfit']">
              {activeTenant._count?.bookings ?? 0}
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Total Bookings</div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-slate-200 dark:border-white/10 gap-3">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Registered on {new Date(activeTenant.createdAt).toLocaleDateString()}
          </span>

          <div className="flex flex-wrap items-center gap-2">
            {onEdit && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(activeTenant);
                }}
                className="btn-secondary text-xs px-3 py-2"
              >
                Edit
              </button>
            )}

            {onDelete && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onDelete(activeTenant);
                }}
                className="text-xs px-3 py-2 rounded-lg font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
              >
                Delete
              </button>
            )}

            {/* Toggle Status / Approve */}
            {isPending ? (
              <button
                onClick={() => onToggleStatus(activeTenant.id, 'PENDING')}
                disabled={updatingId === activeTenant.id}
                className="text-xs px-4 py-2 rounded-lg font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5 active:scale-95"
              >
                {updatingId === activeTenant.id ? (
                  'Approving...'
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    <span>Approve & Send Credentials</span>
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={() => onToggleStatus(activeTenant.id, activeTenant.status)}
                disabled={updatingId === activeTenant.id}
                className={`text-xs px-4 py-2 rounded-lg font-medium transition-all ${
                  isSuspended
                    ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                    : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                }`}
              >
                {updatingId === activeTenant.id
                  ? 'Updating...'
                  : isSuspended
                  ? 'Reactivate Company'
                  : 'Suspend Company'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox / Media Viewer Overlay */}
      {previewMediaUrl && (
        <div
          className="fixed inset-0 z-60 bg-black/85 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setPreviewMediaUrl(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] bg-transparent">
            <button
              onClick={() => setPreviewMediaUrl(null)}
              className="absolute -top-10 right-0 text-white hover:text-rose-400 p-2 text-sm flex items-center gap-1 font-bold"
            >
              <X className="w-5 h-5" /> Close Preview
            </button>
            <img
              src={previewMediaUrl}
              alt="Media Preview"
              className="max-h-[85vh] max-w-full rounded-xl object-contain shadow-2xl border border-white/20"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
};
