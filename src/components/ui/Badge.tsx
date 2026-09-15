import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'neutral' | 'emerald' | 'sky' | 'amber' | 'rose' | 'purple' | 'outline';
  size?: 'sm' | 'md';
  dot?: boolean;
  dotColor?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'sm',
  dot = false,
  dotColor,
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center font-semibold rounded-md border select-none';

  const variantStyles: Record<string, { badge: string; defaultDot: string }> = {
    neutral: {
      badge:
        'bg-slate-100 text-slate-700 border-slate-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700',
      defaultDot: 'bg-slate-500 dark:bg-zinc-400',
    },
    emerald: {
      badge:
        'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30',
      defaultDot: 'bg-emerald-500',
    },
    sky: {
      badge:
        'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/30',
      defaultDot: 'bg-sky-500',
    },
    amber: {
      badge:
        'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30',
      defaultDot: 'bg-amber-500',
    },
    rose: {
      badge:
        'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/30',
      defaultDot: 'bg-rose-500',
    },
    purple: {
      badge:
        'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/30',
      defaultDot: 'bg-purple-500',
    },
    outline: {
      badge: 'bg-transparent text-slate-700 border-slate-300 dark:text-zinc-300 dark:border-zinc-700',
      defaultDot: 'bg-slate-400 dark:bg-zinc-500',
    },
  };

  const sizeStyles: Record<string, string> = {
    sm: 'px-2 py-0.5 text-[11px] gap-1.5',
    md: 'px-2.5 py-1 text-xs gap-1.5',
  };

  const selectedVariant = variantStyles[variant] || variantStyles.neutral;
  const activeDotColor = dotColor || selectedVariant.defaultDot;

  return (
    <span
      className={`${baseStyles} ${selectedVariant.badge} ${sizeStyles[size] || sizeStyles.sm} ${className}`}
      {...props}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${activeDotColor}`} />}
      {children}
    </span>
  );
};
