import React, { useEffect } from 'react';
import { useLockBodyScroll } from '@/hooks/use-lock-body-scroll';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  /**
   * Mobile layout behavior on small screens (< sm / < 640px):
   * - 'dialog': Standard floating dialog with padding (default)
   * - 'full-width': Spans 100% width of mobile screen
   * - 'full-page': Takes over entire mobile screen (100% width and height)
   */
  mobileLayout?: 'dialog' | 'full-width' | 'full-page';
  /** Convenience shortcut for mobileLayout="full-width" */
  fullWidthOnMobile?: boolean;
  /** Convenience shortcut for mobileLayout="full-page" */
  fullPageOnMobile?: boolean;
  /** Alias for fullPageOnMobile */
  fullScreenOnMobile?: boolean;

  /**
   * Whether the modal can be dismissed via Escape key or backdrop click.
   * Defaults to true.
   */
  dismissable?: boolean;
  /**
   * Whether pressing the Escape key closes the modal.
   * Defaults to `dismissable` (true).
   */
  closeOnEsc?: boolean;
  /**
   * Whether clicking the backdrop outside the modal closes it.
   * Defaults to `dismissable` (true).
   */
  closeOnOutsideClick?: boolean;
  /** Alias for closeOnOutsideClick */
  closeOnBackdropClick?: boolean;
  /**
   * Whether to show the top-right "✕" close button.
   * Defaults to true.
   */
  showCloseButton?: boolean;
  /** Custom classes for the modal body content wrapper */
  bodyClassName?: string;
  /** Additional custom classes for the dialog container */
  dialogClassName?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = 'md',
  mobileLayout = 'dialog',
  fullWidthOnMobile = false,
  fullPageOnMobile = false,
  fullScreenOnMobile = false,
  dismissable = true,
  closeOnEsc,
  closeOnOutsideClick,
  closeOnBackdropClick,
  showCloseButton = true,
  bodyClassName,
  dialogClassName = '',
}) => {
  // Disable background scrolling when modal is open
  useLockBodyScroll(isOpen);

  const canCloseOnEsc = closeOnEsc ?? dismissable;
  const canCloseOnOutsideClick = closeOnBackdropClick ?? closeOnOutsideClick ?? dismissable;

  useEffect(() => {
    if (!isOpen || !canCloseOnEsc) return;

    function handleEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      }
    }

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose, canCloseOnEsc]);

  if (!isOpen) return null;

  const effectiveLayout =
    fullPageOnMobile || fullScreenOnMobile
      ? 'full-page'
      : fullWidthOnMobile
      ? 'full-width'
      : mobileLayout;

  const maxWidthStyles: Record<string, string> = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
  };

  const containerClasses =
    effectiveLayout === 'full-page'
      ? 'p-0 sm:p-4 items-stretch sm:items-center'
      : effectiveLayout === 'full-width'
      ? 'p-0 sm:p-4 items-end sm:items-center'
      : 'p-4 items-center';

  const dialogClasses =
    effectiveLayout === 'full-page'
      ? 'h-full sm:h-auto max-h-full sm:max-h-[90vh] rounded-none sm:rounded-2xl border-0 sm:border w-full'
      : effectiveLayout === 'full-width'
      ? 'w-full rounded-t-2xl sm:rounded-2xl border-x-0 border-b-0 sm:border max-h-[92vh] sm:max-h-[90vh]'
      : 'rounded-2xl border max-h-[90vh] w-full';

  return (
    <div
      className={`fixed inset-0 z-50 flex justify-center bg-black/60 dark:bg-black/75 backdrop-blur-xs overscroll-contain animate-in fade-in duration-150 ${containerClasses}`}
    >
      <div
        className="fixed inset-0"
        onClick={canCloseOnOutsideClick ? onClose : undefined}
        aria-hidden="true"
      />
      <div
        className={`relative z-10 ${maxWidthStyles[maxWidth] || maxWidthStyles.md} bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150 ${dialogClasses} ${dialogClassName}`}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 dark:border-zinc-800">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-zinc-100 tracking-tight">
              {title}
            </h3>
            {description && (
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                {description}
              </p>
            )}
          </div>
          {showCloseButton && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className="text-slate-400 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200 text-lg p-1.5 sm:px-2 sm:py-1 rounded-lg font-bold cursor-pointer transition"
            >
              ✕
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div
          className={`flex-1 overscroll-contain ${
            bodyClassName !== undefined ? bodyClassName : 'overflow-y-auto p-4 sm:p-6 space-y-4'
          }`}
        >
          {children}
        </div>

        {/* Modal Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 px-4 sm:px-6 py-3 sm:py-3.5 border-t border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/50">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
