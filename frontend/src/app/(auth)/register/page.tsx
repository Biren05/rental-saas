'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Car,
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  CreditCard,
  FileText,
  Upload,
  Trash2,
  Receipt,
  QrCode,
  Image as ImageIcon,
  Check,
} from 'lucide-react';
import { tenantService, subscriptionService } from '../../../services';
import { SubscriptionPlan } from '../../../types';

export default function RegisterAgencyPage() {
  const router = useRouter();

  // Basic Information
  const [name, setName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  // Plan & Payment Information
  const [planId, setPlanId] = useState<string>('');
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [paymentConfig, setPaymentConfig] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<'TRIAL' | 'ESEWA' | 'KHALTI' | 'FONEPAY' | 'CASH'>('TRIAL');
  const [transactionId, setTransactionId] = useState('');
  const [paymentNote, setPaymentNote] = useState('');

  // Document Uploads
  const [documentUrl, setDocumentUrl] = useState<string>('');
  const [documentName, setDocumentName] = useState<string>('');
  const [uploadingDoc, setUploadingDoc] = useState<boolean>(false);

  // Payment Receipt Upload
  const [paymentReceiptUrl, setPaymentReceiptUrl] = useState<string>('');
  const [paymentReceiptName, setPaymentReceiptName] = useState<string>('');
  const [uploadingReceipt, setUploadingReceipt] = useState<boolean>(false);

  // UI state
  const [loading, setLoading] = useState(false);
  const [fetchingPlans, setFetchingPlans] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submittedTenant, setSubmittedTenant] = useState<{
    name: string;
    email: string;
    ownerName: string;
    documentUrl?: string;
    paymentReceiptUrl?: string;
    transactionId?: string;
  } | null>(null);

  useEffect(() => {
    Promise.all([
      subscriptionService.getAllPlans(),
      subscriptionService.getPaymentConfig().catch(() => null),
    ])
      .then(([plansData, configData]) => {
        setPlans(plansData || []);
        if (configData) setPaymentConfig(configData);
        if (plansData && plansData.length > 0) {
          const trial = plansData.find((p) => p.price === 0) || plansData[0];
          setPlanId(trial.id);
        }
      })
      .catch(() => {})
      .finally(() => setFetchingPlans(false));
  }, []);

  const selectedPlan = plans.find((p) => p.id === planId);
  const isPaidPlan = selectedPlan && selectedPlan.price > 0;

  // Handle Business Document Upload (Registration/PAN)
  const handleDocFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 8MB)
    if (file.size > 8 * 1024 * 1024) {
      setError('Document file size must be less than 8MB.');
      return;
    }

    setUploadingDoc(true);
    setError(null);
    try {
      const res = await tenantService.uploadApplicantDocument(file);
      setDocumentUrl(res.fileUrl);
      setDocumentName(file.name);
    } catch (err: any) {
      setError(err.message || 'Failed to upload business document.');
    } finally {
      setUploadingDoc(false);
    }
  };

  // Handle Payment Receipt Upload (Screenshot / Voucher)
  const handleReceiptFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      setError('Receipt file size must be less than 8MB.');
      return;
    }

    setUploadingReceipt(true);
    setError(null);
    try {
      const res = await tenantService.uploadApplicantDocument(file);
      setPaymentReceiptUrl(res.fileUrl);
      setPaymentReceiptName(file.name);
    } catch (err: any) {
      setError(err.message || 'Failed to upload payment receipt.');
    } finally {
      setUploadingReceipt(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please provide your rental business name.');
      return;
    }
    if (!ownerName.trim()) {
      setError('Please provide the primary owner/manager full name.');
      return;
    }
    if (!ownerEmail.trim()) {
      setError('Please provide a valid official email to receive login credentials.');
      return;
    }
    if (!phone.trim()) {
      setError('Please provide a contact phone number.');
      return;
    }

    if (uploadingDoc || uploadingReceipt) {
      setError('Please wait for file uploads to complete before submitting.');
      return;
    }

    setLoading(true);
    try {
      const res = await tenantService.applyTenant({
        name: name.trim(),
        ownerName: ownerName.trim(),
        ownerEmail: ownerEmail.trim().toLowerCase(),
        email: ownerEmail.trim().toLowerCase(),
        phone: phone.trim(),
        address: address.trim() || undefined,
        planId: planId || undefined,
        status: 'PENDING',
        documentUrl: documentUrl || undefined,
        documentType: 'BUSINESS_REGISTRATION',
        paymentReceiptUrl: paymentReceiptUrl || undefined,
        paymentMethod: paymentMethod === 'TRIAL' ? 'CASH' : paymentMethod,
        transactionId: transactionId.trim() || undefined,
        paymentNote: paymentNote.trim() || undefined,
      });

      setSubmittedTenant({
        name: res.name || name,
        email: ownerEmail.trim().toLowerCase(),
        ownerName: ownerName.trim(),
        documentUrl,
        paymentReceiptUrl,
        transactionId,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to submit rental agency registration application.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070b14] text-slate-900 dark:text-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-indigo-500 selection:text-white">
      {/* Background glow blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-indigo-500/10 rounded-full blur-[140px]" />
      </div>

      <div className="relative z-10 max-w-2xl w-full mx-auto">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-4 group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              <Car className="w-6 h-6" />
            </div>
            <span className="font-extrabold text-2xl font-['Outfit'] tracking-tight">
              Auto<span className="text-indigo-600 dark:text-indigo-400">Rent</span>
            </span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black font-['Outfit'] tracking-tight text-slate-900 dark:text-white">
            Register Your Vehicle Rental Agency
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
            Apply to operate on Nepal’s multi-tenant fleet cloud. Fast review & instant activation by Superadmin.
          </p>
        </div>

        {/* Success View */}
        {submittedTenant ? (
          <div className="p-8 rounded-2xl bg-white dark:bg-[#0c1222] border border-slate-200 dark:border-white/10 shadow-xl text-center space-y-6 animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                Application Status: Pending Review
              </span>
              <h2 className="text-xl sm:text-2xl font-bold font-['Outfit'] text-slate-900 dark:text-white mt-3">
                Application Received for &quot;{submittedTenant.name}&quot;
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                Thank you, <strong>{submittedTenant.ownerName}</strong>! Your registration request and submitted documents have been received in the AutoRent Superadmin Console.
              </p>
            </div>

            {/* Submission Badges */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              {submittedTenant.documentUrl ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                  <Check className="w-3.5 h-3.5" /> Business Document Attached
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs text-slate-500 bg-slate-100 dark:bg-white/5">
                  No Document Uploaded
                </span>
              )}

              {submittedTenant.paymentReceiptUrl ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20">
                  <Check className="w-3.5 h-3.5" /> Payment Receipt Uploaded
                </span>
              ) : null}

              {submittedTenant.transactionId ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                  Ref: {submittedTenant.transactionId}
                </span>
              ) : null}
            </div>

            {/* Explanatory Step Box */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 text-left text-xs space-y-2.5 text-slate-600 dark:text-slate-300">
              <div className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                <span>What Happens Next?</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-4 h-4 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  1
                </div>
                <span>Superadmin inspects your business documents and payment receipt.</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-4 h-4 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  2
                </div>
                <span>
                  Upon activation, a <strong>Temporary Password</strong> is emailed to{' '}
                  <strong className="text-indigo-600 dark:text-indigo-400">{submittedTenant.email}</strong>.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-4 h-4 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  3
                </div>
                <span>
                  Log in with your temporary password, set your private permanent password, and start managing your fleet!
                </span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <Link
                href="/login"
                className="btn-primary text-xs py-3 w-full flex items-center justify-center gap-2"
              >
                <span>Go to Operator Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/"
                className="btn-secondary text-xs py-3 w-full flex items-center justify-center"
              >
                Back to Home
              </Link>
            </div>
          </div>
        ) : (
          /* Application Form Card */
          <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#0c1222] border border-slate-200 dark:border-white/10 shadow-xl space-y-6">
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* SECTION 1: Business Identity */}
              <div className="space-y-3.5">
                <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Rental Business Identity</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Agency / Business Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Himalayan Wheels Rental Pvt. Ltd."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-field dark:input-field-dark"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      City / Location <span className="text-slate-400 font-normal">(Nepal)</span>
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        placeholder="e.g. Thamel, Kathmandu"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="input-field dark:input-field-dark pl-9"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Business Phone <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        required
                        placeholder="+977-9812345678"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="input-field dark:input-field-dark pl-9"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: Owner / Admin Contact */}
              <div className="space-y-3.5 pt-2 border-t border-slate-100 dark:border-white/5">
                <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  <span>Primary Owner & Credentials Dispatch</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Owner / Manager Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bikash Gurung"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    className="input-field dark:input-field-dark"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Official Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      required
                      placeholder="owner@youragency.com"
                      value={ownerEmail}
                      onChange={(e) => setOwnerEmail(e.target.value)}
                      className="input-field dark:input-field-dark pl-9"
                    />
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
                    Important: Temporary login password will be emailed to this address upon Superadmin activation.
                  </span>
                </div>
              </div>

              {/* SECTION 3: Business Document Upload */}
              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-white/5">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Business Document (PAN / Registration Certificate)</span>
                  </div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Recommended</span>
                </div>

                {documentUrl ? (
                  <div className="p-3.5 rounded-xl border border-emerald-300 dark:border-emerald-500/30 bg-emerald-50/60 dark:bg-emerald-500/5 flex items-center justify-between">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0">
                        <Check className="w-4 h-4" />
                      </div>
                      <div className="text-xs truncate">
                        <div className="font-semibold text-slate-800 dark:text-slate-100 truncate">
                          {documentName || 'business_document.pdf'}
                        </div>
                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400">
                          Uploaded successfully
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setDocumentUrl('');
                        setDocumentName('');
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Remove file"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-slate-200 dark:border-white/10 hover:border-indigo-400 dark:hover:border-indigo-500/50 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-white/[0.01]">
                    <Upload className="w-6 h-6 text-indigo-500 mb-1" />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                      {uploadingDoc ? 'Uploading Document...' : 'Upload Business Registration / PAN Certificate'}
                    </span>
                    <span className="text-[11px] text-slate-400 mt-0.5">
                      JPG, PNG, WEBP, or PDF (Max 8MB)
                    </span>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleDocFileChange}
                      disabled={uploadingDoc}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* SECTION 4: SaaS Plan Selection */}
              <div className="space-y-3.5 pt-2 border-t border-slate-100 dark:border-white/5">
                <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>SaaS Subscription Plan</span>
                </div>

                {fetchingPlans ? (
                  <div className="text-xs text-slate-400 py-2">Loading SaaS plans...</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {plans.map((plan) => {
                      const isSelected = planId === plan.id;
                      return (
                        <div
                          key={plan.id}
                          onClick={() => {
                            setPlanId(plan.id);
                            if (plan.price === 0) {
                              setPaymentMethod('TRIAL');
                            } else if (paymentMethod === 'TRIAL') {
                              setPaymentMethod('ESEWA');
                            }
                          }}
                          className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                            isSelected
                              ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-500/10 dark:border-indigo-500'
                              : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                          }`}
                        >
                          <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between">
                            <span>{plan.name}</span>
                            {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                          </div>
                          <div className="text-sm font-black font-['Outfit'] text-indigo-600 dark:text-indigo-400 mt-1">
                            {plan.price === 0 ? 'FREE' : `NPR ${plan.price.toLocaleString()}`}
                          </div>
                          <div className="text-[10px] text-slate-500 mt-1">
                            Max {plan.maxVehicles} Vehicles
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* SECTION 5: Payment Preference & Receipt Upload */}
              <div className="space-y-3.5 pt-2 border-t border-slate-100 dark:border-white/5">
                <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                  <Receipt className="w-3.5 h-3.5" />
                  <span>Payment Method & Advance Receipt</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Payment Option
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e: any) => setPaymentMethod(e.target.value)}
                      className="input-field dark:input-field-dark text-xs"
                    >
                      <option value="TRIAL">14-Day Free Trial (No Advance Payment)</option>
                      <option value="ESEWA">eSewa Digital Wallet</option>
                      <option value="KHALTI">Khalti Digital Wallet</option>
                      <option value="FONEPAY">Fonepay Dynamic QR</option>
                      <option value="CASH">Bank Transfer / Cash Slip</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Transaction / Reference ID <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 9842109852 / ESEWA-123"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      className="input-field dark:input-field-dark text-xs font-mono"
                    />
                  </div>
                </div>

                {/* Nepal Payment Instruction Box if paying via digital wallet or bank */}
                {paymentMethod !== 'TRIAL' && (
                  <div className="p-4 rounded-xl bg-slate-100/70 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 text-xs space-y-3">
                    <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
                      <span>Official Payment Details & QR Code</span>
                      <span className="text-indigo-600 font-semibold font-mono">
                        {selectedPlan?.price ? `NPR ${selectedPlan.price.toLocaleString()}` : ''}
                      </span>
                    </div>

                    {/* QR Code and Account Details */}
                    <div className="flex flex-col sm:flex-row items-center gap-4 p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-white/5">
                      {paymentMethod === 'ESEWA' && paymentConfig?.esewa?.qrUrl ? (
                        <img
                          src={paymentConfig.esewa.qrUrl}
                          alt="eSewa QR"
                          className="w-32 h-32 object-contain rounded-lg border border-slate-100 shadow-xs shrink-0"
                        />
                      ) : paymentMethod === 'KHALTI' && paymentConfig?.khalti?.qrUrl ? (
                        <img
                          src={paymentConfig.khalti.qrUrl}
                          alt="Khalti QR"
                          className="w-32 h-32 object-contain rounded-lg border border-slate-100 shadow-xs shrink-0"
                        />
                      ) : paymentMethod === 'FONEPAY' && paymentConfig?.fonepay?.qrUrl ? (
                        <img
                          src={paymentConfig.fonepay.qrUrl}
                          alt="Fonepay QR"
                          className="w-32 h-32 object-contain rounded-lg border border-slate-100 shadow-xs shrink-0"
                        />
                      ) : paymentMethod === 'CASH' && paymentConfig?.bank?.qrUrl ? (
                        <img
                          src={paymentConfig.bank.qrUrl}
                          alt="Bank QR"
                          className="w-32 h-32 object-contain rounded-lg border border-slate-100 shadow-xs shrink-0"
                        />
                      ) : (
                        <div className="w-32 h-32 bg-slate-50 dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center p-2 text-center shrink-0">
                          <QrCode className="w-8 h-8 text-slate-400 mb-1" />
                          <span className="text-[10px] text-slate-600 dark:text-slate-300 font-semibold">
                            {paymentMethod} QR
                          </span>
                          <span className="text-[9px] text-slate-400 mt-0.5">Use Account ID</span>
                        </div>
                      )}

                      <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 flex-1 w-full">
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase font-medium">Gateway</span>
                          <span className="font-bold text-slate-900 dark:text-white">
                            {paymentMethod === 'ESEWA'
                              ? 'eSewa Digital Wallet'
                              : paymentMethod === 'KHALTI'
                              ? 'Khalti Digital Wallet'
                              : paymentMethod === 'FONEPAY'
                              ? 'Fonepay Merchant'
                              : 'Bank Transfer'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase font-medium">Receiving ID / Number</span>
                          <span className="font-mono font-bold text-slate-900 dark:text-white text-xs">
                            {paymentMethod === 'ESEWA'
                              ? paymentConfig?.esewa?.id || '9800000001'
                              : paymentMethod === 'KHALTI'
                              ? paymentConfig?.khalti?.id || '9800000001'
                              : paymentMethod === 'FONEPAY'
                              ? paymentConfig?.fonepay?.merchantCode || 'AUTORENT_SaaS'
                              : paymentConfig?.bank?.accountNumber || '01201017500001'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase font-medium">Account Name</span>
                          <span className="font-medium text-slate-800 dark:text-slate-200 text-xs">
                            {paymentMethod === 'ESEWA'
                              ? paymentConfig?.esewa?.accountName || 'AutoRent SaaS (eSewa)'
                              : paymentMethod === 'KHALTI'
                              ? paymentConfig?.khalti?.accountName || 'AutoRent SaaS (Khalti)'
                              : paymentMethod === 'FONEPAY'
                              ? paymentConfig?.fonepay?.accountName || 'AutoRent SaaS (Fonepay)'
                              : paymentConfig?.bank?.accountName || 'AutoRent Technologies Pvt. Ltd.'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-[10px] text-slate-500">
                      Scan the official QR code above or transfer the subscription fee to the receiving account. Attach the payment voucher below for rapid verification.
                    </p>
                  </div>
                )}

                {/* Payment Receipt Upload Box */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Upload Payment Receipt / Voucher Screenshot <span className="text-slate-400 font-normal">(Optional for trial)</span>
                  </label>

                  {paymentReceiptUrl ? (
                    <div className="p-3.5 rounded-xl border border-purple-300 dark:border-purple-500/30 bg-purple-50/60 dark:bg-purple-500/5 flex items-center justify-between">
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0">
                          <Check className="w-4 h-4" />
                        </div>
                        <div className="text-xs truncate">
                          <div className="font-semibold text-slate-800 dark:text-slate-100 truncate">
                            {paymentReceiptName || 'payment_receipt.jpg'}
                          </div>
                          <span className="text-[11px] text-purple-600 dark:text-purple-400">
                            Receipt attached for review
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setPaymentReceiptUrl('');
                          setPaymentReceiptName('');
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Remove receipt"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="border-2 border-dashed border-slate-200 dark:border-white/10 hover:border-purple-400 dark:hover:border-purple-500/50 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-white/[0.01]">
                      <Receipt className="w-6 h-6 text-purple-500 mb-1" />
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                        {uploadingReceipt ? 'Uploading Receipt...' : 'Click to Upload Payment Receipt / Voucher Screenshot'}
                      </span>
                      <span className="text-[11px] text-slate-400 mt-0.5">
                        JPG, PNG, WEBP (Max 8MB)
                      </span>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleReceiptFileChange}
                        disabled={uploadingReceipt}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Additional Notes for Superadmin <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. We have 12 vehicles ready in Pokhara; please activate with priority."
                    value={paymentNote}
                    onChange={(e) => setPaymentNote(e.target.value)}
                    className="input-field dark:input-field-dark text-xs resize-none"
                  />
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading || uploadingDoc || uploadingReceipt}
                  className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-60"
                >
                  {loading ? (
                    'Submitting Application & Documents...'
                  ) : (
                    <>
                      <span>Submit Application for Approval</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              <div className="text-center text-xs text-slate-500 pt-2">
                Already have an activated account?{' '}
                <Link href="/login" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
                  Sign In here
                </Link>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
