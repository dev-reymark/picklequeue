import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Trash2,
  AlertCircle,
  Info,
  CheckCircle2,
  X,
  Loader2,
} from 'lucide-react';
import { Button, ButtonProps } from './Button';
import { useLockBodyScroll } from '@/hooks/use-lock-body-scroll';

export type ConfirmAlertVariant = 'danger' | 'warning' | 'info' | 'success';

export interface ConfirmAlertProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message?: React.ReactNode;
  children?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmAlertVariant;
  /**
   * Optional icon or boolean.
   * Defaults to false (hidden). Pass true or a custom ReactNode to show an icon.
   */
  icon?: React.ReactNode | boolean;
  isLoading?: boolean;
  closeOnOutsideClick?: boolean;
  closeOnEsc?: boolean;
  /** Optional custom class for dialog */
  className?: string;
}

export const ConfirmAlert: React.FC<ConfirmAlertProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  children,
  confirmText,
  cancelText = 'Cancel',
  variant = 'danger',
  icon = false,
  isLoading: externalLoading = false,
  closeOnOutsideClick = true,
  closeOnEsc = true,
  className = '',
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const loading = externalLoading || isSubmitting;

  useLockBodyScroll(isOpen);

  // Handle ESC key press
  useEffect(() => {
    if (!isOpen || !closeOnEsc || loading) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeOnEsc, loading, onClose]);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    try {
      setIsSubmitting(true);
      await onConfirm();
      onClose();
    } catch (err) {
      console.error('Error during confirm action:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Config mapping for each variant
  const variantConfig: Record<
    ConfirmAlertVariant,
    {
      iconWrapperClass: string;
      defaultIcon: React.ReactNode;
      confirmButtonVariant: ButtonProps['variant'];
      defaultConfirmText: string;
    }
  > = {
    danger: {
      iconWrapperClass:
        'bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60',
      defaultIcon: <Trash2 className="w-5 h-5" />,
      confirmButtonVariant: 'danger',
      defaultConfirmText: 'Delete',
    },
    warning: {
      iconWrapperClass:
        'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-900/60',
      defaultIcon: <AlertTriangle className="w-5 h-5" />,
      confirmButtonVariant: 'amber',
      defaultConfirmText: 'Proceed',
    },
    info: {
      iconWrapperClass:
        'bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-400 border border-sky-200 dark:border-sky-900/60',
      defaultIcon: <Info className="w-5 h-5" />,
      confirmButtonVariant: 'primary',
      defaultConfirmText: 'Confirm',
    },
    success: {
      iconWrapperClass:
        'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/60',
      defaultIcon: <CheckCircle2 className="w-5 h-5" />,
      confirmButtonVariant: 'primary',
      defaultConfirmText: 'Continue',
    },
  };

  const currentVariant = variantConfig[variant] || variantConfig.danger;
  const activeConfirmText = confirmText || currentVariant.defaultConfirmText;

  // Only show icon if explicitly requested via icon={true} or passing a custom icon
  const iconContent =
    icon === true
      ? currentVariant.defaultIcon
      : typeof icon === 'boolean'
      ? null
      : icon;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/75 backdrop-blur-xs overscroll-contain animate-in fade-in duration-150"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0"
        aria-hidden="true"
        onClick={closeOnOutsideClick && !loading ? onClose : undefined}
      />

      {/* Dialog card */}
      <div
        className={`relative z-10 w-full max-w-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 ${className}`}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          aria-label="Close"
          className="absolute top-3.5 right-3.5 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:text-zinc-500 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer disabled:opacity-40"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Content body */}
        <div className="p-5 sm:p-6">
          <div className="flex items-start gap-4">
            {iconContent && (
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs ${currentVariant.iconWrapperClass}`}
              >
                {iconContent}
              </div>
            )}

            <div className="flex-1 min-w-0 pt-0.5">
              <h3
                id="confirm-dialog-title"
                className="text-base font-bold text-slate-900 dark:text-zinc-100 leading-snug"
              >
                {title}
              </h3>

              {message && (
                <div
                  id="confirm-dialog-description"
                  className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1.5 leading-relaxed"
                >
                  {message}
                </div>
              )}

              {children && <div className="mt-3">{children}</div>}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 sm:px-6 py-3.5 bg-slate-50/70 dark:bg-zinc-950/70 border-t border-slate-100 dark:border-zinc-800/80 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 sm:gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
            disabled={loading}
            className="w-full sm:w-auto text-xs font-semibold"
          >
            {cancelText}
          </Button>

          <Button
            variant={currentVariant.confirmButtonVariant}
            size="sm"
            onClick={handleConfirm}
            disabled={loading}
            className="w-full sm:w-auto text-xs font-semibold"
          >
            {loading ? (
              <span className="inline-flex items-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Processing...
              </span>
            ) : (
              activeConfirmText
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

/**
 * Hook for programmatic confirmation alerts
 *
 * Usage:
 * const { confirm, ConfirmAlertDialog } = useConfirmAlert();
 * const ok = await confirm({
 *   title: 'Delete Player?',
 *   message: 'Are you sure you want to remove this player?',
 *   variant: 'danger',
 * });
 * if (ok) { ... }
 */
export function useConfirmAlert() {
  const [dialogProps, setDialogProps] = useState<
    (ConfirmAlertProps & { isOpen: boolean }) | null
  >(null);

  const confirm = (
    options: Omit<ConfirmAlertProps, 'isOpen' | 'onClose' | 'onConfirm'> & {
      onConfirm?: () => void | Promise<void>;
      onClose?: () => void;
    }
  ): Promise<boolean> => {
    return new Promise((resolve) => {
      setDialogProps({
        ...options,
        isOpen: true,
        onClose: () => {
          options.onClose?.();
          setDialogProps(null);
          resolve(false);
        },
        onConfirm: async () => {
          if (options.onConfirm) {
            await options.onConfirm();
          }
          setDialogProps(null);
          resolve(true);
        },
      });
    });
  };

  const ConfirmAlertDialog = dialogProps ? (
    <ConfirmAlert {...dialogProps} />
  ) : null;

  return { confirm, ConfirmAlertDialog };
}
