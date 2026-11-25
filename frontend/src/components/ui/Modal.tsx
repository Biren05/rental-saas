import React from 'react';
import { X, LucideIcon } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon: Icon,
  maxWidth = 'lg',
  children,
}) => {
  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className={`glass-panel w-full ${maxWidthClasses[maxWidth]} p-6 shadow-xl relative max-h-[90vh] overflow-y-auto bg-white border border-slate-200/90`}
      >
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            {Icon && (
              <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <Icon className="w-4 h-4" />
              </div>
            )}
            <div>
              <h3 className="font-semibold text-base text-slate-900">{title}</h3>
              {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
};
