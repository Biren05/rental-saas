'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useTenant } from '@/context/TenantContext';
import { tenantService } from '@/services/tenant.service';
import { TenantDocument } from '@/types';
import {
  FileText,
  Upload,
  Trash2,
  ExternalLink,
  Plus,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';

export default function TenantDocumentsPage() {
  const { tenantId, refreshTenant } = useTenant();
  const [documents, setDocuments] = useState<TenantDocument[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Upload modal state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('BUSINESS_REGISTRATION');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Global feedback
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  const fetchDocs = useCallback(async () => {
    if (!tenantId) return;
    try {
      setLoading(true);
      const res: any = await tenantService.getTenantDocuments(tenantId);
      const list = (res as any)?.data || (Array.isArray(res) ? res : []);
      setDocuments(list);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Failed to load documents.' });
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    if (!tenantId) return;
    if (!title.trim()) {
      setModalError('Please enter a document title.');
      return;
    }
    if (!file) {
      setModalError('Please select a file to upload.');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('type', type);
      formData.append('file', file);

      await tenantService.uploadTenantDocument(tenantId, formData);
      setFeedback({ type: 'success', message: 'Document uploaded to Cloudinary.' });
      setTitle('');
      setFile(null);
      setIsUploadOpen(false);
      await fetchDocs();
      await refreshTenant();
    } catch (err: any) {
      setModalError(err?.message || 'Failed to upload document.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (doc: TenantDocument) => {
    if (!tenantId) return;
    if (!confirm(`Are you sure you want to delete "${doc.title}"?`)) {
      return;
    }

    try {
      await tenantService.deleteTenantDocument(tenantId, doc.id);
      setFeedback({ type: 'success', message: `Document deleted.` });
      await fetchDocs();
      await refreshTenant();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Failed to delete document.' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Documents</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage your company compliance records and certificates stored on Cloudinary.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsUploadOpen(true)}
          className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium flex items-center gap-1.5 transition-colors shrink-0 shadow-xs"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload Document</span>
        </button>
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div
          className={`p-3 rounded-lg border flex items-center justify-between text-xs shadow-xs ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/20 text-rose-700 dark:text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white text-xs ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* Clean Documents Table */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-[#111827] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 text-[11px] font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Document Title</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Uploaded Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-slate-400 dark:text-slate-500">
                    Loading documents...
                  </td>
                </tr>
              ) : documents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-slate-400 dark:text-slate-500">
                    No documents on file.
                  </td>
                </tr>
              ) : (
                documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    {/* Title */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span className="font-medium text-slate-900 dark:text-white">{doc.title}</span>
                      </div>
                    </td>

                    {/* Classification */}
                    <td className="py-3 px-4">
                      <span className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2 py-0.5 rounded text-[10px] text-slate-700 dark:text-slate-300">
                        {doc.type}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 flex items-center gap-1 font-medium"
                        >
                          <span>View</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        <button
                          type="button"
                          onClick={() => handleDelete(doc)}
                          className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Document Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xl text-slate-900 dark:text-white">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Upload Document</h2>
              <button
                onClick={() => setIsUploadOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {modalError && (
              <div className="mx-4 mt-3 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 dark:text-rose-300">
                {modalError}
              </div>
            )}

            <form onSubmit={handleUpload} className="p-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Document Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Type <span className="text-rose-500">*</span>
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="BUSINESS_REGISTRATION">Business Registration</option>
                  <option value="TAX_CLEARANCE">Tax / PAN Clearance</option>
                  <option value="INSURANCE_POLICY">Fleet Insurance</option>
                  <option value="OPERATING_LICENSE">Transport Permit</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  File (PDF or Image) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="file"
                  required
                  accept=".pdf,image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setFile(e.target.files[0]);
                    }
                  }}
                  className="w-full text-xs text-slate-500 dark:text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:bg-slate-100 dark:file:bg-slate-800 file:text-slate-700 dark:file:text-slate-200 hover:file:bg-slate-200 dark:hover:file:bg-slate-700 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-xs transition-colors disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : 'Upload File'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
