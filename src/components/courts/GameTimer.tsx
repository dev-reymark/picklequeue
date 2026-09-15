import React from 'react';
import { useGameTimer } from '@/hooks/use-game-timer';

interface GameTimerProps {
  startedAt?: number;
  endsAt?: number;
  durationMinutes?: number;
  warningSeconds?: number;
  soundEnabled?: boolean;
}

export const GameTimer: React.FC<GameTimerProps> = ({
  startedAt,
  endsAt,
  durationMinutes = 15,
  warningSeconds = 120,
  soundEnabled = true,
}) => {
  const { formattedTime, isEndingSoon, isOvertime, progressPercent } = useGameTimer({
    startedAt,
    endsAt,
    durationMinutes,
    warningSeconds,
    soundEnabled,
  });

  if (!startedAt || !endsAt) {
    return null;
  }

  // Determine timer color theme
  let timeColorClass = 'text-slate-900 dark:text-zinc-100';
  let barColorClass = 'bg-sky-500';
  let statusBadge = null;

  if (isOvertime) {
    timeColorClass = 'text-rose-600 dark:text-rose-400 animate-pulse';
    barColorClass = 'bg-rose-500';
    statusBadge = (
      <span className="px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider bg-rose-100 text-rose-700 border border-rose-200 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/40">
        Overtime
      </span>
    );
  } else if (isEndingSoon) {
    timeColorClass = 'text-amber-600 dark:text-amber-400 animate-pulse';
    barColorClass = 'bg-amber-500';
    statusBadge = (
      <span className="px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40">
        Ending Soon
      </span>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="flex items-center gap-2 mb-1">
        <span className={`text-4xl md:text-5xl font-bold tracking-tight tabular-nums ${timeColorClass}`}>
          {formattedTime}
        </span>
        {statusBadge}
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-[220px] h-1.5 bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden mt-1">
        <div
          className={`h-full transition-all duration-1000 ${barColorClass}`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
};
