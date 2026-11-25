'use client';

import React from 'react';
import {
  Car,
  X,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Calendar,
  User,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Upload,
  Trash2,
  CreditCard,
  QrCode,
  Banknote,
} from 'lucide-react';
import { Vehicle } from '@/types';

export interface CustomerFormData {
  fullName: string;
  phone: string;
  email: string;
  pickupLocation: string;
  returnLocation: string;
  notes: string;
}

export interface BookingWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedVehicle: Vehicle | null;
  tenant: {
    name: string;
    phone?: string | null;
    email?: string | null;
    address?: string | null;
    bankAccountDetails?: string | null;
  };
  bookingStep: 1 | 2 | 3;
  setBookingStep: (step: 1 | 2 | 3) => void;
  submitting: boolean;
  bookingError: string | null;
  formData: CustomerFormData;
  setFormData: React.Dispatch<React.SetStateAction<CustomerFormData>>;
  startDate: string;
  endDate: string;
  setStartDate: (val: string) => void;
  setEndDate: (val: string) => void;
  rentalDays: number;
  isPreBooking: boolean;
  preBookingNotice: {
    bookedUntil: string;
    availableFrom: string;
    status: string;
  } | null;
  nowMinDate: string;
  openDatePicker: (e: React.MouseEvent<HTMLInputElement>) => void;
  onQuickSchedule: (days: number) => void;
  // Document uploads
  citizenshipUrl: string | null;
  uploadingCitizenship: boolean;
  onCitizenshipUpload: (file: File) => void;
  onCitizenshipRemove: () => void;
  bankChequeUrl: string | null;
  uploadingBankCheque: boolean;
  onBankChequeUpload: (file: File) => void;
  onBankChequeRemove: () => void;
  drivingLicenseUrl: string | null;
  uploadingDrivingLicense: boolean;
  onDrivingLicenseUpload: (file: File) => void;
  onDrivingLicenseRemove: () => void;
  // Payment state
  paymentType: 'ADVANCE' | 'FULL' | 'PAY_ON_PICKUP';
  setPaymentType: (type: 'ADVANCE' | 'FULL' | 'PAY_ON_PICKUP') => void;
  paymentMethod: 'ESEWA' | 'KHALTI' | 'FONEPAY' | 'CASH';
  setPaymentMethod: (method: 'ESEWA' | 'KHALTI' | 'FONEPAY' | 'CASH') => void;
  transactionRef: string;
  setTransactionRef: (ref: string) => void;
  paymentReceiptUrl: string | null;
  uploadingPaymentReceipt: boolean;
  onPaymentReceiptUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPaymentReceiptRemove: () => void;
  activeQrCodeUrl?: string | null;
  onSubmit: (e: React.FormEvent) => void;
  // Returning customer OTP auto-fill support
  isCustomerSignedIn?: boolean;
  onOpenOtpLogin?: () => void;
  // Driver option & Promo code
  withDriver?: boolean;
  onWithDriverChange?: (val: boolean) => void;
  promoCodeInput?: string;
  onPromoCodeInputChange?: (val: string) => void;
  appliedPromo?: { code: string; discountPercent: number; discountAmount: number } | null;
  promoMessage?: { type: 'success' | 'error'; text: string } | null;
  validatingPromo?: boolean;
  onApplyPromo?: () => void;
  onRemovePromo?: () => void;
}

