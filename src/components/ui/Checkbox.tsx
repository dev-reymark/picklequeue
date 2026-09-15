import React, { useId } from 'react';
import { Check } from 'lucide-react';

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: React.ReactNode;
  description?: React.ReactNode;
  checked?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCheckedChange?: (checked: boolean) => void;
  error?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      label,
      description,
      checked,
      onChange,
      onCheckedChange,
      disabled = false,
      className = '',
      id,
      error,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const checkboxId = id || generatedId;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e);
      onCheckedChange?.(e.target.checked);
    };

    return (
      <div className="flex flex-col">
        <label
          htmlFor={checkboxId}
          className={`inline-flex items-start gap-2.5 select-none ${
            disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
          } ${className}`}
        >
          <div className="relative flex items-center justify-center mt-0.5 shrink-0">
            <input
              ref={ref}
              type="checkbox"
              id={checkboxId}
              checked={checked}
              disabled={disabled}
              onChange={handleChange}
              className="sr-only peer"
              {...props}
            />
            <div
              className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all duration-150 ${
                checked
                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-2xs'
                  : 'bg-slate-50 dark:bg-zinc-950 border-slate-300 dark:border-zinc-700 hover:border-slate-400 dark:hover:border-zinc-600'
              } ${
                error ? 'border-rose-400 dark:border-rose-500' : ''
              } peer-focus-visible:ring-2 peer-focus-visible:ring-emerald-500/30 peer-focus-visible:ring-offset-1`}
            >
              {checked && <Check className="w-3 h-3 stroke-[3]" />}
            </div>
          </div>

          {(label || description) && (
            <div className="flex flex-col">
              {label && (
                <span className="text-xs font-medium text-slate-700 dark:text-zinc-300 leading-tight">
                  {label}
                </span>
              )}
              {description && (
                <span className="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5 leading-normal">
                  {description}
                </span>
              )}
            </div>
          )}
        </label>
        {error && (
          <p className="text-xs text-rose-500 dark:text-rose-400 mt-1">{error}</p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
