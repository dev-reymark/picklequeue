import { useState, useEffect, useRef } from 'react';
import { formatDuration, formatOvertime } from '@/lib/utils';
import { playSoundEvent } from '@/lib/sound';

interface GameTimerProps {
  startedAt?: number;
  endsAt?: number;
  durationMinutes?: number;
  warningSeconds?: number;
  soundEnabled?: boolean;
}

export function useGameTimer({
  startedAt,
  endsAt,
  durationMinutes = 15,
  warningSeconds = 120,
  soundEnabled = true,
}: GameTimerProps) {
  const [now, setNow] = useState(Date.now());

  // Milestone alert flags so sounds trigger exactly once per milestone
  const milestonesFiredRef = useRef({
    warning2m: false,
    warning30s: false,
    timeUp: false,
  });

  // Reset flags when a new game starts
  useEffect(() => {
    milestonesFiredRef.current = {
      warning2m: false,
      warning30s: false,
      timeUp: false,
    };
  }, [startedAt, endsAt]);

  useEffect(() => {
    if (!endsAt) return;

    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [endsAt]);

  if (!endsAt || !startedAt) {
    return {
      formattedTime: '00:00',
      isEndingSoon: false,
      isUnder30s: false,
      isOvertime: false,
      progressPercent: 0,
      remainingMs: 0,
    };
  }

  const remainingMs = endsAt - now;
  const isOvertime = remainingMs <= 0;
  const overtimeMs = isOvertime ? Math.abs(remainingMs) : 0;
  const isEndingSoon = !isOvertime && remainingMs <= warningSeconds * 1000;
  const isUnder30s = !isOvertime && remainingMs <= 30 * 1000;

  // Check and trigger milestone sounds
  if (soundEnabled) {
    if (isEndingSoon && !isUnder30s && !milestonesFiredRef.current.warning2m) {
      milestonesFiredRef.current.warning2m = true;
      playSoundEvent('warning-2m');
    }

    if (isUnder30s && !isOvertime && !milestonesFiredRef.current.warning30s) {
      milestonesFiredRef.current.warning30s = true;
      playSoundEvent('warning-30s');
    }

    if (isOvertime && !milestonesFiredRef.current.timeUp) {
      milestonesFiredRef.current.timeUp = true;
      playSoundEvent('time-up');
    }
  }

  const totalDurationMs = durationMinutes * 60 * 1000;
  const elapsedMs = now - startedAt;
  const progressPercent = Math.min(100, Math.max(0, (elapsedMs / totalDurationMs) * 100));

  const formattedTime = isOvertime
    ? formatOvertime(overtimeMs)
    : formatDuration(remainingMs);

  return {
    formattedTime,
    isEndingSoon,
    isUnder30s,
    isOvertime,
    progressPercent,
    remainingMs: Math.max(0, remainingMs),
  };
}
