import React from 'react';
import { useGameTimer } from '@/hooks/use-game-timer';

interface GameTimerProps {
  startedAt?: number;
  endsAt?: number;
  durationMinutes?: number;
  warningSeconds?: number;
  soundEnabled?: boolean;
  timerDirection?: 'countdown' | 'countup';
}

export const GameTimer: React.FC<GameTimerProps> = ({
  startedAt,
  endsAt,
  durationMinutes = 15,
  warningSeconds = 120,
  soundEnabled = true,
  timerDirection = 'countdown',
}) => {
  const { formattedTime, isEndingSoon, isOvertime, progressPercent } = useGameTimer({
    startedAt,
    endsAt,
    durationMinutes,
    warningSeconds,
    soundEnabled,
    timerDirection,
  });

  if (!startedAt || !endsAt) {
    return null;
  }

  // Determine timer color theme
  let timeColorClass = 'text-slate-900 dark:text-zinc-100';
  let barColorClass = 'bg-sky-500';

  if (isOvertime) {
    timeColorClass = 'text-rose-600 dark:text-rose-400 animate-pulse';
    barColorClass = 'bg-rose-500';
  } else if (isEndingSoon) {
    timeColorClass = 'text-amber-600 dark:text-amber-400 animate-pulse';
    barColorClass = 'bg-amber-500';
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="mb-1">
        <span className={`text-4xl md:text-5xl font-bold tracking-tight tabular-nums ${timeColorClass}`}>
          {formattedTime}
        </span>
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
