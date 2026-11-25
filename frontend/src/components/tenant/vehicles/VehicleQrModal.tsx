'use client';

import React from 'react';
import { X, QrCode, Download, Car } from 'lucide-react';
import { Vehicle } from '../../../types';

interface VehicleQrModalProps {
  vehicle: Vehicle | null;
  isOpen: boolean;
  onClose: () => void;
}

export const VehicleQrModal: React.FC<VehicleQrModalProps> = ({
  vehicle,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !vehicle) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />
      <div
        className="relative w-full max-w-sm bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-2xl p-6 text-center space-y-4 z-10 my-auto"
        style={{ backgroundColor: 'var(--bg-card, #ffffff)' }}
      >
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white font-['Outfit']">
            <QrCode className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Vehicle QR Pass</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {vehicle.brand} {vehicle.model}
          </h3>
          <p className="text-xs font-mono text-indigo-600 dark:text-indigo-400 font-semibold">{vehicle.plateNumber}</p>
        </div>

        <div className="p-4 bg-white rounded-2xl inline-block shadow-inner mx-auto border border-slate-200">
          {vehicle.qrCodeUrl ? (
            <img
              src={vehicle.qrCodeUrl}
              alt={`QR code for ${vehicle.plateNumber}`}
              className="w-48 h-48 object-contain"
            />
          ) : (
            <div className="w-48 h-48 flex flex-col items-center justify-center text-slate-400">
              <QrCode className="w-16 h-16 text-slate-800 mb-2" />
              <span className="text-[11px] text-slate-600 font-mono">Digital Check-in QR</span>
            </div>
          )}
        </div>

        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          Drivers and customers can scan this QR code for instant pickup, check-in, and inspection verification.
        </p>

        {vehicle.qrCodeUrl && (
          <a
            href={vehicle.qrCodeUrl}
            target="_blank"
            rel="noopener noreferrer"
            download={`${vehicle.plateNumber}-qr.png`}
            className="w-full py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-md shadow-indigo-600/30 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download QR Code</span>
          </a>
        )}
      </div>
    </div>
  );
};
