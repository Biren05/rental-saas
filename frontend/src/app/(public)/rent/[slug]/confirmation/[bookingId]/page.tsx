'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  publicRentalService,
  PublicBookingConfirmation,
} from '@/services/public-rental.service';
import { useTheme } from '@/context/ThemeContext';
import { PublicReceiptVoucher } from '@/components/public';
import {
  Printer,
  ChevronLeft,
  Mail,
  CheckCircle2,
  AlertCircle,
  Sun,
  Moon,
} from 'lucide-react';

export default function BookingConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const slug = (params?.slug as string) || '';
  const bookingId = (params?.bookingId as string) || '';

  const { theme, toggleTheme } = useTheme();

  const [bookingData, setBookingData] = useState<PublicBookingConfirmation | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [resendingEmail, setResendingEmail] = useState<boolean>(false);
  const [emailStatus, setEmailStatus] = useState<string | null>(null);
  const [uploadingSlip, setUploadingSlip] = useState<boolean>(false);

  const handleLatePaymentSlipUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingSlip(true);
      const uploadRes = await publicRentalService.uploadDocument(slug, file);
      await publicRentalService.uploadPaymentReceipt(slug, bookingId, uploadRes.documentUrl);
      setBookingData((prev: PublicBookingConfirmation | null) => {
        if (!prev) return prev;
        return {
          ...prev,
          booking: {
            ...prev.booking,
            paymentReceiptUrl: uploadRes.documentUrl,
          },
        };
      });
      setEmailStatus('Payment screenshot successfully attached!');
    } catch (err: any) {
      setEmailStatus(err?.message || 'Failed to upload payment receipt.');
    } finally {
      setUploadingSlip(false);
    }
  };

  const handleResendReceiptEmail = async () => {
    try {
      setResendingEmail(true);
      setEmailStatus(null);
      const res = await publicRentalService.sendBookingReceiptEmail(slug, bookingId);
      setEmailStatus(res?.message || 'Receipt sent to your email!');
    } catch (err: any) {
      setEmailStatus(err?.message || 'Failed to send receipt to email.');
    } finally {
      setResendingEmail(false);
    }
  };

  useEffect(() => {
    if (!slug || !bookingId) return;

    let isMounted = true;
    async function loadConfirmation() {
      try {
        setLoading(true);
        setError(null);

        const res = await publicRentalService.getBookingConfirmation(slug, bookingId);
        const data = (res as any)?.data || res;
        if (isMounted) {
          setBookingData(data);
          if (typeof window !== 'undefined' && window.location.search.includes('download=1')) {
            setTimeout(() => window.print(), 450);
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err?.message || 'Could not locate your reservation details.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadConfirmation();
    return () => {
      isMounted = false;
    };
  }, [slug, bookingId]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-[#0b0f19] text-slate-800 dark:text-slate-200">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium">Retrieving booking receipt...</p>
      </div>
    );
  }

  if (error || !bookingData?.booking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-[#0b0f19] text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Reservation Not Found</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md">
          {error || 'The requested booking ID does not match any current reservation record.'}
        </p>
        <button
          onClick={() => router.push(`/rent/${slug}`)}
          className="mt-6 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs cursor-pointer"
        >
          Return to Fleet
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 py-6 px-4 sm:px-6 print:p-0 print:bg-white print:text-black">
      {/* Print Page Styles to force exact 1-page A4 output */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 8mm 10mm;
          }
          body {
            background: #ffffff !important;
            color: #000000 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .no-print {
            display: none !important;
          }
          .print-full {
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: 1px solid #cbd5e1 !important;
            page-break-inside: avoid !important;
          }
        }
      `}</style>

      {/* Top Action Bar (Hidden in Print) */}
      <div className="max-w-2xl mx-auto flex items-center justify-between mb-4 no-print">
        <button
          onClick={() => router.push(`/rent/${slug}`)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Fleet Catalog</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-sm shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print 1-Page Receipt</span>
          </button>

          <button
            onClick={handleResendReceiptEmail}
            disabled={resendingEmail}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium transition-all cursor-pointer disabled:opacity-50"
            title="Resend receipt voucher to your email"
          >
            <Mail className="w-3.5 h-3.5 text-indigo-500" />
            <span className="hidden sm:inline">
              {resendingEmail ? 'Sending...' : 'Email Receipt'}
            </span>
          </button>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Email Dispatch Notification Banner */}
      {emailStatus && (
        <div className="max-w-2xl mx-auto mb-3 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-indigo-800 dark:text-indigo-300 text-xs flex items-center justify-between no-print animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <span>{emailStatus}</span>
          </div>
          <button
            onClick={() => setEmailStatus(null)}
            className="text-indigo-500 hover:text-indigo-700 font-bold ml-2 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Single-Page Printable Receipt Voucher */}
      <PublicReceiptVoucher
        bookingData={bookingData}
        uploadingSlip={uploadingSlip}
        onUploadSlip={handleLatePaymentSlipUpload}
      />

      {/* Footer Navigation (Hidden in Print) */}
      <div className="max-w-2xl mx-auto mt-6 text-center space-y-2 no-print">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Need immediate support or have questions regarding your rental schedule? Contact{' '}
          <strong>{bookingData.booking.tenant?.name}</strong> at{' '}
          <a
            href={`tel:${bookingData.booking.tenant?.phone}`}
            className="text-indigo-600 dark:text-indigo-400 underline font-medium"
          >
            {bookingData.booking.tenant?.phone || 'our support line'}
          </a>
          .
        </p>
      </div>
    </div>
  );
}
