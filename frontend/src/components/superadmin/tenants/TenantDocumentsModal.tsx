import React, { useState, useEffect } from 'react';
import {
  FileText,
  Upload,
  Trash2,
  ExternalLink,
  ShieldCheck,
  FileCheck,
  AlertCircle,
  Cloud,
  CheckCircle2,
} from 'lucide-react';
import { Modal } from '../../ui/Modal';
import { Tenant, TenantDocument } from '../../../types';
import { tenantService } from '../../../services/tenant.service';

interface TenantDocumentsModalProps {
  tenant: Tenant | null;
  isOpen: boolean;
  onClose: () => void;
}

const DOCUMENT_TYPES = [
  { value: 'BUSINESS_REGISTRATION', label: 'Company / Business Registration' },
  { value: 'PAN_VAT', label: 'PAN / VAT Certificate' },
  { value: 'OPERATING_LICENSE', label: 'Vehicle Rental Operating License' },
  { value: 'TAX_CLEARANCE', label: 'Tax Clearance Certificate' },
  { value: 'CONTRACT_AGREEMENT', label: 'Service Agreement / Contract' },
  { value: 'OTHER', label: 'Other Verification Document' },
];

export const TenantDocumentsModal: React.FC<TenantDocumentsModalProps> = ({
  tenant,
  isOpen,
  onClose,
}) => {
  const [documents, setDocuments] = useState<TenantDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [docType, setDocType] = useState('BUSINESS_REGISTRATION');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (tenant && isOpen) {
      loadDocuments();
      setError(null);
      setFeedback(null);
      setTitle('');
      setSelectedFile(null);
    }
  }, [tenant, isOpen]);

  const loadDocuments = async () => {
    if (!tenant) return;
    setLoading(true);
    try {
      const res: any = await tenantService.getTenantDocuments(tenant.id);
      const docs = Array.isArray(res) ? res : res?.data || [];
      setDocuments(docs);
    } catch (err: any) {
      setError('Failed to fetch tenant documents');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenant || !selectedFile) {
      setError('Please select a file to upload');
      return;
    }

    setUploading(true);
    setError(null);
    setFeedback(null);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('title', title.trim() || selectedFile.name);
    formData.append('type', docType);

    try {
      const res: any = await tenantService.uploadTenantDocument(tenant.id, formData);
      const newDoc = res?.data || res;
      setDocuments((prev) => [newDoc, ...prev]);
      setTitle('');
      setSelectedFile(null);
      setFeedback('Document uploaded and stored securely on Cloudinary!');
      // clear file input
      const fileInput = document.getElementById('tenant-file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (err: any) {
      setError(err.message || 'Failed to upload document to Cloudinary');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (docId: string) => {
    if (!tenant) return;
    setDeletingId(docId);
    setError(null);
    try {
      await tenantService.deleteTenantDocument(tenant.id, docId);
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
      setFeedback('Document removed successfully');
    } catch (err: any) {
      setError('Failed to delete document');
    } finally {
      setDeletingId(null);
    }
  };

  if (!tenant) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tenant Compliance Documents"
      subtitle={`Official registration and operating documents for ${tenant.name}`}
      icon={FileText}
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {/* Alerts */}
        {feedback && (
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{feedback}</span>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Upload Form Box */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5 text-indigo-600" /> Upload New Verification Document
            </h3>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
              <Cloud className="w-3 h-3 text-sky-500" /> Cloudinary Storage
            </span>
          </div>

          <form onSubmit={handleUpload} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="form-label">Document Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label className="form-label">Document Classification</label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="input-field"
                >
                  {DOCUMENT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="form-label">Select File (PDF or Image) *</label>
              <input
                id="tenant-file-upload"
                type="file"
                required
                accept=".pdf,.png,.jpg,.jpeg,.webp"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="block w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer border border-slate-200 rounded-lg p-1.5 bg-white"
              />
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={uploading || !selectedFile}
                className="btn-primary text-xs px-4 py-2 flex items-center gap-2"
              >
                {uploading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Uploading to Cloudinary...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Document</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Existing Documents List */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center justify-between">
            <span>Uploaded Verification Documents ({documents.length})</span>
            {loading && <span className="text-slate-400 font-normal">Loading...</span>}
          </h3>

          {documents.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl">
              <FileCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500">No documents uploaded yet for this organization.</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Upload Business Registration or PAN certificate above to verify compliance.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {documents.map((doc) => {
                const typeObj = DOCUMENT_TYPES.find((t) => t.value === doc.type);
                const isPdf = doc.fileType?.includes('pdf') || doc.fileUrl.endsWith('.pdf');

                return (
                  <div
                    key={doc.id}
                    className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-3 hover:border-indigo-300 transition-colors shadow-sm"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0 text-indigo-600">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-slate-900 truncate block">
                            {doc.title}
                          </span>
                          <span className="px-2 py-0.5 text-[10px] rounded-full bg-slate-100 font-medium text-slate-600 shrink-0">
                            {typeObj?.label || doc.type}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5">
                          <span>Uploaded: {new Date(doc.createdAt).toLocaleDateString()}</span>
                          {doc.fileSize && <span>{(doc.fileSize / 1024).toFixed(1)} KB</span>}
                          <span className="text-indigo-600 flex items-center gap-0.5">
                            <Cloud className="w-3 h-3" /> Cloudinary CDN
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                        title="Open document in new tab"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <button
                        type="button"
                        onClick={() => handleDelete(doc.id)}
                        disabled={deletingId === doc.id}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-50"
                        title="Delete document"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="pt-2 border-t border-slate-200 flex justify-end">
          <button type="button" onClick={onClose} className="btn-secondary text-xs px-5 py-2">
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};
