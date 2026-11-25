'use client';

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  publicRentalService,
  PublicTenantInfo,
  PublicBookingInput,
  CustomerPortalProfile,
  CustomerSavedDocuments,
  CustomerPortalBooking,
} from '@/services/public-rental.service';
import { Vehicle } from '@/types';
import { useTheme } from '@/context/ThemeContext';
import {
  DateScheduleFilter,
  VehicleFleetCard,
  BookingWizardModal,
  CustomerFormData,
  BookingSuccessModal,
  BookingSuccessData,
  CustomerOtpLoginModal,
  CustomerPortalModal,
} from '@/components/public';
import {
  Car,
  MapPin,
  Phone,
  ShieldCheck,
  AlertCircle,
  Sun,
  Moon,
  User,
} from 'lucide-react';

export default function PublicTenantRentalPage() {
  const params = useParams();
  const router = useRouter();
  const slug = (params?.slug as string) || '';

  const { theme, toggleTheme } = useTheme();

  // State
  const [tenant, setTenant] = useState<PublicTenantInfo | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters, Search & Pagination
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'DEFAULT' | 'PRICE_ASC' | 'PRICE_DESC'>('DEFAULT');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(20);
  const fleetSectionRef = useRef<HTMLDivElement | null>(null);

  // Responsive page size: Mobile (2-col) -> 10, Tablet (3-col) -> 12, Desktop (4-col) -> 20
  useEffect(() => {
    const updatePageSize = () => {
      const w = window.innerWidth;
      if (w < 768) setItemsPerPage(10);
      else if (w < 1280) setItemsPerPage(12);
      else setItemsPerPage(20);
    };
    updatePageSize();
    window.addEventListener('resize', updatePageSize);
    return () => window.removeEventListener('resize', updatePageSize);
  }, []);

  // Helper to format local datetime string for <input type="datetime-local">
  const formatLocalDateTime = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Default dates in local timezone: tomorrow 10:00 AM to 3 days later 10:00 AM
  const tomorrow = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(10, 0, 0, 0);
    return formatLocalDateTime(d);
  }, []);

  const threeDaysLater = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 4);
    d.setHours(10, 0, 0, 0);
    return formatLocalDateTime(d);
  }, []);

  const nowMinDate = useMemo(() => {
    return formatLocalDateTime(new Date());
  }, []);

  const [startDate, setStartDate] = useState<string>(tomorrow);
  const [endDate, setEndDate] = useState<string>(threeDaysLater);

  // Reset to page 1 when filters or page size change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedType, searchQuery, sortBy, startDate, endDate, itemsPerPage]);

  // Quick schedule presets (1 Day, 3 Days, 7 Days)
  const setQuickSchedule = (days: number) => {
    const start = new Date();
    start.setDate(start.getDate() + 1);
    start.setHours(10, 0, 0, 0);

    const end = new Date(start);
    end.setDate(end.getDate() + days);
    end.setHours(10, 0, 0, 0);

    setStartDate(formatLocalDateTime(start));
    setEndDate(formatLocalDateTime(end));
  };

  // Safe helper to trigger native datepicker on click without throwing NotAllowedError
  const openDatePicker = (e: React.MouseEvent<HTMLInputElement>) => {
    try {
      if ('showPicker' in HTMLInputElement.prototype) {
        e.currentTarget.showPicker();
      }
    } catch {
      // Ignore browser activation security error
    }
  };

  // Modal State for Booking
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [bookingStep, setBookingStep] = useState<1 | 2 | 3>(1);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [isPreBooking, setIsPreBooking] = useState<boolean>(false);
  const [preBookingNotice, setPreBookingNotice] = useState<{
    bookedUntil: string;
    availableFrom: string;
  } | null>(null);

  // Customer Portal (Hybrid OTP Auth) State
  const [customerToken, setCustomerToken] = useState<string | null>(null);
  const [customerProfile, setCustomerProfile] = useState<CustomerPortalProfile | null>(null);
  const [savedDocuments, setSavedDocuments] = useState<CustomerSavedDocuments>({
    citizenshipUrl: null,
    drivingLicenseUrl: null,
    bankChequeUrl: null,
  });
  const [customerBookings, setCustomerBookings] = useState<CustomerPortalBooking[]>([]);
  const [showOtpModal, setShowOtpModal] = useState<boolean>(false);
  const [showPortalModal, setShowPortalModal] = useState<boolean>(false);

  const applyCustomerAutoFill = (
    profile: CustomerPortalProfile,
    docs: CustomerSavedDocuments,
  ) => {
    setFormData((prev) => ({
      ...prev,
      fullName: prev.fullName || profile.fullName || '',
      phone: prev.phone || profile.phone || '',
      email: prev.email || profile.email || '',
    }));
    if (docs.citizenshipUrl) setCitizenshipUrl((prev) => prev || docs.citizenshipUrl);
    if (docs.drivingLicenseUrl) setDrivingLicenseUrl((prev) => prev || docs.drivingLicenseUrl);
    if (docs.bankChequeUrl) setBankChequeUrl((prev) => prev || docs.bankChequeUrl);
  };

  const loadCustomerPortalSession = async (token: string) => {
    try {
      const portal = await publicRentalService.getCustomerPortal(slug, token);
      setCustomerToken(token);
      setCustomerProfile(portal.customer);
      setSavedDocuments(portal.savedDocuments);
      setCustomerBookings(portal.bookings);
      applyCustomerAutoFill(portal.customer, portal.savedDocuments);
    } catch {
      localStorage.removeItem('customer_portal_token');
      setCustomerToken(null);
      setCustomerProfile(null);
      setCustomerBookings([]);
    }
  };

  useEffect(() => {
    if (!slug || typeof window === 'undefined') return;
    const storedToken = localStorage.getItem('customer_portal_token');
    if (storedToken) {
      loadCustomerPortalSession(storedToken);
    }
  }, [slug]);

  const handleOtpLoginSuccess = async (data: {
    token: string;
    customer: CustomerPortalProfile;
    savedDocuments: CustomerSavedDocuments;
  }) => {
    localStorage.setItem('customer_portal_token', data.token);
    setCustomerToken(data.token);
    setCustomerProfile(data.customer);
    setSavedDocuments(data.savedDocuments);
    applyCustomerAutoFill(data.customer, data.savedDocuments);
    setShowOtpModal(false);
    await loadCustomerPortalSession(data.token);
    if (!selectedVehicle) {
      setShowPortalModal(true);
    }
  };

  const handleCustomerLogout = () => {
    localStorage.removeItem('customer_portal_token');
    setCustomerToken(null);
    setCustomerProfile(null);
    setSavedDocuments({ citizenshipUrl: null, drivingLicenseUrl: null, bankChequeUrl: null });
    setCustomerBookings([]);
    setShowPortalModal(false);
  };

  const openBookingModal = (v: Vehicle, preBook = false) => {
    setSelectedVehicle(v);
    setBookingStep(1);
    setBookingError(null);
    setIsPreBooking(preBook);
    if (customerProfile) {
      applyCustomerAutoFill(customerProfile, savedDocuments);
    }

    if (preBook && v.nextAvailableDate) {
      const start = new Date(v.nextAvailableDate);
      const end = new Date(start);
      end.setDate(end.getDate() + 3);

      setStartDate(formatLocalDateTime(start));
      setEndDate(formatLocalDateTime(end));
      setPreBookingNotice({
        bookedUntil: v.bookedUntil || v.nextAvailableDate,
        availableFrom: v.nextAvailableDate,
      });
    } else {
      setPreBookingNotice(null);
    }
  };

  const closeBookingModal = () => {
    setSelectedVehicle(null);
    setBookingStep(1);
    setBookingError(null);
    setIsPreBooking(false);
    setPreBookingNotice(null);
  };

  // Customer Contact Form Data
  const [formData, setFormData] = useState<CustomerFormData>({
    fullName: '',
    phone: '',
    email: '',
    pickupLocation: 'Main Office Hub',
    returnLocation: 'Main Office Hub',
    notes: '',
  });

  // Payment Selection State
  const [paymentType, setPaymentType] = useState<'ADVANCE' | 'FULL' | 'PAY_ON_PICKUP'>('ADVANCE');
  const [paymentMethod, setPaymentMethod] = useState<'ESEWA' | 'KHALTI' | 'FONEPAY' | 'CASH'>('ESEWA');
  const [transactionRef, setTransactionRef] = useState<string>('');

  // Booking Success Modal State
  const [successBookingData, setSuccessBookingData] = useState<BookingSuccessData | null>(null);

  // Verification Documents (Citizenship, Bank Cheque, Driving License)
  const [citizenshipUrl, setCitizenshipUrl] = useState<string | null>(null);
  const [uploadingCitizenship, setUploadingCitizenship] = useState<boolean>(false);

  const [bankChequeUrl, setBankChequeUrl] = useState<string | null>(null);
  const [uploadingBankCheque, setUploadingBankCheque] = useState<boolean>(false);

  const [drivingLicenseUrl, setDrivingLicenseUrl] = useState<string | null>(null);
  const [uploadingDrivingLicense, setUploadingDrivingLicense] = useState<boolean>(false);

  // Customer Payment Slip / Receipt Screenshot
  const [paymentReceiptUrl, setPaymentReceiptUrl] = useState<string | null>(null);
  const [uploadingPaymentReceipt, setUploadingPaymentReceipt] = useState<boolean>(false);

  const handlePaymentReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImageExt = /\.(jpg|jpeg|png|webp|avif|gif|svg)$/i.test(file.name);
    if (!file.type.startsWith('image/') && !isImageExt) {
      setBookingError('Please upload a valid payment slip image (JPG, PNG, WEBP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setBookingError('Payment receipt screenshot exceeds 10MB limit.');
      return;
    }

    setBookingError(null);

    try {
      setUploadingPaymentReceipt(true);
      const res = await publicRentalService.uploadDocument(slug, file);
      setPaymentReceiptUrl(res.documentUrl);
    } catch (err: any) {
      setBookingError(err?.message || 'Failed to upload payment receipt screenshot.');
    } finally {
      setUploadingPaymentReceipt(false);
    }
  };

  const handleDocUpload = async (
    file: File,
    docType: 'citizenship' | 'bankCheque' | 'drivingLicense',
  ) => {
    const isImageExt = /\.(jpg|jpeg|png|webp|avif|gif|svg)$/i.test(file.name);
    if (!file.type.startsWith('image/') && !isImageExt) {
      setBookingError('Please upload a valid image file (JPG, PNG, WEBP, AVIF).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setBookingError('File size exceeds 10MB limit.');
      return;
    }

    setBookingError(null);

    if (docType === 'citizenship') setUploadingCitizenship(true);
    else if (docType === 'bankCheque') setUploadingBankCheque(true);
    else setUploadingDrivingLicense(true);

    try {
      const res = await publicRentalService.uploadDocument(slug, file);
      if (docType === 'citizenship') setCitizenshipUrl(res.documentUrl);
      else if (docType === 'bankCheque') setBankChequeUrl(res.documentUrl);
      else setDrivingLicenseUrl(res.documentUrl);
    } catch (err: any) {
      setBookingError(err?.message || `Failed to upload ${docType} document photo.`);
    } finally {
      if (docType === 'citizenship') setUploadingCitizenship(false);
      else if (docType === 'bankCheque') setUploadingBankCheque(false);
      else setUploadingDrivingLicense(false);
    }
  };

  // Calculate rental duration
  const rentalDays = useMemo(() => {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    if (isNaN(start) || isNaN(end) || end <= start) return 1;
    return Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
  }, [startDate, endDate]);

  const [withDriver, setWithDriver] = useState<boolean>(false);
  const [promoCodeInput, setPromoCodeInput] = useState<string>('');
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    discountPercent: number;
    discountAmount: number;
  } | null>(null);
  const [promoMessage, setPromoMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [validatingPromo, setValidatingPromo] = useState<boolean>(false);

  const vehicleDailyRate = selectedVehicle?.dailyRate || 2500;
  const baseRentalAmount = rentalDays * vehicleDailyRate;
  const longTermDiscountPercent = rentalDays >= 30 ? 20 : rentalDays >= 7 ? 10 : 0;
  const longTermDiscountAmount = Math.round(baseRentalAmount * (longTermDiscountPercent / 100));
  const driverFeeAmount = withDriver ? rentalDays * 1500 : 0;
  const promoDiscountAmount = appliedPromo ? appliedPromo.discountAmount : 0;
  const totalRentalAmount = Math.max(
    0,
    baseRentalAmount - longTermDiscountAmount - promoDiscountAmount + driverFeeAmount
  );
  const standardAdvance = 2000;

  const handleApplyPromo = async () => {
    if (!promoCodeInput.trim()) return;
    try {
      setValidatingPromo(true);
      setPromoMessage(null);
      const res = await publicRentalService.validatePromoCode(
        slug,
        promoCodeInput.trim(),
        rentalDays,
        Math.max(0, baseRentalAmount - longTermDiscountAmount)
      );
      const data = (res as any)?.data || res;
      if (data?.valid) {
        setAppliedPromo({
          code: data.code,
          discountPercent: data.discountPercent,
          discountAmount: data.discountAmount,
        });
        setPromoMessage({ type: 'success', text: data.message });
      } else {
        setAppliedPromo(null);
        setPromoMessage({ type: 'error', text: data?.message || 'Invalid promo code.' });
      }
    } catch (err: any) {
      setAppliedPromo(null);
      setPromoMessage({ type: 'error', text: err?.message || 'Could not verify promo code.' });
    } finally {
      setValidatingPromo(false);
    }
  };

  const payableNow = useMemo(() => {
    if (paymentType === 'FULL') return totalRentalAmount;
    if (paymentType === 'ADVANCE') return Math.min(standardAdvance, totalRentalAmount);
    return 0; // PAY_ON_PICKUP
  }, [paymentType, totalRentalAmount]);

  const activeQrCodeUrl = useMemo(() => {
    if (!tenant) return null;
    let url: string | null = null;
    if (paymentMethod === 'ESEWA') {
      url = tenant.esewaQrUrl || tenant.paymentQrUrl || tenant.fonepayQrUrl || null;
    } else if (paymentMethod === 'KHALTI') {
      url = tenant.khaltiQrUrl || tenant.paymentQrUrl || tenant.fonepayQrUrl || null;
    } else if (paymentMethod === 'FONEPAY') {
      url = tenant.fonepayQrUrl || tenant.paymentQrUrl || null;
    }
    if (url) return url;
    return `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(
      `PAYMENT-TO:${tenant.name}|METHOD:${paymentMethod}|AMOUNT:NPR ${payableNow}`
    )}`;
  }, [tenant, paymentMethod, payableNow]);

  // Load Tenant and Fleet data
  useEffect(() => {
    if (!slug) return;
    let isMounted = true;

    async function loadStorefront() {
      try {
        setLoading(true);
        setError(null);

        const tenantRes = await publicRentalService.getTenantInfo(slug);
        const tData = (tenantRes as any)?.data || tenantRes;
        if (!isMounted) return;
        setTenant(tData);

        const vehiclesRes = await publicRentalService.getAvailableVehicles(slug, {
          startDate: new Date(startDate).toISOString(),
          endDate: new Date(endDate).toISOString(),
          vehicleType: selectedType,
        });

        const vData = (vehiclesRes as any)?.data || (Array.isArray(vehiclesRes) ? vehiclesRes : []);
        if (isMounted) {
          setVehicles(vData);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err?.message || 'Rental agency not found or currently unavailable.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadStorefront();

    return () => {
      isMounted = false;
    };
  }, [slug, startDate, endDate, selectedType]);

  // Handle Booking submission
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicle || !tenant) return;

    if (!formData.fullName.trim() || !formData.phone.trim() || !formData.email.trim()) {
      setBookingError('Please enter your full name, phone number, and email.');
      return;
    }

    if (
      uploadingCitizenship ||
      uploadingBankCheque ||
      uploadingDrivingLicense ||
      uploadingPaymentReceipt
    ) {
      setBookingError('Please wait for all documents and payment receipts to finish uploading.');
      return;
    }

    if (!citizenshipUrl || !bankChequeUrl || !drivingLicenseUrl) {
      setBookingError(
        'All 3 verification documents (Citizenship, Bank Cheque, and Driving License) are required.'
      );
      return;
    }

    if (paymentType !== 'PAY_ON_PICKUP' && paymentMethod !== 'CASH' && !paymentReceiptUrl) {
      setBookingError(
        'Please upload your payment receipt screenshot before confirming your booking.'
      );
      return;
    }

    try {
      setSubmitting(true);
      setBookingError(null);

      const payload: PublicBookingInput = {
        vehicleId: selectedVehicle.id,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        pickupLocation: formData.pickupLocation,
        returnLocation: formData.returnLocation,
        notes: formData.notes.trim() || undefined,
        citizenshipUrl: citizenshipUrl || undefined,
        bankChequeUrl: bankChequeUrl || undefined,
        drivingLicenseUrl: drivingLicenseUrl || undefined,
        documentUrl: citizenshipUrl || drivingLicenseUrl || bankChequeUrl || undefined,
        paymentType,
        paymentMethod: paymentType === 'PAY_ON_PICKUP' ? 'CASH' : paymentMethod,
        paidAmount: payableNow,
        transactionId: transactionRef.trim() || undefined,
        paymentReceiptUrl: paymentReceiptUrl || undefined,
        withDriver,
        promoCode: appliedPromo?.code || undefined,
      };

      const res = await publicRentalService.createBooking(slug, payload);
      const resData = (res as any)?.data || res;
      const bookingId = resData?.booking?.id;

      if (bookingId) {
        setSuccessBookingData({
          bookingId,
          customerName: formData.fullName.trim(),
          vehicleName: `${selectedVehicle.brand} ${selectedVehicle.model}`,
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          duration: rentalDays,
          totalAmount: totalRentalAmount,
          paidAmount: payableNow,
          paymentType,
        });
        closeBookingModal();
      } else {
        setBookingError('Booking could not be finalized. Please try again.');
      }
    } catch (err: any) {
      setBookingError(
        err?.message || 'An error occurred while creating your reservation. Please verify your details.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !tenant) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0b0f19] flex items-center justify-center p-6 text-slate-500 dark:text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-semibold tracking-wide">Loading Rental Fleet...</span>
        </div>
      </div>
    );
  }

  if (error || !tenant) {
    return (
      <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0b0f19] flex items-center justify-center p-6">
        <div className="max-w-md w-full p-8 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white font-['Outfit']">
            Agency Storefront Unavailable
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            {error || 'The requested rental company is currently inactive or does not exist.'}
          </p>
          <div className="pt-2">
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 font-['Inter'] transition-colors">
      {/* Header Banner */}
      <header className="sticky top-0 z-30 bg-white/85 dark:bg-[#0b0f19]/85 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:h-16 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-md shadow-indigo-500/20 shrink-0">
              {tenant.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-lg font-black text-slate-900 dark:text-white leading-tight font-['Outfit'] truncate">
                {tenant.name}
              </h1>
              <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
                <span className="hidden sm:flex items-center gap-1 truncate">
                  <MapPin className="w-3 h-3 text-indigo-500 shrink-0" />
                  <span className="truncate">{tenant.address || 'Kathmandu, Nepal'}</span>
                </span>
                <span className="hidden sm:inline">•</span>
                <span className="flex items-center gap-1 shrink-0">
                  <Phone className="w-3 h-3 text-indigo-500 shrink-0" />
                  <span>{tenant.phone || '+977'}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                if (customerProfile && customerToken) {
                  loadCustomerPortalSession(customerToken);
                  setShowPortalModal(true);
                } else {
                  setShowOtpModal(true);
                }
              }}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl border border-indigo-200 dark:border-indigo-800/80 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-[11px] sm:text-xs font-bold transition-colors cursor-pointer whitespace-nowrap"
            >
              <User className="w-3.5 h-3.5 shrink-0" />
              <span>
                {customerProfile
                  ? `${customerProfile.fullName.split(' ')[0]} • Bookings`
                  : 'My Bookings'}
              </span>
            </button>

            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-1.5 sm:p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer shrink-0"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Strip */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white py-8 sm:py-12 px-3 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.28),transparent_55%)] pointer-events-none" />
        <div className="max-w-7xl mx-auto text-center space-y-3 relative z-10 pb-6 sm:pb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-indigo-200 text-[11px] sm:text-xs font-semibold backdrop-blur-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Verified Rental Agency • Instant Online Booking</span>
          </div>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight font-['Outfit']">
            Drive Your Journey with{' '}
            <span className="bg-gradient-to-r from-indigo-300 via-sky-200 to-emerald-300 bg-clip-text text-transparent">
              {tenant.name}
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto">
            Transparent NPR rates, instant eSewa / Khalti / Fonepay QR checkout, flexible
            Self-Drive or Chauffeur options, and 10%–20% long-term discounts.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 pt-1 text-[11px] text-slate-200">
            <span className="px-2.5 py-1 rounded-lg bg-white/10 border border-white/10">
              ✓ {vehicles.length} Ready Vehicles
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-white/10 border border-white/10">
              ✓ Instant Email Receipt
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-white/10 border border-white/10">
              ✓ Weekly 10% • Monthly 20% Off
            </span>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 -mt-8 sm:-mt-10 pb-10 space-y-5 sm:space-y-6 relative z-20">
        {/* Modular Filter Component */}
        <DateScheduleFilter
          startDate={startDate}
          endDate={endDate}
          rentalDays={rentalDays}
          nowMinDate={nowMinDate}
          selectedType={selectedType}
          searchQuery={searchQuery}
          sortBy={sortBy}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onQuickSchedule={setQuickSchedule}
          onTypeChange={setSelectedType}
          onSearchChange={setSearchQuery}
          onSortChange={setSortBy}
          openDatePicker={openDatePicker}
        />

        {/* Fleet Vehicle Cards Grid */}
        {(() => {
          const filteredVehicles = vehicles
            .filter((v) => {
              if (!searchQuery.trim()) return true;
              const q = searchQuery.toLowerCase();
              return (
                v.brand.toLowerCase().includes(q) ||
                v.model.toLowerCase().includes(q) ||
                (v.plateNumber || '').toLowerCase().includes(q)
              );
            })
            .sort((a, b) => {
              const rateA = a.dailyRate || 2500;
              const rateB = b.dailyRate || 2500;
              if (sortBy === 'PRICE_ASC') return rateA - rateB;
              if (sortBy === 'PRICE_DESC') return rateB - rateA;
              return 0;
            });

          if (filteredVehicles.length === 0) {
            return (
              <div className="p-10 sm:p-12 text-center rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-500 flex items-center justify-center mx-auto">
                  <Car className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  No Vehicles Available for Selected Criteria
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  Try clearing your search or choosing a different vehicle category.
                </p>
              </div>
            );
          }

          const totalFiltered = filteredVehicles.length;
          const totalPages = Math.max(1, Math.ceil(totalFiltered / itemsPerPage));
          const safePage = Math.min(currentPage, totalPages);
          const startIdx = (safePage - 1) * itemsPerPage;
          const paginatedVehicles = filteredVehicles.slice(startIdx, startIdx + itemsPerPage);

          const goToPage = (page: number) => {
            setCurrentPage(page);
            fleetSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          };

          return (
            <div ref={fleetSectionRef} className="space-y-4 scroll-mt-20">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
                <span>
                  Showing{' '}
                  <strong className="text-slate-900 dark:text-white">
                    {startIdx + 1}–{Math.min(startIdx + itemsPerPage, totalFiltered)}
                  </strong>{' '}
                  of <strong className="text-slate-900 dark:text-white">{totalFiltered}</strong>{' '}
                  {totalFiltered === 1 ? 'vehicle' : 'vehicles'}
                </span>
                <span className="hidden sm:inline">
                  All prices in NPR • Page {safePage} of {totalPages}
                </span>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-4">
                {paginatedVehicles.map((v) => (
                  <VehicleFleetCard
                    key={v.id}
                    vehicle={v}
                    rentalDays={rentalDays}
                    onBook={openBookingModal}
                  />
                ))}
              </div>

              {/* Card Grid Pagination Bar */}
              {totalPages > 1 && (
                <div className="pt-3 flex items-center justify-center gap-1.5 sm:gap-2">
                  <button
                    type="button"
                    disabled={safePage <= 1}
                    onClick={() => goToPage(safePage - 1)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  >
                    Prev
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => goToPage(pageNum)}
                      className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        pageNum === safePage
                          ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                          : 'border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] text-slate-600 dark:text-slate-300 hover:border-indigo-500'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}

                  <button
                    type="button"
                    disabled={safePage >= totalPages}
                    onClick={() => goToPage(safePage + 1)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          );
        })()}
      </main>

      {/* Clean Agency Footer with Dynamic Social Links */}
      <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0c111d] py-7 px-4 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="space-y-1">
            <div>
              <strong className="text-slate-900 dark:text-white text-sm">{tenant.name}</strong>
              <span className="mx-2">•</span>
              <span>{tenant.address || 'Nepal'}</span>
            </div>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-[11px]">
              {tenant.phone && (
                <a href={`tel:${tenant.phone}`} className="hover:text-indigo-600 font-medium">
                  📞 {tenant.phone}
                </a>
              )}
              {tenant.email && (
                <a href={`mailto:${tenant.email}`} className="hover:text-indigo-600 font-medium">
                  ✉ {tenant.email}
                </a>
              )}
            </div>
          </div>

          {/* Dynamic Social Links from Tenant Settings */}
          {(tenant.whatsappUrl || tenant.tiktokUrl || tenant.facebookUrl || tenant.instagramUrl) && (
            <div className="flex flex-wrap items-center justify-center gap-2">
              {tenant.whatsappUrl && (
                <a
                  href={
                    tenant.whatsappUrl.startsWith('http')
                      ? tenant.whatsappUrl
                      : `https://wa.me/${
                          tenant.whatsappUrl.replace(/\D/g, '').length === 10
                            ? '977' + tenant.whatsappUrl.replace(/\D/g, '')
                            : tenant.whatsappUrl.replace(/\D/g, '')
                        }`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25 font-semibold transition-colors"
                >
                  <span>WhatsApp</span>
                </a>
              )}
              {tenant.tiktokUrl && (
                <a
                  href={tenant.tiktokUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/5 dark:bg-white/10 hover:bg-slate-900/10 dark:hover:bg-white/15 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 font-semibold transition-colors"
                >
                  <span>TikTok</span>
                </a>
              )}
              {tenant.facebookUrl && (
                <a
                  href={tenant.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-700 dark:text-blue-400 border border-blue-500/25 font-semibold transition-colors"
                >
                  <span>Facebook</span>
                </a>
              )}
              {tenant.instagramUrl && (
                <a
                  href={tenant.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pink-500/10 hover:bg-pink-500/20 text-pink-700 dark:text-pink-400 border border-pink-500/25 font-semibold transition-colors"
                >
                  <span>Instagram</span>
                </a>
              )}
            </div>
          )}
        </div>
      </footer>

      {/* Modular 3-Step Customer Booking Wizard Modal */}
      <BookingWizardModal
        isOpen={!!selectedVehicle}
        onClose={closeBookingModal}
        selectedVehicle={selectedVehicle}
        tenant={{
          name: tenant.name,
          phone: tenant.phone,
          email: tenant.email,
          address: tenant.address,
          bankAccountDetails: tenant.bankAccountDetails,
        }}
        bookingStep={bookingStep}
        setBookingStep={setBookingStep}
        submitting={submitting}
        bookingError={bookingError}
        formData={formData}
        setFormData={setFormData}
        startDate={startDate}
        endDate={endDate}
        setStartDate={setStartDate}
        setEndDate={setEndDate}
        rentalDays={rentalDays}
        isPreBooking={isPreBooking}
        preBookingNotice={
          preBookingNotice
            ? {
                bookedUntil: preBookingNotice.bookedUntil,
                availableFrom: preBookingNotice.availableFrom,
                status: 'BOOKED',
              }
            : null
        }
        nowMinDate={nowMinDate}
        openDatePicker={openDatePicker}
        onQuickSchedule={setQuickSchedule}
        citizenshipUrl={citizenshipUrl}
        uploadingCitizenship={uploadingCitizenship}
        onCitizenshipUpload={(file) => handleDocUpload(file, 'citizenship')}
        onCitizenshipRemove={() => setCitizenshipUrl(null)}
        bankChequeUrl={bankChequeUrl}
        uploadingBankCheque={uploadingBankCheque}
        onBankChequeUpload={(file) => handleDocUpload(file, 'bankCheque')}
        onBankChequeRemove={() => setBankChequeUrl(null)}
        drivingLicenseUrl={drivingLicenseUrl}
        uploadingDrivingLicense={uploadingDrivingLicense}
        onDrivingLicenseUpload={(file) => handleDocUpload(file, 'drivingLicense')}
        onDrivingLicenseRemove={() => setDrivingLicenseUrl(null)}
        paymentType={paymentType}
        setPaymentType={setPaymentType}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        transactionRef={transactionRef}
        setTransactionRef={setTransactionRef}
        paymentReceiptUrl={paymentReceiptUrl}
        uploadingPaymentReceipt={uploadingPaymentReceipt}
        onPaymentReceiptUpload={handlePaymentReceiptUpload}
        onPaymentReceiptRemove={() => setPaymentReceiptUrl(null)}
        activeQrCodeUrl={activeQrCodeUrl}
        onSubmit={handleBookingSubmit}
        isCustomerSignedIn={!!customerProfile}
        onOpenOtpLogin={() => setShowOtpModal(true)}
        withDriver={withDriver}
        onWithDriverChange={setWithDriver}
        promoCodeInput={promoCodeInput}
        onPromoCodeInputChange={setPromoCodeInput}
        appliedPromo={appliedPromo}
        promoMessage={promoMessage}
        validatingPromo={validatingPromo}
        onApplyPromo={handleApplyPromo}
        onRemovePromo={() => {
          setAppliedPromo(null);
          setPromoCodeInput('');
          setPromoMessage(null);
        }}
      />

      {/* Modular Booking Success Popup Modal */}
      {successBookingData && (
        <BookingSuccessModal
          data={successBookingData}
          slug={slug}
          onClose={() => setSuccessBookingData(null)}
        />
      )}

      {/* Returning Customer Email OTP Login Modal */}
      <CustomerOtpLoginModal
        isOpen={showOtpModal}
        slug={slug}
        tenantName={tenant.name}
        initialEmail={formData.email}
        onClose={() => setShowOtpModal(false)}
        onSuccess={handleOtpLoginSuccess}
      />

      {/* Customer My Bookings & Saved Docs Portal Modal */}
      {customerProfile && (
        <CustomerPortalModal
          isOpen={showPortalModal}
          slug={slug}
          customer={customerProfile}
          savedDocuments={savedDocuments}
          bookings={customerBookings}
          onClose={() => setShowPortalModal(false)}
          onLogout={handleCustomerLogout}
        />
      )}
    </div>
  );
}
