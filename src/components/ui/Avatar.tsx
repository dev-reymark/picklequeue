import React, { useState } from 'react';
import { getAvatarUrl, getInitials, getInitialsGradient } from '@/lib/avatar';
import { PlayerStatus } from '@/types';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  name?: string;
  id?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  status?: PlayerStatus;
  alt?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name = '',
  id,
  size = 'md',
  status,
  alt,
  className = '',
  ...props
}) => {
  const [imageError, setImageError] = useState(false);

  // Determine avatar image source (custom src > deterministic memoji from name or id)
  const resolvedSrc = src || getAvatarUrl(id || name);
  const initials = getInitials(name);
  const gradientClass = getInitialsGradient(id || name);

  const sizeStyles: Record<string, { container: string; text: string; statusDot: string }> = {
    xs: {
      container: 'w-5 h-5 min-w-[20px]',
      text: 'text-[9px]',
      statusDot: 'w-1.5 h-1.5 -bottom-0.5 -right-0.5 border',
    },
    sm: {
      container: 'w-7 h-7 min-w-[28px]',
      text: 'text-[11px]',
      statusDot: 'w-2 h-2 -bottom-0.5 -right-0.5 border-1.5',
    },
    md: {
      container: 'w-9 h-9 min-w-[36px]',
      text: 'text-xs',
      statusDot: 'w-2.5 h-2.5 bottom-0 right-0 border-2',
    },
    lg: {
      container: 'w-12 h-12 min-w-[48px]',
      text: 'text-sm',
      statusDot: 'w-3 h-3 bottom-0 right-0 border-2',
    },
    xl: {
      container: 'w-16 h-16 min-w-[64px]',
      text: 'text-base',
      statusDot: 'w-3.5 h-3.5 bottom-0.5 right-0.5 border-2',
    },
  };

  const statusColors: Record<string, string> = {
    waiting: 'bg-emerald-500',
    available: 'bg-emerald-500',
    playing: 'bg-sky-500',
    queued: 'bg-purple-500',
    resting: 'bg-amber-500',
    inactive: 'bg-slate-400',
  };

  const selectedSize = sizeStyles[size] || sizeStyles.md;

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 rounded-full select-none ${selectedSize.container} ${className}`}
      {...props}
    >
      <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center bg-slate-100 dark:bg-zinc-800 border border-slate-200/80 dark:border-zinc-700/80 shadow-2xs">
        {!imageError && resolvedSrc ? (
          <img
            src={resolvedSrc}
            alt={alt || name || 'Player avatar'}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div
            className={`w-full h-full bg-linear-to-br ${gradientClass} flex items-center justify-center text-white font-bold tracking-wider ${selectedSize.text}`}
          >
            {initials}
          </div>
        )}
      </div>

      {status && statusColors[status] && (
        <span
          title={`Status: ${status}`}
          className={`absolute rounded-full border-white dark:border-zinc-900 ${statusColors[status]} ${selectedSize.statusDot}`}
        />
      )}
    </div>
  );
};
