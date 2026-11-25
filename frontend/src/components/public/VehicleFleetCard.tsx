'use client';

import React from 'react';
import { Vehicle } from '@/types';
import {
  Car,
  Fuel,
  Users,
  Clock,
  Sparkles,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

interface VehicleFleetCardProps {
  vehicle: Vehicle;
  rentalDays: number;
  onBook: (vehicle: Vehicle, preBook: boolean) => void;
}

export const VehicleFleetCard: React.FC<VehicleFleetCardProps> = ({
  vehicle,
  rentalDays,
  onBook,
}) => {
  const dailyRate = vehicle.dailyRate || 2500;
  const baseTotal = dailyRate * rentalDays;
  const discountPct = rentalDays >= 30 ? 20 : rentalDays >= 7 ? 10 : 0;
  const estTotal = Math.round(baseTotal * (1 - discountPct / 100));

  const isTwoWheeler =
    vehicle.vehicleType === 'MOTORCYCLE' || vehicle.vehicleType === 'SCOOTER';
  const capacityLabel = isTwoWheeler
    ? '2 Rider • Helmet'
    : vehicle.vehicleType === 'VAN'
    ? '12 Seater Van'
    : '5 Seater Comfort';

  return (
    <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-xl hover:border-indigo-300 dark:hover:border-indigo-700/70 hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between overflow-hidden group">
      {/* Top Edge-to-Edge Vehicle Image */}
      <div className="relative h-28 sm:h-44 bg-gradient-to-tr from-slate-100 to-indigo-50/50 dark:from-slate-800/70 dark:to-indigo-950/30 overflow-hidden flex items-center justify-center border-b border-slate-100 dark:border-slate-800">
        {vehicle.imageUrl ? (
          <img
            src={vehicle.imageUrl}
            alt={`${vehicle.brand} ${vehicle.model}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
              const sibling = e.currentTarget.nextElementSibling as HTMLElement;
              if (sibling) sibling.style.display = 'flex';
            }}
          />
        ) : null}

        <div
          className="text-slate-400 dark:text-slate-600 items-center justify-center"
          style={{ display: vehicle.imageUrl ? 'none' : 'flex' }}
        >
          <Car className="w-14 h-14" />
        </div>

        {/* Rich gradient overlay for crisp badge legibility */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/65 via-black/20 to-transparent pointer-events-none" />

        {/* Top-Left Availability Badge */}
        <div className="absolute top-2.5 left-2.5 z-10">
          {vehicle.isBooked ? (
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-500/95 text-white shadow-sm flex items-center gap-1 backdrop-blur-xs">
              <Clock className="w-2.5 h-2.5" />
              {vehicle.bookedUntil
                ? `Booked until ${new Date(vehicle.bookedUntil).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}`
                : 'Booked'}
            </span>
          ) : (
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-600/95 text-white shadow-sm flex items-center gap-1.5 backdrop-blur-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-200 animate-pulse" />
              Available
            </span>
          )}
        </div>

        {/* Top-Right Vehicle Type Badge */}
        <span className="absolute top-2.5 right-2.5 z-10 text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-950/75 text-white border border-white/15 backdrop-blur-xs">
          {vehicle.vehicleType}
        </span>

        {/* Bottom Plate & Color */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 z-10 flex items-center justify-between gap-2 text-[10px] text-white">
          <span className="font-mono font-semibold px-2 py-0.5 rounded-md bg-black/50 backdrop-blur-xs border border-white/10 truncate max-w-[58%]">
            {vehicle.plateNumber}
          </span>
          <span className="font-medium px-2 py-0.5 rounded-md bg-black/50 backdrop-blur-xs border border-white/10 truncate max-w-[38%]">
            {vehicle.color}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-2.5 sm:p-4 space-y-2 sm:space-y-3 flex-1 flex flex-col justify-between">
        <div className="flex items-start justify-between gap-1.5">
          <div className="min-w-0">
            <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 block truncate">
              {vehicle.brand}
            </span>
            <h4 className="text-xs sm:text-base font-extrabold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate font-['Outfit']">
              {vehicle.model}
            </h4>
          </div>
          <span
            title="Verified & Insured"
            className="hidden sm:inline-flex p-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 shrink-0"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
          </span>
        </div>

        {/* Pre-Booking Callout if Booked */}
        {vehicle.isBooked && vehicle.nextAvailableDate && (
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/25 text-[10.5px] flex items-center gap-1.5 text-amber-800 dark:text-amber-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="truncate">
              Pre-book from{' '}
              <strong>
                {new Date(vehicle.nextAvailableDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </strong>
            </span>
          </div>
        )}

        {/* Compact Specs Row (hidden on ultra-compact 2-col mobile to keep cards balanced) */}
        <div className="hidden sm:grid grid-cols-2 gap-1.5 text-[10.5px] text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-[#0c111d] border border-slate-100 dark:border-slate-800/80 truncate">
            <Fuel className="w-3 h-3 text-indigo-500 shrink-0" />
            <span className="truncate">Full Tank</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-[#0c111d] border border-slate-100 dark:border-slate-800/80 truncate">
            <Users className="w-3 h-3 text-indigo-500 shrink-0" />
            <span className="truncate">{capacityLabel}</span>
          </div>
        </div>

        {/* Pricing */}
        <div className="pt-1.5 sm:pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-end justify-between gap-1">
          <div className="min-w-0">
            <span className="hidden sm:block text-[9px] uppercase tracking-wider font-bold text-slate-400">
              Daily Rate
            </span>
            <div className="text-sm sm:text-lg font-black text-slate-900 dark:text-white leading-none truncate">
              NPR {dailyRate.toLocaleString()}
              <span className="text-[10px] sm:text-[11px] font-medium text-slate-500 dark:text-slate-400">
                /d
              </span>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-[8.5px] sm:text-[9px] text-slate-400 uppercase tracking-wider font-semibold block">
              {rentalDays}d Est.{discountPct > 0 ? ` (-${discountPct}%)` : ''}
            </span>
            <span className="text-[10.5px] sm:text-xs font-extrabold text-indigo-600 dark:text-indigo-400">
              NPR {estTotal.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="px-2.5 pb-2.5 sm:px-4 sm:pb-4">
        {vehicle.isBooked ? (
          <button
            type="button"
            onClick={() => onBook(vehicle, true)}
            className="w-full py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1 shadow-sm shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
            <span className="truncate">
              Pre-Book ({new Date(vehicle.nextAvailableDate || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})
            </span>
            <ChevronRight className="w-3.5 h-3.5 shrink-0 hidden sm:inline" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onBook(vehicle, false)}
            className="w-full py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1 shadow-sm shadow-indigo-600/25 transition-all cursor-pointer"
          >
            <span>Book Now</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        )}
      </div>
    </div>
  );
};
