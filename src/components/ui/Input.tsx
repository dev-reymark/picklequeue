import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  containerClassName?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      error,
      className = '',
      containerClassName = 'w-full',
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className={`space-y-1 ${containerClassName}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 uppercase tracking-wider cursor-pointer"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full px-3.5 py-2 bg-slate-50 dark:bg-zinc-950 border rounded-xl text-base sm:text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${
            error
              ? 'border-rose-400 dark:border-rose-500/60 focus:border-rose-500'
              : 'border-slate-200 dark:border-zinc-800 focus:border-emerald-500 dark:focus:border-emerald-500'
          } ${className}`}
          {...props}
        />
        {error && <p className="text-xs text-rose-500 dark:text-rose-400">{error}</p>}
        {helperText && !error && (
          <p className="text-[11px] text-slate-400 dark:text-zinc-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
