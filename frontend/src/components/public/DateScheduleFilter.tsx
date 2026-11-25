'use client';

import React from 'react';
import { Calendar, Search, SlidersHorizontal } from 'lucide-react';

interface DateScheduleFilterProps {
  startDate: string;
  endDate: string;
  rentalDays: number;
  nowMinDate: string;
  selectedType: string;
  searchQuery?: string;
  sortBy?: 'DEFAULT' | 'PRICE_ASC' | 'PRICE_DESC';
  onStartDateChange: (val: string) => void;
  onEndDateChange: (val: string) => void;
  onQuickSchedule: (days: number) => void;
  onTypeChange: (type: string) => void;
  onSearchChange?: (q: string) => void;
  onSortChange?: (sort: 'DEFAULT' | 'PRICE_ASC' | 'PRICE_DESC') => void;
  openDatePicker: (e: React.MouseEvent<HTMLInputElement>) => void;
}

export const DateScheduleFilter: React.FC<DateScheduleFilterProps> = ({
  startDate,
  endDate,
  rentalDays,
  nowMinDate,
  selectedType,
  searchQuery = '',
  sortBy = 'DEFAULT',
  onStartDateChange,
  onEndDateChange,
  onQuickSchedule,
  onTypeChange,
  onSearchChange,
  onSortChange,
  openDatePicker,
}) => {
  return (
    <div className="max-w-5xl mx-auto bg-white dark:bg-[#111827] rounded-2xl p-3.5 sm:p-5 border border-slate-200/90 dark:border-slate-800 shadow-lg shadow-slate-900/5 dark:shadow-black/30">
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4 items-center">
        {/* Pickup Date & Time */}
        <div className="sm:col-span-5 text-left">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-500" />
              <span>Pickup Date & Time</span>
            </span>
            <span
              className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold cursor-pointer hover:underline"
              onClick={() => onQuickSchedule(1)}
            >
              Start Tomorrow
            </span>
          </label>
          <input
            type="datetime-local"
            value={startDate}
            min={nowMinDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            onClick={openDatePicker}
            className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0c111d] text-slate-900 dark:text-white cursor-pointer [color-scheme:light] dark:[color-scheme:dark] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>

        {/* Duration Indicator & Quick Presets */}
        <div className="sm:col-span-2 flex flex-row sm:flex-col items-center justify-between sm:justify-center gap-1.5 py-1 sm:py-0">
          <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-100 dark:border-indigo-800/60 px-2.5 py-1 rounded-full uppercase tracking-wider">
            {rentalDays} {rentalDays === 1 ? 'Day' : 'Days'}
          </span>
          <div className="flex items-center gap-1.5">
            {[1, 3, 7].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => onQuickSchedule(d)}
                className="text-[10px] px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-600 dark:text-slate-300 font-semibold transition-colors cursor-pointer"
              >
                {d}D
              </button>
            ))}
          </div>
        </div>

        {/* Return Date & Time */}
        <div className="sm:col-span-5 text-left">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-500" />
              <span>Return Date & Time</span>
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
              {rentalDays >= 30
                ? '20% Monthly Off'
                : rentalDays >= 7
                ? '10% Weekly Off'
                : `Total: ${rentalDays}D`}
            </span>
          </label>
          <input
            type="datetime-local"
            value={endDate}
            min={startDate || nowMinDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            onClick={openDatePicker}
            className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0c111d] text-slate-900 dark:text-white cursor-pointer [color-scheme:light] dark:[color-scheme:dark] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>
      </div>

      {/* Category Pills + Search + Sort Row */}
      <div className="mt-3.5 pt-3.5 border-t border-slate-100 dark:border-slate-800/80 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 text-xs">
          {['ALL', 'CAR', 'MOTORCYCLE', 'SCOOTER', 'VAN', 'TRUCK'].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => onTypeChange(type)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all shrink-0 cursor-pointer ${
                selectedType === type
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {type === 'ALL' ? 'All Fleet' : type}
            </button>
          ))}
        </div>

        {/* Search & Sort Controls */}
        {(onSearchChange || onSortChange) && (
          <div className="flex items-center gap-2">
            {onSearchChange && (
              <div className="relative flex-1 sm:w-48">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Search model or brand..."
                  className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0c111d] text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            )}

            {onSortChange && (
              <div className="relative shrink-0">
                <SlidersHorizontal className="w-3 h-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={sortBy}
                  onChange={(e) => onSortChange(e.target.value as any)}
                  aria-label="Sort vehicles"
                  className="pl-7 pr-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0c111d] text-slate-700 dark:text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="DEFAULT">Featured</option>
                  <option value="PRICE_ASC">Price: Low → High</option>
                  <option value="PRICE_DESC">Price: High → Low</option>
                </select>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
