import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'amber';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'secondary',
      size = 'sm',
      fullWidth = false,
      disabled = false,
      className = '',
      type = 'button',
      ...props
    },
    ref
  ) => {
    // Base styles with explicit cursor handling
    const baseStyles =
      'inline-flex items-center justify-center font-semibold rounded-lg transition-all select-none focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';

    // Variant styles
    const variantStyles: Record<string, string> = {
      primary:
        'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white shadow-xs focus:ring-emerald-500',
      secondary:
        'bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 border border-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:active:bg-zinc-600 dark:text-zinc-200 dark:border-zinc-700 shadow-xs',
      outline:
        'border border-slate-300 hover:bg-slate-100 active:bg-slate-200 text-slate-800 dark:border-zinc-700 dark:hover:bg-zinc-800 dark:active:bg-zinc-700 dark:text-zinc-200',
      ghost:
        'text-slate-600 hover:text-slate-900 hover:bg-slate-100 active:bg-slate-200 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800 dark:active:bg-zinc-700',
      danger:
        'bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white shadow-xs focus:ring-rose-500',
      amber:
        'bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white shadow-xs focus:ring-amber-500',
    };

    // Size styles
    const sizeStyles: Record<string, string> = {
      xs: 'px-2 py-1 text-[11px] gap-1',
      sm: 'px-3 py-1.5 text-xs gap-1.5',
      md: 'px-4 py-2 text-sm gap-2',
      lg: 'px-5 py-2.5 text-base gap-2.5',
    };

    const widthClass = fullWidth ? 'w-full' : '';

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled}
        className={`${baseStyles} ${variantStyles[variant] || variantStyles.secondary} ${sizeStyles[size] || sizeStyles.sm} ${widthClass} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
