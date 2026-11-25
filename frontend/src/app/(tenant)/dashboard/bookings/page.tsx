'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useTenant } from '@/context/TenantContext';
import { rentalService, CreateBookingInput } from '@/services/rental.service';
import { vehicleService } from '@/services/vehicle.service';
import { RentalBooking, Vehicle, BookingStatus } from '@/types';
import { BookingTable } from '@/components/tenant/bookings/BookingTable';
import { CreateBookingModal } from '@/components/tenant/bookings/CreateBookingModal';
import { RentalAgreementModal } from '@/components/tenant/bookings/RentalAgreementModal';
import { VehicleInspectionModal } from '@/components/tenant/bookings/VehicleInspectionModal';
import { PromoCodesModal } from '@/components/tenant/bookings/PromoCodesModal';
import { Plus, CheckCircle2, AlertCircle, Globe, Copy, ExternalLink, Check, Tag } from 'lucide-react';

export default function TenantBookingsPage() {
  const { tenant, tenantId, refreshTenant } = useTenant();
  const [bookings, setBookings] = useState<RentalBooking[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [agreementBooking, setAgreementBooking] = useState<RentalBooking | null>(null);
  const [inspectionBooking, setInspectionBooking] = useState<RentalBooking | null>(null);
  const [isPromoOpen, setIsPromoOpen] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  const fetchBookings = useCallback(async () => {
    if (!tenantId) return;
    try {
      setLoading(true);
      const [bookingsRes, vehiclesRes] = await Promise.all([
        rentalService.getTenantBookings(tenantId),
        vehicleService.getTenantVehicles(tenantId),
      ]);

      const bList = (bookingsRes as any)?.data || (Array.isArray(bookingsRes) ? bookingsRes : []);
      const vList = (vehiclesRes as any)?.data || (Array.isArray(vehiclesRes) ? vehiclesRes : []);

      setBookings(bList);
      setVehicles(vList);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Failed to load bookings.' });
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleCreateBooking = async (data: CreateBookingInput) => {
    if (!tenantId) return;
    await rentalService.createBooking(data, tenantId);
    setFeedback({ type: 'success', message: 'Reservation created successfully.' });
    await fetchBookings();
    await refreshTenant();
  };

  const handleUpdateStatus = async (bookingId: string, status: BookingStatus) => {
    if (!tenantId) return;
    try {
      await rentalService.updateBookingStatus(bookingId, status, tenantId);
      setFeedback({ type: 'success', message: `Booking status updated to ${status}.` });
      await fetchBookings();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Failed to update booking status.' });
    }
  };

  const publicPortalUrl =
    typeof window !== 'undefined' && tenant?.slug
      ? `${window.location.origin}/rent/${tenant.slug}`
      : tenant?.slug
      ? `/rent/${tenant.slug}`
      : '';

  const handleCopyLink = () => {
    if (!publicPortalUrl) return;
    navigator.clipboard.writeText(publicPortalUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Bookings</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Review customer reservations, track active trips, and manage booking statuses.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsPromoOpen(true)}
            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#111827] hover:border-indigo-500 text-slate-700 dark:text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Tag className="w-3.5 h-3.5 text-indigo-500" />
            <span>Promo Codes</span>
          </button>

          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium flex items-center gap-1.5 transition-colors shrink-0 shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Reservation</span>
          </button>
        </div>
      </div>

      {/* Customer Self-Booking Link Banner */}
      {tenant?.slug && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-50/80 via-white to-indigo-50/30 dark:from-indigo-950/40 dark:via-[#111827] dark:to-indigo-950/20 border border-indigo-200/80 dark:border-indigo-800/60 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Customer Self-Booking Portal
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Live & Public
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Share your public rental link with customers so they can view fleet availability and reserve vehicles directly.
              </p>
              <div className="mt-1.5 font-mono text-[11px] text-indigo-700 dark:text-indigo-300 select-all font-medium">
                {publicPortalUrl}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleCopyLink}
              className="flex-1 sm:flex-initial px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-indigo-500 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copy Link</span>
                </>
              )}
            </button>

            <a
              href={`/rent/${tenant.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-initial px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
            >
              <span>View Portal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}

      {/* Feedback Banner */}
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

      {/* Booking Table */}
      <BookingTable
        bookings={bookings}
        loading={loading}
        onUpdateStatus={handleUpdateStatus}
        onOpenAgreement={setAgreementBooking}
        onOpenInspection={setInspectionBooking}
      />

      {/* Create Reservation Modal */}
      <CreateBookingModal
        vehicles={vehicles}
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateBooking}
      />

      {/* Printable Digital Rental Agreement Modal */}
      <RentalAgreementModal
        booking={agreementBooking}
        tenant={tenant}
        onClose={() => setAgreementBooking(null)}
      />

      {/* Pickup & Return Vehicle Inspection Modal */}
      <VehicleInspectionModal
        booking={inspectionBooking}
        tenantId={tenantId}
        onClose={() => setInspectionBooking(null)}
        onSaved={fetchBookings}
      />

      {/* Tenant Promo Codes Modal */}
      <PromoCodesModal
        isOpen={isPromoOpen}
        tenantId={tenantId}
        onClose={() => setIsPromoOpen(false)}
      />
    </div>
  );
}
