'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Car,
  ShieldCheck,
  Building2,
  Users,
  ArrowRight,
  Sparkles,
  Zap,
  CheckCircle2,
  ChevronRight,
  Phone,
  MapPin,
  CreditCard,
  QrCode,
  FileText,
  Gauge,
  BatteryCharging,
  Wrench,
  Shield,
  Check,
  Star,
  RefreshCw,
  Smartphone,
  Calendar,
  ChevronDown,
  ChevronUp,
  Sun,
  Moon,
  ExternalLink,
  HelpCircle,
  Lock,
  Layers,
  Fuel,
  Compass,
  Clock,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Home() {
  const { theme, toggleTheme } = useTheme();

  // Interactive states
  const [activePreviewTab, setActivePreviewTab] = useState<'fleet' | 'bluebook' | 'qr'>('fleet');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [activeRoleTab, setActiveRoleTab] = useState<'agency' | 'staff' | 'customer' | 'admin'>('agency');

  const faqs = [
    {
      q: 'How does the Digital Bluebook & Tax Compliance Vault work?',
      a: 'AutoRent allows rental agencies to upload scanned bluebooks, tax receipts, and vehicle insurance. The platform automatically monitors renewal dates based on Nepal government transport guidelines and notifies you via dashboard alerts and SMS before penalties hit.',
    },
    {
      q: 'Can I collect payments directly via eSewa, Khalti, and Fonepay?',
      a: 'Yes! AutoRent features built-in payment workflows for Nepal’s leading digital wallets. You can generate instant QR codes for counter bookings or accept online advance deposits when customers book through your dedicated rental portal.',
    },
    {
      q: 'Does each rental agency get their own branded booking webpage?',
      a: 'Absolutely. Every tenant on AutoRent gets a public storefront (e.g. youragency.autorent.np or /rent/your-slug). Customers can browse your real-time vehicle availability, select pickup/return dates, submit their citizenship/license documents, and pay.',
    },
    {
      q: 'How does the 60-second QR Handover & Inspection work?',
      a: 'Each vehicle is issued a unique QR code. At handover, the counter staff and customer scan the code on a mobile device, snap timestamped photos of vehicle condition and fuel levels, record any pre-existing scratches, and digitally sign off.',
    },
    {
      q: 'Can I manage multiple branches like Kathmandu and Pokhara?',
      a: 'Yes. Enterprise & Pro tiers support multi-branch management. You can allocate vehicles to specific hubs, transfer inventory between locations, and track branch-specific revenue and staff commissions.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070b14] text-slate-900 dark:text-slate-100 transition-colors duration-200 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Background Ambient Glow Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-b from-indigo-500/15 via-purple-500/10 to-transparent rounded-full blur-[140px]" />
        <div className="absolute top-1/3 -right-32 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[140px]" />
        <div className="absolute top-2/3 -left-32 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[150px]" />
      </div>

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-[#070b14]/85 border-b border-slate-200 dark:border-white/10 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform duration-200">
              <Car className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight font-['Outfit'] block leading-none">
                Auto<span className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">Rent</span>
              </span>
              <span className="text-[10px] font-semibold tracking-widest text-slate-500 dark:text-slate-400 uppercase">
                SaaS Fleet OS &bull; Nepal
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300">
            <a href="#features" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Features
            </a>
            <a href="#preview" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Live Preview
            </a>
            <a href="#roles" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Solutions
            </a>
            <a href="#pricing" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Pricing
            </a>
            <a href="#faq" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              FAQ
            </a>
          </nav>

          {/* Action CTAs & Theme Toggle */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-300 transition-colors"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            <Link
              href="/register"
              className="hidden sm:inline-flex items-center text-xs font-semibold px-3 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-all"
            >
              Apply as Agency
            </Link>

            <Link
              href="/login"
              className="hidden sm:inline-flex items-center text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 rounded-lg transition-colors"
            >
              Sign In
            </Link>

            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all duration-200 active:scale-95"
            >
              <span>Operator App</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/admin"
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
              title="Superadmin SaaS Management"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
              <span>Superadmin</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 z-10">
        {/* HERO SECTION */}
        <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
          {/* Top Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30 text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-8 animate-fade-in shadow-sm">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            <Sparkles className="w-3.5 h-3.5" />
            <span>Next-Gen Vehicle Rental SaaS &bull; Built for Nepal</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight font-['Outfit'] leading-[1.1] max-w-5xl mx-auto mb-6 text-slate-900 dark:text-white">
            Transform Your Vehicle Rental Fleet Into a{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 dark:from-indigo-400 dark:via-purple-300 dark:to-cyan-400 bg-clip-text text-transparent">
              Modern Cloud Machine
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed font-normal">
            Automate fleet availability, stay ahead of <strong>Bluebook renewals & road taxes</strong>, collect deposits with{' '}
            <span className="font-semibold text-slate-800 dark:text-slate-100">eSewa & Khalti</span>, and conduct 60-second QR digital inspections with zero paperwork.
          </p>

          {/* Call to Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              href="/register"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-base shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/40 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5 fill-white text-white" />
              <span>Register Agency (14-Day Free)</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>

            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 hover:border-indigo-400 dark:hover:border-indigo-500/50 text-slate-800 dark:text-slate-200 font-semibold text-base shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4 text-indigo-500" />
              <span>Operator Dashboard</span>
            </Link>

            <Link
              href="/rent/demo-rentals"
              className="w-full sm:w-auto px-5 py-3.5 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium text-sm flex items-center justify-center gap-1.5 transition-colors"
            >
              <Car className="w-4 h-4 text-indigo-500" />
              <span>Customer Storefront</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </Link>
          </div>

          {/* Social Proof Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto p-4 sm:p-6 rounded-2xl bg-white/70 dark:bg-white/[0.03] backdrop-blur-md border border-slate-200 dark:border-white/10 shadow-sm">
            <div className="text-center p-2">
              <div className="text-2xl sm:text-3xl font-black font-['Outfit'] text-indigo-600 dark:text-indigo-400">
                100%
              </div>
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                Digital Inspection & Sign
              </div>
            </div>
            <div className="text-center p-2 border-l border-slate-200 dark:border-white/10">
              <div className="text-2xl sm:text-3xl font-black font-['Outfit'] text-purple-600 dark:text-purple-400">
                NPR 0
              </div>
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                Bluebook Penalty Guarantee
              </div>
            </div>
            <div className="text-center p-2 border-l border-slate-200 dark:border-white/10">
              <div className="text-2xl sm:text-3xl font-black font-['Outfit'] text-cyan-600 dark:text-cyan-400">
                eSewa &bull; Khalti
              </div>
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                Native Nepal Gateways
              </div>
            </div>
            <div className="text-center p-2 border-l border-slate-200 dark:border-white/10">
              <div className="text-2xl sm:text-3xl font-black font-['Outfit'] text-emerald-600 dark:text-emerald-400">
                60 Sec
              </div>
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                Express QR Check-in
              </div>
            </div>
          </div>
        </section>

        {/* INTERACTIVE LIVE PLATFORM PREVIEW */}
        <section id="preview" className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Experience The UI
            </span>
            <h2 className="text-2xl sm:text-4xl font-black font-['Outfit'] tracking-tight mt-1 text-slate-900 dark:text-white">
              Built for Speed, Reliability, and Clarity
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mt-2">
              Everything your fleet operations require — available in an intuitive, ultra-responsive dashboard.
            </p>

            {/* Interactive Preview Tabs */}
            <div className="inline-flex p-1.5 rounded-xl bg-slate-200/80 dark:bg-white/10 backdrop-blur-md mt-6 gap-1">
              <button
                onClick={() => setActivePreviewTab('fleet')}
                className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-150 flex items-center gap-2 ${
                  activePreviewTab === 'fleet'
                    ? 'bg-white dark:bg-indigo-600 text-indigo-700 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Car className="w-4 h-4" />
                <span>Live Fleet Dispatch</span>
              </button>
              <button
                onClick={() => setActivePreviewTab('bluebook')}
                className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-150 flex items-center gap-2 ${
                  activePreviewTab === 'bluebook'
                    ? 'bg-white dark:bg-indigo-600 text-indigo-700 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Digital Bluebook Vault</span>
              </button>
              <button
                onClick={() => setActivePreviewTab('qr')}
                className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-150 flex items-center gap-2 ${
                  activePreviewTab === 'qr'
                    ? 'bg-white dark:bg-indigo-600 text-indigo-700 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <QrCode className="w-4 h-4" />
                <span>Smart QR Handover</span>
              </button>
            </div>
          </div>

          {/* Mockup Frame Container */}
          <div className="rounded-2xl border border-slate-200 dark:border-white/15 bg-white dark:bg-[#0c1222] shadow-2xl shadow-indigo-500/10 overflow-hidden transition-all duration-300">
            {/* Mockup Window Header Bar */}
            <div className="px-4 py-3 border-b border-slate-200 dark:border-white/10 bg-slate-100/80 dark:bg-[#11192e] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="ml-3 text-xs font-mono text-slate-500 dark:text-slate-400 hidden sm:inline-block">
                  https://autorent.np/dashboard/operations &bull; Himalayan Wheels Pvt. Ltd. (Kathmandu)
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live Fleet Sync
                </span>
              </div>
            </div>

            {/* Mockup Dynamic Content */}
            <div className="p-4 sm:p-6 lg:p-8">
              {activePreviewTab === 'fleet' && (
                <div className="space-y-6">
                  {/* Top Stats Cards Inside Mockup */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5">
                      <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Total Fleet Status</span>
                      <div className="text-2xl font-bold font-['Outfit'] mt-1 text-slate-900 dark:text-white">24 Vehicles</div>
                      <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> 18 Active on Trip &bull; 6 In Yard
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5">
                      <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">This Week’s Revenue</span>
                      <div className="text-2xl font-bold font-['Outfit'] mt-1 text-slate-900 dark:text-white">NPR 4,82,500</div>
                      <div className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">
                        +24.8% vs last week (eSewa / Khalti)
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5">
                      <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Urgent Compliance</span>
                      <div className="text-2xl font-bold font-['Outfit'] mt-1 text-amber-500">1 Bluebook Due</div>
                      <div className="text-xs text-amber-600 dark:text-amber-400 mt-1">Scorpio 4x4 expires in 14 days</div>
                    </div>
                  </div>

                  {/* Vehicle Fleet Cards Row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Vehicle 1 */}
                    <div className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#11192e] shadow-sm hover:border-indigo-400 transition-all">
                      <div className="flex items-center justify-between mb-3">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          ON TRIP &bull; Pokhara
                        </span>
                        <span className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400">BA 2 JA 8421</span>
                      </div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white font-['Outfit']">Mahindra Scorpio 4x4</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">SUV &bull; 7 Seater &bull; Diesel Manual</p>
                      <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-white/5 pt-3">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Current Renter:</span>
                          <span className="font-medium text-slate-800 dark:text-slate-200">Aarav Shrestha</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Daily Rate:</span>
                          <span className="font-semibold text-indigo-600 dark:text-indigo-400">NPR 7,500/day</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Return Due:</span>
                          <span className="font-medium text-slate-800 dark:text-slate-200">Tomorrow, 4:00 PM</span>
                        </div>
                      </div>
                    </div>

                    {/* Vehicle 2 */}
                    <div className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#11192e] shadow-sm hover:border-indigo-400 transition-all">
                      <div className="flex items-center justify-between mb-3">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                          READY FOR PICKUP
                        </span>
                        <span className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400">BA PA 1290</span>
                      </div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white font-['Outfit']">Royal Enfield Himalayan 450</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">Touring Bike &bull; 450cc &bull; Petrol</p>
                      <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-white/5 pt-3">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Yard Location:</span>
                          <span className="font-medium text-slate-800 dark:text-slate-200">Thamel Branch Bay 3</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Daily Rate:</span>
                          <span className="font-semibold text-indigo-600 dark:text-indigo-400">NPR 3,200/day</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Tank & Condition:</span>
                          <span className="font-medium text-emerald-500">100% Full &bull; Inspected</span>
                        </div>
                      </div>
                    </div>

                    {/* Vehicle 3 */}
                    <div className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#11192e] shadow-sm hover:border-indigo-400 transition-all">
                      <div className="flex items-center justify-between mb-3">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                          CHARGING &bull; 88%
                        </span>
                        <span className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400">BA 03 CHA 9912</span>
                      </div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white font-['Outfit']">BYD Atto 3 EV</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">Electric SUV &bull; 420km Range</p>
                      <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-white/5 pt-3">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Scheduled Booking:</span>
                          <span className="font-medium text-slate-800 dark:text-slate-200">Today at 6:00 PM</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Advance Paid:</span>
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">NPR 5,000 (eSewa)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Digital Key:</span>
                          <span className="font-medium text-indigo-500">Active QR Ready</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activePreviewTab === 'bluebook' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
                        <Shield className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          Nepal Transport Yatayat Bluebook Expiry Tracker
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Automated date calculation according to Bagmati & Gandaki transport department schedules.
                        </p>
                      </div>
                    </div>
                    <button className="btn-primary text-xs px-3 py-2 w-fit">
                      + Add New Bluebook Scan
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400">
                          <th className="py-2.5 px-3">Vehicle Plate</th>
                          <th className="py-2.5 px-3">Type & Model</th>
                          <th className="py-2.5 px-3">Tax Expiry Date</th>
                          <th className="py-2.5 px-3">Insurance Status</th>
                          <th className="py-2.5 px-3">Digital Scan</th>
                          <th className="py-2.5 px-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                        <tr>
                          <td className="py-3 px-3 font-mono font-bold text-slate-800 dark:text-slate-200">BA 2 JA 8421</td>
                          <td className="py-3 px-3">Mahindra Scorpio 4x4</td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold border border-amber-500/20">
                              2081 Ashoj 12 (14 Days Left)
                            </span>
                          </td>
                          <td className="py-3 px-3 text-emerald-600 dark:text-emerald-400 font-medium">Valid (Comprehensive)</td>
                          <td className="py-3 px-3 text-indigo-500 font-medium cursor-pointer hover:underline">
                            bluebook_scorpio_p1.pdf
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                              Pay Tax via eSewa
                            </button>
                          </td>
                        </tr>
                        <tr>
                          <td className="py-3 px-3 font-mono font-bold text-slate-800 dark:text-slate-200">BA 18 CH 5022</td>
                          <td className="py-3 px-3">Hyundai Creta SX</td>
                          <td className="py-3 px-3 text-emerald-600 dark:text-emerald-400 font-medium">
                            2082 Baisakh 28 (Good Standing)
                          </td>
                          <td className="py-3 px-3 text-emerald-600 dark:text-emerald-400 font-medium">Valid (Sagarmatha)</td>
                          <td className="py-3 px-3 text-indigo-500 font-medium cursor-pointer hover:underline">
                            creta_tax_receipt.jpg
                          </td>
                          <td className="py-3 px-3 text-right">
                            <span className="text-slate-400">Compliant</span>
                          </td>
                        </tr>
                        <tr>
                          <td className="py-3 px-3 font-mono font-bold text-slate-800 dark:text-slate-200">BA PA 1290</td>
                          <td className="py-3 px-3">Royal Enfield 450</td>
                          <td className="py-3 px-3 text-emerald-600 dark:text-emerald-400 font-medium">
                            2082 Mangsir 05 (Good Standing)
                          </td>
                          <td className="py-3 px-3 text-emerald-600 dark:text-emerald-400 font-medium">Valid (NLG Insurance)</td>
                          <td className="py-3 px-3 text-indigo-500 font-medium cursor-pointer hover:underline">
                            himalayan_bluebook.pdf
                          </td>
                          <td className="py-3 px-3 text-right">
                            <span className="text-slate-400">Compliant</span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activePreviewTab === 'qr' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  <div className="p-6 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 flex flex-col items-center text-center">
                    <div className="p-4 rounded-xl bg-white shadow-md border border-slate-200 mb-4">
                      <QrCode className="w-32 h-32 text-slate-900" />
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300">
                      TOKEN: QR-NEP-8421-INSPECT
                    </span>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-xs">
                      Attach this high-durability QR sticker to the windshield. One tap opens mobile digital inspection.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-lg font-bold font-['Outfit'] text-slate-900 dark:text-white">
                      60-Second Handover Protocol
                    </h4>
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-white dark:bg-[#11192e] border border-slate-200 dark:border-white/5">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">Pre-Trip Photo Checklist</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          Takes 4 angle photos (front, rear, sides) timestamped with GPS location.
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-white dark:bg-[#11192e] border border-slate-200 dark:border-white/5">
                      <Fuel className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">Fuel & Odometer Recording</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          Automatic fuel bar log prevents disputes at vehicle return.
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-white dark:bg-[#11192e] border border-slate-200 dark:border-white/5">
                      <Lock className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">Digital Agreement & Signature</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          Customer signs on their phone screen. Automated PDF sent via WhatsApp / Email.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 6 CORE PILLARS FEATURE GRID */}
        <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Complete Feature Architecture
            </span>
            <h2 className="text-3xl sm:text-5xl font-black font-['Outfit'] tracking-tight mt-2 text-slate-900 dark:text-white">
              Engineered Specifically for Modern Fleet Operators
            </h2>
            <p className="text-base text-slate-600 dark:text-slate-400 mt-4 leading-relaxed">
              No more messy paper logbooks, lost citizenship photocopies, or surprise bluebook fines. AutoRent brings enterprise-grade cloud tools to vehicle rental agencies across Nepal.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-7 rounded-2xl bg-white dark:bg-[#0d1424] border border-slate-200 dark:border-white/10 hover:border-indigo-500/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-6">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold font-['Outfit'] text-slate-900 dark:text-white mb-2">
                Digital Bluebook & Tax Vault
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                Securely store scanned copies of registration bluebooks, vehicle road taxes, and insurance policies. Automated alerts notify you 30 days before Yatayat renewal deadlines.
              </p>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                <span>Zero Late Penalties</span>
                <Check className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Feature 2 */}
            <div className="p-7 rounded-2xl bg-white dark:bg-[#0d1424] border border-slate-200 dark:border-white/10 hover:border-indigo-500/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-6">
                <CreditCard className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold font-['Outfit'] text-slate-900 dark:text-white mb-2">
                eSewa, Khalti & Fonepay Ready
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                Accept advance deposits, rental booking settlements, and fuel reconciliations through Nepal’s favorite payment gateways or direct dynamic Fonepay QR counters.
              </p>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-600 dark:text-purple-400">
                <span>Automated Ledger Sync</span>
                <Check className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Feature 3 */}
            <div className="p-7 rounded-2xl bg-white dark:bg-[#0d1424] border border-slate-200 dark:border-white/10 hover:border-indigo-500/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-6">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold font-['Outfit'] text-slate-900 dark:text-white mb-2">
                60-Sec QR Handover & Damage Log
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                Scan vehicle windshield QR codes to perform instant pre-trip and return damage checks. Mark scratches on a 3D diagram, log odometer readings, and avoid customer disputes.
              </p>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-cyan-600 dark:text-cyan-400">
                <span>Timestamped Photo Records</span>
                <Check className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Feature 4 */}
            <div className="p-7 rounded-2xl bg-white dark:bg-[#0d1424] border border-slate-200 dark:border-white/10 hover:border-indigo-500/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-6">
                <GlobeIcon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold font-['Outfit'] text-slate-900 dark:text-white mb-2">
                Custom Public Booking Storefront
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                Every agency gets a dedicated link (<code className="text-xs bg-slate-100 dark:bg-white/10 px-1 py-0.5 rounded">/rent/your-agency</code>). Customers can select dates, choose cars or bikes, upload driving licenses, and pay.
              </p>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <span>Direct Direct WhatsApp Alerts</span>
                <Check className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Feature 5 */}
            <div className="p-7 rounded-2xl bg-white dark:bg-[#0d1424] border border-slate-200 dark:border-white/10 hover:border-indigo-500/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-6">
                <Gauge className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold font-['Outfit'] text-slate-900 dark:text-white mb-2">
                Live GPS & Telemetry Tracking
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                Monitor vehicle speed, battery voltage, and geofencing. Receive instant notifications if a vehicle travels beyond agreed boundaries (e.g. Kathmandu Valley or off-road trekking passes).
              </p>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                <span>Highway & Remote Safety</span>
                <Check className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Feature 6 */}
            <div className="p-7 rounded-2xl bg-white dark:bg-[#0d1424] border border-slate-200 dark:border-white/10 hover:border-indigo-500/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-6">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold font-['Outfit'] text-slate-900 dark:text-white mb-2">
                Multi-Branch & Role Permissions
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                Operate multiple branches (Kathmandu, Pokhara, Chitwan). Assign custom roles for counter staff, mechanics, and accountants with audit log protection.
              </p>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400">
                <span>Bank-Grade Isolation</span>
                <Check className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </section>

        {/* ROLE-BASED VALUE PROPOSITIONS */}
        <section id="roles" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-slate-100/60 dark:bg-white/[0.02] rounded-3xl my-12 border border-slate-200 dark:border-white/10">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Tailored Experience
            </span>
            <h2 className="text-3xl sm:text-4xl font-black font-['Outfit'] tracking-tight mt-1 text-slate-900 dark:text-white">
              Designed For Every Role In Your Business
            </h2>
            <div className="flex flex-wrap justify-center gap-2 mt-6">
              <button
                onClick={() => setActiveRoleTab('agency')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  activeRoleTab === 'agency'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                For Rental Agency Owners
              </button>
              <button
                onClick={() => setActiveRoleTab('staff')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  activeRoleTab === 'staff'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                For Counter Staff & Fleet Handlers
              </button>
              <button
                onClick={() => setActiveRoleTab('customer')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  activeRoleTab === 'customer'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                For End Renters & Tourists
              </button>
              <button
                onClick={() => setActiveRoleTab('admin')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  activeRoleTab === 'admin'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                For SaaS Superadmins
              </button>
            </div>
          </div>

          <div className="max-w-4xl mx-auto p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#0c1222] border border-slate-200 dark:border-white/10 shadow-lg">
            {activeRoleTab === 'agency' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                    Total Operational Mastery
                  </span>
                  <h3 className="text-2xl font-bold font-['Outfit'] text-slate-900 dark:text-white mt-1 mb-4">
                    Scale Your Vehicle Fleet With Complete Peace Of Mind
                  </h3>
                  <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                      <span>Maximize vehicle utilization rate from 45% to over 85% with smart scheduling.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                      <span>Eliminate cash leakage with real-time digital payment receipts and settlement audits.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                      <span>Digital Bluebook renewal tracker keeps you 100% compliant with Nepal transport laws.</span>
                    </li>
                  </ul>
                  <div className="mt-6">
                    <Link href="/dashboard" className="btn-primary text-xs px-4 py-2.5">
                      Launch Agency Console <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
                <div className="p-6 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 space-y-4">
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
                    <span>FLEET OCCUPANCY RATE</span>
                    <span className="text-emerald-500">87.5% Active</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full w-[87.5%]" />
                  </div>
                  <div className="pt-2 border-t border-slate-200 dark:border-white/5 grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="p-2 rounded-lg bg-white dark:bg-slate-800">
                      <span className="text-slate-400 block">Monthly Revenue</span>
                      <span className="font-bold text-slate-800 dark:text-slate-100">NPR 18.4 Lakhs</span>
                    </div>
                    <div className="p-2 rounded-lg bg-white dark:bg-slate-800">
                      <span className="text-slate-400 block">Saved in Fines</span>
                      <span className="font-bold text-emerald-500">NPR 45,000</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeRoleTab === 'staff' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                    Quick Counter Operations
                  </span>
                  <h3 className="text-2xl font-bold font-['Outfit'] text-slate-900 dark:text-white mt-1 mb-4">
                    Handover Vehicles In Under 60 Seconds
                  </h3>
                  <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                      <span>Instant driving license & citizenship photo capture from staff mobile phone.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                      <span>Visual scratch and dent marking protects staff from being blamed for pre-existing damage.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                      <span>Automated deposit receipt generated via SMS or printed slip.</span>
                    </li>
                  </ul>
                  <div className="mt-6">
                    <Link href="/dashboard/bookings" className="btn-primary text-xs px-4 py-2.5">
                      View Dispatch Desk <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
                <div className="p-6 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 space-y-3">
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-300">Fast Checklist Progress</div>
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                    <CheckCircle2 className="w-4 h-4" /> Driving License Verified
                  </div>
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                    <CheckCircle2 className="w-4 h-4" /> 4-Angle Condition Photos Saved
                  </div>
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-semibold">
                    <Clock className="w-4 h-4" /> Deposit Holding via eSewa (NPR 15,000)
                  </div>
                </div>
              </div>
            )}

            {activeRoleTab === 'customer' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                    Smooth Renter Journey
                  </span>
                  <h3 className="text-2xl font-bold font-['Outfit'] text-slate-900 dark:text-white mt-1 mb-4">
                    Book Bikes & Cars Online In 3 Simple Steps
                  </h3>
                  <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                      <span>Browse transparent per-day rates with zero hidden roadside surcharges.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                      <span>Lock your booking by paying advance via eSewa, Khalti, or Fonepay.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                      <span>Access digital emergency bluebook copy on your phone in case of traffic checks.</span>
                    </li>
                  </ul>
                  <div className="mt-6">
                    <Link href="/rent/demo-rentals" className="btn-primary text-xs px-4 py-2.5">
                      Visit Sample Rental Store <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
                <div className="p-6 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 space-y-3 text-xs">
                  <div className="font-bold text-slate-800 dark:text-slate-200">Trip Confirmed: Pokhara Holiday</div>
                  <div className="p-3 rounded-lg bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-white/5 space-y-1">
                    <div className="font-semibold text-slate-800 dark:text-white">Hyundai Creta (BA 18 CH 5022)</div>
                    <div className="text-slate-500 dark:text-slate-400">Oct 12 &bull; 3 Days &bull; Pickup Kathmandu</div>
                    <div className="text-emerald-600 font-bold mt-2">Advance Paid: NPR 6,000 (Khalti)</div>
                  </div>
                </div>
              </div>
            )}

            {activeRoleTab === 'admin' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                    SaaS Cloud Management
                  </span>
                  <h3 className="text-2xl font-bold font-['Outfit'] text-slate-900 dark:text-white mt-1 mb-4">
                    Complete Control Over Tenants & Subscriptions
                  </h3>
                  <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                      <span>Provision new rental business tenants in under 30 seconds with isolated DB contexts.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                      <span>Manage SaaS tiers (Starter, Pro, Enterprise) and enforce vehicle limits.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                      <span>Inspect platform-wide telemetry, API latency, and monthly recurring revenue (MRR).</span>
                    </li>
                  </ul>
                  <div className="mt-6">
                    <Link href="/admin" className="btn-primary text-xs px-4 py-2.5">
                      Enter Superadmin Console <ShieldCheck className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
                <div className="p-6 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 space-y-2 text-xs">
                  <div className="font-bold text-slate-800 dark:text-slate-200">Tenant Provisioning Engine</div>
                  <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/5 flex justify-between">
                    <span>Himalayan Wheels</span>
                    <span className="font-semibold text-emerald-500">PRO PLAN &bull; Active</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/5 flex justify-between">
                    <span>Pokhara Bike Rentals</span>
                    <span className="font-semibold text-indigo-500">STARTER &bull; Active</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/5 flex justify-between">
                    <span>Everest Expedition 4x4</span>
                    <span className="font-semibold text-purple-500">ENTERPRISE</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* PRICING PLANS */}
        <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Transparent Pricing
            </span>
            <h2 className="text-3xl sm:text-5xl font-black font-['Outfit'] tracking-tight mt-2 text-slate-900 dark:text-white">
              Plans That Grow With Your Fleet
            </h2>
            <p className="text-base text-slate-600 dark:text-slate-400 mt-3">
              Simple, transparent pricing in Nepalese Rupees. No hidden setup fees.
            </p>

            {/* Monthly / Yearly Toggle */}
            <div className="inline-flex items-center gap-3 p-1.5 rounded-full bg-slate-200/80 dark:bg-white/10 mt-8 border border-slate-300 dark:border-white/10">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-5 py-1.5 rounded-full text-xs font-bold transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-white dark:bg-indigo-600 text-indigo-700 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Monthly Billing
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                  billingCycle === 'yearly'
                    ? 'bg-white dark:bg-indigo-600 text-indigo-700 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <span>Annual Billing</span>
                <span className="px-1.5 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-black">
                  SAVE 20%
                </span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {/* Plan 1: Starter */}
            <div className="p-8 rounded-2xl bg-white dark:bg-[#0d1424] border border-slate-200 dark:border-white/10 flex flex-col justify-between shadow-sm hover:border-slate-300 dark:hover:border-white/20 transition-all">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Free Trial</span>
                <h3 className="text-2xl font-bold font-['Outfit'] text-slate-900 dark:text-white mt-1">Starter</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 mb-6">
                  Perfect for independent rental shops and bike rental businesses getting started.
                </p>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-black font-['Outfit'] text-slate-900 dark:text-white">NPR 0</span>
                  <span className="text-xs text-slate-500">/ 14 days</span>
                </div>
                <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-white/10 pt-6">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Up to <strong>5 Vehicles</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>2 Staff Accounts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Digital Bluebook Vault</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>eSewa & Khalti Payments</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <span className="w-4 h-4 text-center">&times;</span>
                    <span>No GPS Telemetry</span>
                  </div>
                </div>
              </div>
              <div className="mt-8">
                <Link
                  href="/register"
                  className="w-full py-3 rounded-xl border border-slate-300 dark:border-white/20 hover:border-indigo-500 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  Start 14-Day Free Trial
                </Link>
              </div>
            </div>

            {/* Plan 2: Pro Fleet (Featured) */}
            <div className="p-8 rounded-2xl bg-white dark:bg-[#11192e] border-2 border-indigo-500 shadow-xl shadow-indigo-500/10 flex flex-col justify-between relative transform md:-translate-y-2">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[11px] font-black uppercase tracking-wider shadow-md">
                Most Popular &bull; Operators’ Choice
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-500">Growing Operators</span>
                <h3 className="text-2xl font-bold font-['Outfit'] text-slate-900 dark:text-white mt-1">
                  Professional Fleet
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 mb-6">
                  For active rental businesses requiring automated tax compliance, QR inspections, and telemetry.
                </p>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-black font-['Outfit'] text-slate-900 dark:text-white">
                    {billingCycle === 'monthly' ? 'NPR 2,999' : 'NPR 2,399'}
                  </span>
                  <span className="text-xs text-slate-500">/ month</span>
                </div>
                <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-white/10 pt-6">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Up to <strong>25 Vehicles</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>8 Staff Accounts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Automatic Bluebook Yatayat Alerts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>60-Sec QR Mobile Inspection Check</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Live GPS Telemetry Integration</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Priority WhatsApp Support</span>
                  </div>
                </div>
              </div>
              <div className="mt-8">
                <Link
                  href="/register"
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
                >
                  <span>Apply for Pro Fleet</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Plan 3: Enterprise */}
            <div className="p-8 rounded-2xl bg-white dark:bg-[#0d1424] border border-slate-200 dark:border-white/10 flex flex-col justify-between shadow-sm hover:border-slate-300 dark:hover:border-white/20 transition-all">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-purple-500">Commercial Fleets</span>
                <h3 className="text-2xl font-bold font-['Outfit'] text-slate-900 dark:text-white mt-1">Enterprise Agency</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 mb-6">
                  For large multi-branch car rental corporations, tourist transport agencies, and bus fleets.
                </p>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-black font-['Outfit'] text-slate-900 dark:text-white">
                    {billingCycle === 'monthly' ? 'NPR 7,999' : 'NPR 6,399'}
                  </span>
                  <span className="text-xs text-slate-500">/ month</span>
                </div>
                <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-white/10 pt-6">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Up to <strong>150 Vehicles</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Unlimited Staff & Branches</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Custom Subdomain & Agency Branding</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Dedicated Account Manager in Nepal</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Direct API Access & Custom Contracts</span>
                  </div>
                </div>
              </div>
              <div className="mt-8">
                <Link
                  href="/register"
                  className="w-full py-3 rounded-xl border border-slate-300 dark:border-white/20 hover:border-indigo-500 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  Apply for Enterprise
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* TESTIMONIALS & TRUST */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Trusted Across Nepal
            </span>
            <h2 className="text-3xl sm:text-4xl font-black font-['Outfit'] tracking-tight mt-1 text-slate-900 dark:text-white">
              Loved by Fleet Owners from Kathmandu to Pokhara
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-[#0c1222] border border-slate-200 dark:border-white/10 shadow-sm">
              <div className="flex text-amber-400 gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed italic mb-4">
                &quot;Before AutoRent, we missed our Scorpio bluebook renewal date twice and paid heavy penalties in Bagmati transport office. AutoRent has saved us lakhs in fines and keeps all documents on my phone.&quot;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                  BG
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Bikash Gurung</div>
                  <div className="text-[11px] text-slate-500">Lakeside Wheels, Pokhara</div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-[#0c1222] border border-slate-200 dark:border-white/10 shadow-sm">
              <div className="flex text-amber-400 gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed italic mb-4">
                &quot;The 60-second QR check-in completely stopped scratch disputes. Foreign tourists love paying with their cards while local renters pay directly via eSewa. The best software for bike rental agencies.&quot;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center text-xs">
                  SK
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Suman Karmacharya</div>
                  <div className="text-[11px] text-slate-500">Thamel Moto Rentals, Kathmandu</div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-[#0c1222] border border-slate-200 dark:border-white/10 shadow-sm">
              <div className="flex text-amber-400 gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed italic mb-4">
                &quot;Managing our Kathmandu and Chitwan branches from one dashboard is seamless. Our staff know vehicle availability live without calling each other every ten minutes.&quot;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
                  RS
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Ramesh Shrestha</div>
                  <div className="text-[11px] text-slate-500">Sauraha Safari Car Rentals, Chitwan</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ACCORDION FAQ */}
        <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Got Questions?
            </span>
            <h2 className="text-3xl font-black font-['Outfit'] tracking-tight mt-1 text-slate-900 dark:text-white">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c1222] overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between text-sm sm:text-base font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 text-indigo-500 shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-white/5 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* BOTTOM HIGH CONVERSION CTA BANNER */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white p-8 sm:p-14 text-center shadow-2xl">
            {/* Ambient circle glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-3xl mx-auto">
              <span className="px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold uppercase tracking-wider backdrop-blur-sm border border-white/20">
                Ready to Modernize Your Fleet?
              </span>
              <h2 className="text-3xl sm:text-5xl font-black font-['Outfit'] mt-4 mb-4 tracking-tight">
                Switch to Nepal’s Most Advanced Vehicle Rental Cloud Today
              </h2>
              <p className="text-sm sm:text-base text-indigo-200 mb-8 max-w-xl mx-auto leading-relaxed">
                Join forward-thinking vehicle and bike rental businesses across Kathmandu, Pokhara, and Chitwan. Start your 14-day free trial in seconds.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/dashboard"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-indigo-900 font-bold text-sm shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4 fill-indigo-900" />
                  <span>Launch Operator Dashboard</span>
                </Link>
                <Link
                  href="/login"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <span>Sign In to Account</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-indigo-200">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> No Credit Card Required
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 14-Day Full Free Access
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Quick 5-Min Setup
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 dark:border-white/10 bg-white/50 dark:bg-[#05080f] py-12 px-4 sm:px-6 lg:px-8 transition-colors">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1 */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <Car className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-base tracking-tight font-['Outfit']">
                AutoRent <span className="text-indigo-600 dark:text-indigo-400">SaaS</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              The premier all-in-one vehicle rental cloud OS for Nepal. Integrated with eSewa, Khalti, Yatayat Bluebook Vault, and smart mobile QR telemetry.
            </p>
            <div className="flex items-center gap-2 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              All Nepal Payment Gateways Operational
            </div>
          </div>

          {/* Col 2 */}
          <div className="space-y-2 text-xs">
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
              Platforms & Portals
            </h4>
            <ul className="space-y-2 text-slate-500 dark:text-slate-400">
              <li>
                <Link href="/dashboard" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Agency Operator Dashboard
                </Link>
              </li>
              <li>
                <Link href="/rent/demo-rentals" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Customer Public Booking Portal
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Superadmin SaaS Console
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Operator Login & Auth
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="space-y-2 text-xs">
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
              Features & Tools
            </h4>
            <ul className="space-y-2 text-slate-500 dark:text-slate-400">
              <li>
                <a href="#features" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Digital Bluebook Vault
                </a>
              </li>
              <li>
                <a href="#preview" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  60-Sec QR Mobile Handover
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  eSewa & Khalti Integrations
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Multi-Branch Management
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4 */}
          <div className="space-y-2 text-xs">
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
              Support & Location
            </h4>
            <div className="text-slate-500 dark:text-slate-400 space-y-1.5">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                <span>Kathmandu & Pokhara, Nepal</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-indigo-500" />
                <span>+977-9800000001 / 01-4455667</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                <span>Bank-grade 256-bit SSL Security</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-6 border-t border-slate-200 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-500 gap-4">
          <p>&copy; {new Date().getFullYear()} AutoRent SaaS Technologies Nepal. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer">Privacy Policy</span>
            <span>&bull;</span>
            <span className="hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer">Terms of Service</span>
            <span>&bull;</span>
            <span className="hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer">Nepal Yatayat Guidelines</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function GlobeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </svg>
  );
}