export const BookingWizardModal: React.FC<BookingWizardModalProps> = ({
  isOpen,
  onClose,
  selectedVehicle,
  tenant,
  bookingStep,
  setBookingStep,
  submitting,
  bookingError,
  formData,
  setFormData,
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  rentalDays,
  isPreBooking,
  preBookingNotice,
  nowMinDate,
  openDatePicker,
  onQuickSchedule,
  citizenshipUrl,
  uploadingCitizenship,
  onCitizenshipUpload,
  onCitizenshipRemove,
  bankChequeUrl,
  uploadingBankCheque,
  onBankChequeUpload,
  onBankChequeRemove,
  drivingLicenseUrl,
  uploadingDrivingLicense,
  onDrivingLicenseUpload,
  onDrivingLicenseRemove,
  paymentType,
  setPaymentType,
  paymentMethod,
  setPaymentMethod,
  transactionRef,
  setTransactionRef,
  paymentReceiptUrl,
  uploadingPaymentReceipt,
  onPaymentReceiptUpload,
  onPaymentReceiptRemove,
  activeQrCodeUrl,
  onSubmit,
  isCustomerSignedIn = false,
  onOpenOtpLogin,
  withDriver = false,
  onWithDriverChange,
  promoCodeInput = '',
  onPromoCodeInputChange,
  appliedPromo = null,
  promoMessage = null,
  validatingPromo = false,
  onApplyPromo,
  onRemovePromo,
}) => {
  if (!isOpen || !selectedVehicle) return null;

  const dailyRate = selectedVehicle.dailyRate || 2500;
  const baseRental = dailyRate * rentalDays;
  const longTermPercent = rentalDays >= 30 ? 20 : rentalDays >= 7 ? 10 : 0;
  const longTermDiscount = Math.round(baseRental * (longTermPercent / 100));
  const driverFee = withDriver ? rentalDays * 1500 : 0;
  const promoDiscount = appliedPromo ? appliedPromo.discountAmount : 0;
  const rentalTotal = Math.max(0, baseRental - longTermDiscount - promoDiscount + driverFee);
  const standardAdvance = 2000;

  const payableNow =
    paymentType === 'FULL'
      ? rentalTotal
      : paymentType === 'ADVANCE'
      ? Math.min(standardAdvance, rentalTotal)
      : 0;

  const remainingBalance = Math.max(0, rentalTotal - payableNow);

  const handleNextToStep2 = () => {
    if (!formData.fullName.trim() || !formData.phone.trim() || !formData.email.trim()) {
      return;
    }
    setBookingStep(2);
  };

  const handleNextToStep3 = () => {
    if (!citizenshipUrl || !drivingLicenseUrl || !bankChequeUrl) {
      return;
    }
    setBookingStep(3);
  };

  const formatLocalDateTime = (date: Date) => {
    const pad = (n: number) => String(n).padStart(2, '0');
    const y = date.getFullYear();
    const m = pad(date.getMonth() + 1);
    const d = pad(date.getDate());
    const hh = pad(date.getHours());
    const mm = pad(date.getMinutes());
    return `${y}-${m}-${d}T${hh}:${mm}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-[#111827] rounded-2xl max-w-xl w-full max-h-[92vh] flex flex-col border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm shrink-0 border border-indigo-500/20">
              <Car className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Step {bookingStep} of 3
                </span>
                <span className="text-[10px] text-slate-400">•</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate">
                  {bookingStep === 1
                    ? 'Customer Details'
                    : bookingStep === 2
                    ? 'Documents'
                    : 'Payment & Confirmation'}
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                Reserve {selectedVehicle.brand} {selectedVehicle.model}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 3-Step Wizard Indicator */}
        <div className="px-4 py-2 bg-slate-50/80 dark:bg-slate-800/40 border-b border-slate-200/80 dark:border-slate-800 shrink-0">
          <div className="flex items-center justify-between max-w-lg mx-auto">
            {/* Step 1 */}
            <button
              type="button"
              onClick={() => setBookingStep(1)}
              className={`flex items-center gap-2 text-xs font-semibold transition-all ${
                bookingStep === 1
                  ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                  : bookingStep > 1
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-slate-400 dark:text-slate-500'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-all ${
                  bookingStep === 1
                    ? 'bg-indigo-600 text-white ring-4 ring-indigo-500/20 shadow-xs'
                    : bookingStep > 1
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                }`}
              >
                {bookingStep > 1 ? <CheckCircle2 className="w-3.5 h-3.5" /> : '1'}
              </div>
              <span className="hidden sm:inline">1. Details</span>
            </button>

            {/* Line 1 */}
            <div
              className={`flex-1 h-0.5 mx-2.5 rounded-full transition-all ${
                bookingStep > 1 ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'
              }`}
            />

            {/* Step 2 */}
            <button
              type="button"
              onClick={() => {
                if (formData.fullName && formData.phone && formData.email) {
                  setBookingStep(2);
                }
              }}
              className={`flex items-center gap-2 text-xs font-semibold transition-all ${
                bookingStep === 2
                  ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                  : bookingStep > 2
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-slate-400 dark:text-slate-500'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-all ${
                  bookingStep === 2
                    ? 'bg-indigo-600 text-white ring-4 ring-indigo-500/20 shadow-xs'
                    : bookingStep > 2
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                }`}
              >
                {bookingStep > 2 ? <CheckCircle2 className="w-3.5 h-3.5" /> : '2'}
              </div>
              <span className="hidden sm:inline">2. Documents</span>
            </button>

            {/* Line 2 */}
            <div
              className={`flex-1 h-0.5 mx-2.5 rounded-full transition-all ${
                bookingStep > 2 ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'
              }`}
            />

            {/* Step 3 */}
            <button
              type="button"
              onClick={() => {
                if (
                  formData.fullName &&
                  formData.phone &&
                  formData.email &&
                  citizenshipUrl &&
                  drivingLicenseUrl &&
                  bankChequeUrl
                ) {
                  setBookingStep(3);
                }
              }}
              className={`flex items-center gap-2 text-xs font-semibold transition-all ${
                bookingStep === 3
                  ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                  : 'text-slate-400 dark:text-slate-500'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-all ${
                  bookingStep === 3
                    ? 'bg-indigo-600 text-white ring-4 ring-indigo-500/20 shadow-xs'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                }`}
              >
                3
              </div>
              <span className="hidden sm:inline">3. Payment & Confirm</span>
            </button>
          </div>
        </div>

        {/* Modal Body & Form */}
        <form onSubmit={onSubmit} className="p-3.5 sm:p-4 space-y-3 flex-1 overflow-y-auto">
          {bookingError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{bookingError}</span>
            </div>
          )}

          {/* ================= STEP 1: CONTACT DETAILS & DATES ================= */}
          {bookingStep === 1 && (
            <div className="space-y-4 animate-in fade-in">
              {/* Pre-Booking Schedule Callout */}
              {isPreBooking && preBookingNotice && (
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 text-xs animate-in fade-in">
                  <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-bold text-amber-900 dark:text-amber-200 block text-xs">
                      Pre-Booking Mode (Next Available Slot)
                    </span>
                    <p className="text-[11px] text-amber-800 dark:text-amber-300 mt-0.5 leading-relaxed">
                      This vehicle is currently reserved until{' '}
                      <strong>
                        {new Date(preBookingNotice.bookedUntil).toLocaleDateString('en-US', {
                          dateStyle: 'medium',
                        })}
                      </strong>
                      . Your pre-booking starts on{' '}
                      <strong>
                        {new Date(preBookingNotice.availableFrom).toLocaleDateString('en-US', {
                          dateStyle: 'medium',
                        })}
                      </strong>{' '}
                      (the day after return).
                    </p>
                  </div>
                </div>
              )}

              {/* Selected Vehicle Banner & Price Calculation */}
              <div className="p-3.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 text-xs space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-indigo-200/60 dark:border-indigo-800/60">
                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                      Selected Vehicle
                    </span>
                    <div className="font-bold text-sm text-slate-900 dark:text-white">
                      {selectedVehicle.brand} {selectedVehicle.model} (
                      {selectedVehicle.plateNumber || selectedVehicle.vehicleType})
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                      Daily Rate
                    </span>
                    <div className="font-bold text-sm text-indigo-600 dark:text-indigo-400">
                      NPR {dailyRate.toLocaleString()}/day
                    </div>
                  </div>
                </div>

                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>
                    Rental Duration ({rentalDays} {rentalDays === 1 ? 'day' : 'days'} × NPR{' '}
                    {dailyRate.toLocaleString()})
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    NPR {baseRental.toLocaleString()}
                  </span>
                </div>

                {driverFee > 0 && (
                  <div className="flex justify-between text-indigo-700 dark:text-indigo-300">
                    <span>Chauffeur / Driver ({rentalDays} day(s) × NPR 1,500)</span>
                    <span className="font-semibold">+ NPR {driverFee.toLocaleString()}</span>
                  </div>
                )}

                {longTermDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                    <span>
                      Long-Term Discount ({longTermPercent}% {rentalDays >= 30 ? 'Monthly' : 'Weekly'})
                    </span>
                    <span>- NPR {longTermDiscount.toLocaleString()}</span>
                  </div>
                )}

                {promoDiscount > 0 && appliedPromo && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                    <span>Promo ({appliedPromo.code} • {appliedPromo.discountPercent}%)</span>
                    <span>- NPR {promoDiscount.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>Refundable Security Deposit (Pay at Pickup)</span>
                  <span className="font-semibold text-slate-900 dark:text-white">NPR 2,000</span>
                </div>

                <div className="pt-2 border-t border-indigo-200/60 dark:border-indigo-800/60 flex justify-between font-bold text-indigo-900 dark:text-indigo-200 text-sm">
                  <span>Estimated Total</span>
                  <span>NPR {(rentalTotal + 2000).toLocaleString()}</span>
                </div>
              </div>

              {/* Drive Mode & Promo Code Controls */}
              {onWithDriverChange && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                      Drive Option
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => onWithDriverChange(false)}
                        className={`py-1.5 px-2 rounded-lg text-[11px] font-bold border cursor-pointer transition-all ${
                          !withDriver
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-white dark:bg-[#0c111d] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        Self-Drive
                      </button>
                      <button
                        type="button"
                        onClick={() => onWithDriverChange(true)}
                        className={`py-1.5 px-2 rounded-lg text-[11px] font-bold border cursor-pointer transition-all ${
                          withDriver
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-white dark:bg-[#0c111d] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        + Driver (1.5k/d)
                      </button>
                    </div>
                  </div>

                  {onPromoCodeInputChange && onApplyPromo && (
                    <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                        Promo Code
                      </span>
                      {appliedPromo ? (
                        <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold">
                          <span>
                            {appliedPromo.code} (-NPR {appliedPromo.discountAmount.toLocaleString()})
                          </span>
                          <button
                            type="button"
                            onClick={onRemovePromo}
                            className="text-rose-500 hover:text-rose-700 ml-2 cursor-pointer"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={promoCodeInput}
                            onChange={(e) => onPromoCodeInputChange(e.target.value.toUpperCase())}
                            placeholder="DASHAIN10"
                            className="flex-1 min-w-0 px-2.5 py-1.5 text-[11px] rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0c111d] font-mono uppercase"
                          />
                          <button
                            type="button"
                            onClick={onApplyPromo}
                            disabled={validatingPromo || !promoCodeInput.trim()}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-900 dark:bg-indigo-600 text-white text-[11px] font-bold cursor-pointer disabled:opacity-50"
                          >
                            {validatingPromo ? '...' : 'Apply'}
                          </button>
                        </div>
                      )}
                      {promoMessage && !appliedPromo && (
                        <p
                          className={`text-[10px] ${
                            promoMessage.type === 'success' ? 'text-emerald-600' : 'text-rose-500'
                          }`}
                        >
                          {promoMessage.text}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Rental Schedule Adjustment */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                    <span>
                      Rental Schedule ({rentalDays} {rentalDays === 1 ? 'Day' : 'Days'})
                    </span>
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onQuickSchedule(1)}
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:text-indigo-600 text-slate-600 dark:text-slate-400 cursor-pointer"
                    >
                      +1 Day
                    </button>
                    <button
                      type="button"
                      onClick={() => onQuickSchedule(3)}
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:text-indigo-600 text-slate-600 dark:text-slate-400 cursor-pointer"
                    >
                      +3 Days
                    </button>
                    <button
                      type="button"
                      onClick={() => onQuickSchedule(7)}
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:text-indigo-600 text-slate-600 dark:text-slate-400 cursor-pointer"
                    >
                      +7 Days
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Pickup Date & Time *
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={startDate}
                      min={
                        isPreBooking && preBookingNotice
                          ? formatLocalDateTime(new Date(preBookingNotice.availableFrom))
                          : nowMinDate
                      }
                      onChange={(e) => setStartDate(e.target.value)}
                      onClick={openDatePicker}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0c111d] text-slate-900 dark:text-white cursor-pointer [color-scheme:light] dark:[color-scheme:dark] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Return Date & Time *
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={endDate}
                      min={startDate || nowMinDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      onClick={openDatePicker}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0c111d] text-slate-900 dark:text-white cursor-pointer [color-scheme:light] dark:[color-scheme:dark] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Customer Information Fields */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Primary Contact Details</span>
                  </h4>
                  {isCustomerSignedIn ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Verified Profile Auto-Filled</span>
                    </span>
                  ) : (
                    onOpenOtpLogin && (
                      <button
                        type="button"
                        onClick={onOpenOtpLogin}
                        className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                      >
                        Booked before? Auto-fill with Email OTP →
                      </button>
                    )
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="e.g. Ramesh Adhikari"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0c111d] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Mobile Phone *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="e.g. 9841000000"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0c111d] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. ramesh@example.com"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0c111d] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Pickup Location / Hub
                    </label>
                    <input
                      type="text"
                      value={formData.pickupLocation}
                      onChange={(e) =>
                        setFormData({ ...formData, pickupLocation: e.target.value })
                      }
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0c111d] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Return Location / Hub
                    </label>
                    <input
                      type="text"
                      value={formData.returnLocation}
                      onChange={(e) =>
                        setFormData({ ...formData, returnLocation: e.target.value })
                      }
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0c111d] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Step 1 Actions */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleNextToStep2}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <span>Continue to Documents</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* ================= STEP 2: VERIFICATION DOCUMENTS ================= */}
          {bookingStep === 2 && (
            <div className="space-y-4 animate-in fade-in">
              {isCustomerSignedIn && (citizenshipUrl || drivingLicenseUrl || bankChequeUrl) && (
                <div className="p-2.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/50 flex items-center gap-2 text-[11px] font-medium text-emerald-800 dark:text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>
                    Your previously uploaded documents have been attached automatically. You can
                    continue directly or replace any photo.
                  </span>
                </div>
              )}

              {/* Security Notice */}
              <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/60 flex items-start gap-2.5 text-xs text-blue-900 dark:text-blue-200">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  For regulatory compliance and collateral security in Nepal, please upload clear
                  image copies of the 3 required verification documents (JPG, PNG, WEBP, AVIF up to
                  10MB each).
                </p>
              </div>

              {/* 3 Upload Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* 1. Citizenship Card */}
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-3 bg-slate-50/50 dark:bg-[#0c111d]/50 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      1. Citizenship Card
                    </span>
                    {uploadingCitizenship ? (
                      <span className="text-[9px] text-indigo-500 font-bold animate-pulse">
                        Uploading...
                      </span>
                    ) : citizenshipUrl ? (
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        Attached
                      </span>
                    ) : (
                      <span className="text-[9px] text-slate-400">Required</span>
                    )}
                  </div>

                  {citizenshipUrl ? (
                    <div className="relative group rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 h-28">
                      <img
                        src={citizenshipUrl}
                        alt="Citizenship Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={onCitizenshipRemove}
                        className="absolute top-1.5 right-1.5 p-1 rounded-md bg-rose-500 text-white shadow-xs hover:bg-rose-600 transition-colors cursor-pointer"
                        title="Remove Photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center h-28 border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 rounded-lg bg-white dark:bg-[#111827] cursor-pointer text-center group transition-colors">
                      <Upload className="w-4 h-4 text-indigo-500 mb-1 group-hover:scale-110 transition-transform" />
                      <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                        Upload Citizenship
                      </span>
                      <span className="text-[9px] text-slate-400">National ID card photo</span>
                      <input
                        type="file"
                        accept="image/*,.avif,.webp,.png,.jpg,.jpeg"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) onCitizenshipUpload(file);
                        }}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {/* 2. Bank Cheque */}
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-3 bg-slate-50/50 dark:bg-[#0c111d]/50 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      2. Bank Cheque
                    </span>
                    {uploadingBankCheque ? (
                      <span className="text-[9px] text-indigo-500 font-bold animate-pulse">
                        Uploading...
                      </span>
                    ) : bankChequeUrl ? (
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        Attached
                      </span>
                    ) : (
                      <span className="text-[9px] text-rose-500 font-semibold">Required</span>
                    )}
                  </div>

                  {bankChequeUrl ? (
                    <div className="relative group rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 h-28">
                      <img
                        src={bankChequeUrl}
                        alt="Bank Cheque Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={onBankChequeRemove}
                        className="absolute top-1.5 right-1.5 p-1 rounded-md bg-rose-500 text-white shadow-xs hover:bg-rose-600 transition-colors cursor-pointer"
                        title="Remove Photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center h-28 border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 rounded-lg bg-white dark:bg-[#111827] cursor-pointer text-center group transition-colors">
                      <Upload className="w-4 h-4 text-indigo-500 mb-1 group-hover:scale-110 transition-transform" />
                      <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                        Upload Bank Cheque
                      </span>
                      <span className="text-[9px] text-slate-400">Security guarantee cheque</span>
                      <input
                        type="file"
                        accept="image/*,.avif,.webp,.png,.jpg,.jpeg"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) onBankChequeUpload(file);
                        }}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {/* 3. Driving License */}
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-3 bg-slate-50/50 dark:bg-[#0c111d]/50 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      3. Driving License
                    </span>
                    {uploadingDrivingLicense ? (
                      <span className="text-[9px] text-indigo-500 font-bold animate-pulse">
                        Uploading...
                      </span>
                    ) : drivingLicenseUrl ? (
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        Attached
                      </span>
                    ) : (
                      <span className="text-[9px] text-slate-400">Required</span>
                    )}
                  </div>

                  {drivingLicenseUrl ? (
                    <div className="relative group rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 h-28">
                      <img
                        src={drivingLicenseUrl}
                        alt="Driving License Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={onDrivingLicenseRemove}
                        className="absolute top-1.5 right-1.5 p-1 rounded-md bg-rose-500 text-white shadow-xs hover:bg-rose-600 transition-colors cursor-pointer"
                        title="Remove Photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center h-28 border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 rounded-lg bg-white dark:bg-[#111827] cursor-pointer text-center group transition-colors">
                      <Upload className="w-4 h-4 text-indigo-500 mb-1 group-hover:scale-110 transition-transform" />
                      <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                        Upload Driving License
                      </span>
                      <span className="text-[9px] text-slate-400">Driver license card photo</span>
                      <input
                        type="file"
                        accept="image/*,.avif,.webp,.png,.jpg,.jpeg"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) onDrivingLicenseUpload(file);
                        }}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* ID / Notes Input */}
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  License / Citizenship ID Number & Special Notes
                </label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. License #01-998822 / Clean vehicle with helmet requested"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0c111d] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder:text-slate-400"
                />
              </div>

              {/* Step 2 Actions */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2.5">
                <button
                  type="button"
                  onClick={() => setBookingStep(1)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Details</span>
                </button>
                <button
                  type="button"
                  onClick={handleNextToStep3}
                  disabled={!citizenshipUrl || !drivingLicenseUrl || !bankChequeUrl}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>Continue to Payment</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* ================= STEP 3: PAYMENT & CONFIRMATION ================= */}
          {bookingStep === 3 && (
            <div className="space-y-3 animate-in fade-in">
              {/* Reservation Overview Strip */}
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 text-xs flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 dark:text-white">
                    {formData.fullName || 'Customer'}
                  </span>
                  <span className="text-slate-400">({formData.phone})</span>
                  <span className="text-slate-300 dark:text-slate-600">•</span>
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                    {rentalDays} {rentalDays === 1 ? 'Day' : 'Days'} (
                    {new Date(startDate).toLocaleDateString()} -{' '}
                    {new Date(endDate).toLocaleDateString()})
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-[10px]">
                  <span className={citizenshipUrl ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                    {citizenshipUrl ? '✓ Citizenship' : '— Citizenship'}
                  </span>
                  <span
                    className={drivingLicenseUrl ? 'text-emerald-600 font-bold' : 'text-slate-400'}
                  >
                    {drivingLicenseUrl ? '✓ License' : '— License'}
                  </span>
                  {bankChequeUrl && <span className="text-emerald-600 font-bold">✓ Cheque</span>}
                  {paymentReceiptUrl && <span className="text-emerald-600 font-bold">✓ Slip</span>}
                </div>
              </div>

              {/* Payment Settlement Options */}
              <div className="p-3 rounded-xl border border-indigo-100 dark:border-indigo-900/60 bg-indigo-50/30 dark:bg-indigo-950/20 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>Payment Settlement Option *</span>
                  </label>
                  <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-white dark:bg-[#0c111d] px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800 shadow-2xs">
                    Instant Receipt
                  </span>
                </div>

                {/* 3 Payment Type Segmented Cards */}
                <div className="grid grid-cols-3 gap-2">
                  {/* Advance Deposit */}
                  <button
                    type="button"
                    onClick={() => setPaymentType('ADVANCE')}
                    className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                      paymentType === 'ADVANCE'
                        ? 'border-indigo-600 bg-white dark:bg-[#0f172a] ring-2 ring-indigo-500/20 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-[#0c111d]/60 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-900 dark:text-white">
                        Advance
                      </span>
                      <span className="text-[8px] font-extrabold px-1 py-0.2 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        Popular
                      </span>
                    </div>
                    <p className="text-xs font-black text-indigo-600 dark:text-indigo-400 mt-0.5">
                      NPR {Math.min(standardAdvance, rentalTotal).toLocaleString()}
                    </p>
                    <p className="text-[9px] text-slate-400 leading-none mt-0.5">Lock booking</p>
                  </button>

                  {/* Full Payment */}
                  <button
                    type="button"
                    onClick={() => setPaymentType('FULL')}
                    className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                      paymentType === 'FULL'
                        ? 'border-indigo-600 bg-white dark:bg-[#0f172a] ring-2 ring-indigo-500/20 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-[#0c111d]/60 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-900 dark:text-white">
                        Full Pay
                      </span>
                    </div>
                    <p className="text-xs font-black text-indigo-600 dark:text-indigo-400 mt-0.5">
                      NPR {rentalTotal.toLocaleString()}
                    </p>
                    <p className="text-[9px] text-slate-400 leading-none mt-0.5">100% upfront</p>
                  </button>

                  {/* Pay on Pickup */}
                  <button
                    type="button"
                    onClick={() => setPaymentType('PAY_ON_PICKUP')}
                    className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                      paymentType === 'PAY_ON_PICKUP'
                        ? 'border-indigo-600 bg-white dark:bg-[#0f172a] ring-2 ring-indigo-500/20 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-[#0c111d]/60 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-900 dark:text-white">
                        Counter
                      </span>
                    </div>
                    <p className="text-xs font-black text-amber-600 dark:text-amber-400 mt-0.5">
                      NPR 0 Now
                    </p>
                    <p className="text-[9px] text-slate-400 leading-none mt-0.5">Pay on pickup</p>
                  </button>
                </div>

                {/* Gateway Selector (for Advance or Full) */}
                {paymentType !== 'PAY_ON_PICKUP' && (
                  <div className="space-y-2 pt-1 border-t border-indigo-100 dark:border-indigo-900/40">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        Select Gateway
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('ESEWA')}
                        className={`px-2 py-1.5 rounded-lg border text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          paymentMethod === 'ESEWA'
                            ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold ring-1 ring-emerald-500'
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c111d] text-slate-700 dark:text-slate-300 hover:border-slate-300'
                        }`}
                      >
                        <span className="w-4 h-4 rounded bg-emerald-600 text-white font-bold text-[9px] flex items-center justify-center shrink-0">
                          e
                        </span>
                        <span className="text-[11px] font-medium">eSewa</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('KHALTI')}
                        className={`px-2 py-1.5 rounded-lg border text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          paymentMethod === 'KHALTI'
                            ? 'border-purple-500 bg-purple-500/10 text-purple-700 dark:text-purple-400 font-bold ring-1 ring-purple-500'
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c111d] text-slate-700 dark:text-slate-300 hover:border-slate-300'
                        }`}
                      >
                        <span className="w-4 h-4 rounded bg-purple-600 text-white font-bold text-[9px] flex items-center justify-center shrink-0">
                          K
                        </span>
                        <span className="text-[11px] font-medium">Khalti</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('FONEPAY')}
                        className={`px-2 py-1.5 rounded-lg border text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          paymentMethod === 'FONEPAY'
                            ? 'border-rose-500 bg-rose-500/10 text-rose-700 dark:text-rose-400 font-bold ring-1 ring-rose-500'
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c111d] text-slate-700 dark:text-slate-300 hover:border-slate-300'
                        }`}
                      >
                        <QrCode className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        <span className="text-[11px] font-medium">Fonepay</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('CASH')}
                        className={`px-2 py-1.5 rounded-lg border text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          paymentMethod === 'CASH'
                            ? 'border-blue-500 bg-blue-500/10 text-blue-700 dark:text-blue-400 font-bold ring-1 ring-blue-500'
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c111d] text-slate-700 dark:text-slate-300 hover:border-slate-300'
                        }`}
                      >
                        <Banknote className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span className="text-[11px] font-medium">Cash</span>
                      </button>
                    </div>

                    {/* Compact QR Code Display Card */}
                    {paymentMethod !== 'CASH' && (
                      <div className="p-2.5 rounded-xl border border-indigo-100 dark:border-indigo-900/60 bg-white dark:bg-[#0c111d] flex items-center gap-3">
                        <div className="bg-white p-1 rounded-xl border border-indigo-200 dark:border-indigo-800 shrink-0 shadow-2xs">
                          <img
                            src={
                              activeQrCodeUrl ||
                              `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                                `PAYMENT-TO:${tenant.name}|METHOD:${paymentMethod}|AMOUNT:NPR ${payableNow}`
                              )}`
                            }
                            alt={`${paymentMethod} QR Code`}
                            className="w-20 h-20 object-contain rounded"
                          />
                        </div>
                        <div className="flex-1 min-w-0 text-xs space-y-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold text-slate-900 dark:text-white truncate">
                              Scan to Pay {tenant.name}
                            </span>
                            <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/70 px-2 py-0.5 rounded-md shrink-0">
                              NPR {payableNow.toLocaleString()}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                            Scan with{' '}
                            {paymentMethod === 'ESEWA'
                              ? 'eSewa'
                              : paymentMethod === 'KHALTI'
                              ? 'Khalti'
                              : 'any Banking App'}
                            . Enter reference or upload screenshot below.
                          </p>
                          {tenant.bankAccountDetails && (
                            <p className="text-[9px] text-slate-400 truncate font-mono">
                              Bank: {tenant.bankAccountDetails.split('\n')[0]}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {paymentMethod === 'CASH' && (
                      <div className="p-2 rounded-lg bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 text-xs text-blue-900 dark:text-blue-200 flex items-center gap-2">
                        <Banknote className="w-4 h-4 text-blue-600 shrink-0" />
                        <span className="text-[11px]">
                          Pay <strong>NPR {payableNow.toLocaleString()}</strong> in cash directly at
                          counter during pickup.
                        </span>
                      </div>
                    )}

                    {/* Reference and Screenshot Upload Side-by-Side in 1 Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-0.5">
                          Txn Ref / Phone (Optional)
                        </label>
                        <input
                          type="text"
                          value={transactionRef}
                          onChange={(e) => setTransactionRef(e.target.value)}
                          placeholder={
                            paymentMethod === 'CASH'
                              ? 'e.g. Counter Voucher'
                              : 'e.g. 9841234567 or TXN-49021'
                          }
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0c111d] text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-0.5 flex items-center justify-between">
                          <span>
                            {paymentMethod === 'CASH'
                              ? 'Payment Proof (Optional)'
                              : 'Payment Receipt Image *'}
                          </span>
                          {uploadingPaymentReceipt && (
                            <span className="text-[9px] text-indigo-600 font-bold animate-pulse">
                              Uploading...
                            </span>
                          )}
                        </label>

                        {paymentReceiptUrl ? (
                          <div className="px-2 py-1 rounded-lg border border-emerald-500/30 bg-emerald-50/20 dark:bg-emerald-950/20 flex items-center justify-between">
                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 truncate">
                              <CheckCircle2 className="w-3 h-3 shrink-0" />
                              <span className="truncate">Slip Attached</span>
                            </span>
                            <button
                              type="button"
                              onClick={onPaymentReceiptRemove}
                              className="text-rose-500 hover:text-rose-700 p-0.5 cursor-pointer shrink-0"
                              title="Remove"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <label className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-dashed border-indigo-200 dark:border-indigo-800 hover:border-indigo-500 bg-white dark:bg-[#0c111d] text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 cursor-pointer transition-colors">
                            <Upload className="w-3 h-3" />
                            <span>Upload Screenshot</span>
                            <input
                              type="file"
                              accept="image/*,.avif,.webp,.png,.jpg,.jpeg"
                              onChange={onPaymentReceiptUpload}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Compact Financial Breakdown Bar */}
                <div className="px-3 py-2 rounded-xl bg-white dark:bg-[#0c111d] border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs shadow-2xs">
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase tracking-wider font-semibold">
                      Pay Now
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="font-black text-sm text-emerald-600 dark:text-emerald-400">
                        NPR {payableNow.toLocaleString()}
                      </span>
                      {paymentType !== 'PAY_ON_PICKUP' && (
                        <span className="text-[10px] font-bold text-slate-400">
                          ({paymentMethod})
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block text-[9px] uppercase tracking-wider font-semibold">
                      Due at Pickup
                    </span>
                    <span
                      className={`font-black text-sm ${
                        remainingBalance > 0
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-slate-400'
                      }`}
                    >
                      NPR {remainingBalance.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Step 3 Actions (Compact) */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setBookingStep(2)}
                  disabled={submitting}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Confirming...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Confirm & Book Vehicle</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
