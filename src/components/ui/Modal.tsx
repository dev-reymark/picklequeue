import React, { useEffect } from 'react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = 'md',
}) => {
  useEffect(() => {
    if (!isOpen) return;

    function handleEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      }
    }

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthStyles: Record<string, string> = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`relative z-10 w-full ${maxWidthStyles[maxWidth] || maxWidthStyles.md} bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150`}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-zinc-800">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100 tracking-tight">
              {title}
            </h3>
            {description && (
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="text-slate-400 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200 text-lg px-2 py-1 rounded-lg font-bold cursor-pointer transition"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {children}
        </div>

        {/* Modal Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 px-6 py-3.5 border-t border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/50">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
