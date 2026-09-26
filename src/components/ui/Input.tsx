import React from 'react';
import { AlertCircle } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  containerClassName?: string;
  endAdornment?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      error,
      endAdornment,
      className = '',
      containerClassName = 'w-full',
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    const rightPadding = endAdornment ? 'pr-10' : '';

    return (
      <div className={`space-y-1.5 ${containerClassName}`}>
        {label && (
          <label
            htmlFor={inputId}
            className={`block text-xs font-semibold uppercase tracking-wider cursor-pointer transition-colors ${
              error ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-zinc-300'
            }`}
          >
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            className={`w-full px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-950 border rounded-xl text-base sm:text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 transition-all focus:outline-none focus:ring-2 ${
              error
                ? 'border-rose-500 dark:border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/20 bg-rose-50/20 dark:bg-rose-950/10'
                : 'border-slate-200 dark:border-zinc-800 focus:border-emerald-500 dark:focus:border-emerald-500 focus:ring-emerald-500/20'
            } ${rightPadding} ${className}`}
            {...props}
          />
          {endAdornment && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-auto">
              {endAdornment}
            </div>
          )}
        </div>
        {error && (
          <p className="text-xs text-rose-500 dark:text-rose-400 flex items-center gap-1.5 font-medium mt-1 animate-in fade-in duration-150">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
            <span>{error}</span>
          </p>
        )}
        {helperText && !error && (
          <p className="text-[11px] text-slate-400 dark:text-zinc-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
