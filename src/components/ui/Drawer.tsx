import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useLockBodyScroll } from '@/hooks/use-lock-body-scroll';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  placement?: 'right' | 'left' | 'bottom';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  hideCloseButton?: boolean;
  closeOnEsc?: boolean;
  closeOnOutsideClick?: boolean;
  className?: string;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  placement = 'right',
  size = 'md',
  hideCloseButton = false,
  closeOnEsc = true,
  closeOnOutsideClick = true,
  className = '',
}) => {
  const [rendered, setRendered] = useState(isOpen);
  const [animate, setAnimate] = useState(false);

  useLockBodyScroll(isOpen);

  // Smooth entrance & exit animations
  useEffect(() => {
    if (isOpen) {
      setRendered(true);
      // Small frame delay to trigger transition
      const timer = requestAnimationFrame(() => {
        setAnimate(true);
      });
      return () => cancelAnimationFrame(timer);
    } else {
      setAnimate(false);
      const timer = setTimeout(() => {
        setRendered(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle ESC key press
  useEffect(() => {
    if (!isOpen || !closeOnEsc) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeOnEsc, onClose]);

  if (!rendered) return null;

  const sizeStyles: Record<string, string> = {
    sm: 'max-w-sm',
    md: 'max-w-full sm:max-w-md md:max-w-lg',
    lg: 'max-w-full sm:max-w-xl md:max-w-2xl',
    xl: 'max-w-full sm:max-w-2xl md:max-w-3xl',
    full: 'max-w-full',
  };

  // Placement-specific transforms
  const placementClasses = {
    right: {
      container: 'inset-y-0 right-0',
      panel: animate ? 'translate-x-0' : 'translate-x-full',
      border: 'border-l border-slate-200 dark:border-zinc-800',
    },
    left: {
      container: 'inset-y-0 left-0',
      panel: animate ? 'translate-x-0' : '-translate-x-full',
      border: 'border-r border-slate-200 dark:border-zinc-800',
    },
    bottom: {
      container: 'inset-x-0 bottom-0 max-h-[90vh]',
      panel: animate ? 'translate-y-0' : 'translate-y-full',
      border: 'border-t border-slate-200 dark:border-zinc-800 rounded-t-2xl',
    },
  };

  const currentPlacement = placementClasses[placement] || placementClasses.right;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 overflow-hidden"
    >
      {/* Backdrop with fade transition */}
      <div
        className={`fixed inset-0 bg-black/60 dark:bg-black/75 backdrop-blur-xs transition-opacity duration-300 ease-out ${
          animate ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={closeOnOutsideClick ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Drawer Panel container */}
      <div className={`fixed ${currentPlacement.container} z-50 flex pointer-events-none`}>
        <div
          className={`pointer-events-auto w-screen ${sizeStyles[size] || sizeStyles.md} bg-white dark:bg-zinc-900 shadow-2xl flex flex-col h-full transition-transform duration-300 ease-out ${
            currentPlacement.panel
          } ${currentPlacement.border} ${className}`}
        >
          {/* Drawer Header */}
          {(title || !hideCloseButton) && (
            <div className="flex items-start justify-between px-5 py-4 border-b border-slate-100 dark:border-zinc-800 shrink-0">
              <div className="min-w-0 pr-4">
                {title && (
                  <div className="text-base font-bold text-slate-900 dark:text-zinc-100 tracking-tight">
                    {title}
                  </div>
                )}
                {description && (
                  <div className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                    {description}
                  </div>
                )}
              </div>

              {!hideCloseButton && (
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close drawer"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 overscroll-contain">
            {children}
          </div>

          {/* Drawer Footer */}
          {footer && (
            <div className="px-5 py-3.5 border-t border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/50 flex items-center justify-end gap-2.5 shrink-0">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
