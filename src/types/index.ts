export type SkillLevel =
  | 'beginner'
  | 'low-intermediate'
  | 'high-intermediate'
  | 'advanced';

export type PlayerStatus =
  | 'waiting'
  | 'queued'
  | 'playing'
  | 'resting'
  | 'inactive'
  | 'available'; // Backward compatibility alias for 'waiting'

export interface Player {
  id: string;
  name: string;
  skillLevel: SkillLevel;
  status: PlayerStatus;
  createdAt: number;
  gamesPlayed: number;
  restGamesRemaining?: number;
}

export type MatchBalanceStatus = 'balanced' | 'slightly-unbalanced' | 'unbalanced';

export interface MatchBalanceResult {
  teamARating: number;
  teamBRating: number;
  diff: number;
  status: MatchBalanceStatus;
  statusLabel: string;
  qualityPercent: number;
}

export interface QueueGroup {
  id: string;
  playerIds: string[];
  teamAIds: string[];
  teamBIds: string[];
  balance: MatchBalanceResult;
  createdAt: number;
}

export type CourtStatus = 'available' | 'playing';

export interface Court {
  id: string;
  name: string;
  status: CourtStatus;
  playerIds: string[];
  teamAIds?: string[];
  teamBIds?: string[];
  balance?: MatchBalanceResult;
  startedAt?: number;
  endsAt?: number;
  durationMinutes?: number;
}

export interface GameRecord {
  id: string;
  courtId: string;
  courtName: string;
  playerIds: string[];
  teamAIds: string[];
  teamBIds: string[];
  startedAt: number;
  endedAt: number;
  durationMinutes: number;
}

export interface SessionInfo {
  id: string;
  venueName: string;
  sessionName: string;
  startedAt: number;
  endedAt?: number;
}

export type SoundProfile = 'standard' | 'minimal' | 'silent';

export type SoundEvent =
  | 'click'
  | 'player-added'
  | 'queue-created'
  | 'court-assigned'
  | 'warning-2m'
  | 'warning-30s'
  | 'time-up'
  | 'court-available'
  | 'error';

export type QueueMode = 'fifo' | 'skill-balanced';

export type PostGameAction = 'waiting-pool' | 'requeue' | 'resting' | 'remove';

export interface Settings {
  venueName: string;
  sessionName: string;
  courtCount: number;
  defaultGameDuration: number; // in minutes
  playersPerGroup: number; // 2 or 4
  queueMode: QueueMode;
  warningTimeSeconds: number; // e.g. 120s for ending soon
  allowOvertime: boolean;
  defaultPostGameAction: 'waiting-pool' | 'requeue' | 'resting';
  autoAssignNextGroup: boolean;
  minimumRestGames: number;
  soundEnabled: boolean;
  warningSoundEnabled: boolean;
  soundVolume: number;
  soundProfile: SoundProfile;
  uiSounds: boolean;
  queueSounds: boolean;
  timerSounds: boolean;
  vibrationEnabled: boolean;
  hasCompletedTutorial: boolean;
}

export const SKILL_RATINGS: Record<SkillLevel, number> = {
  beginner: 1,
  'low-intermediate': 2,
  'high-intermediate': 3,
  advanced: 4,
};

export const SKILL_CONFIG: Record<
  SkillLevel,
  {
    label: string;
    shortLabel: string;
    rating: number;
    colorDot: string;
    bgBadge: string;
    textBadge: string;
    borderBadge: string;
    solidBg: string;
  }
> = {
  beginner: {
    label: 'Beginner',
    shortLabel: 'B',
    rating: 1,
    colorDot: 'bg-emerald-500',
    bgBadge: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30',
    textBadge: 'text-emerald-700 dark:text-emerald-400',
    borderBadge: 'border-emerald-200 dark:border-emerald-500/30',
    solidBg: 'bg-emerald-600 text-white',
  },
  'low-intermediate': {
    label: 'Low Intermediate',
    shortLabel: 'LI',
    rating: 2,
    colorDot: 'bg-sky-500',
    bgBadge: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/30',
    textBadge: 'text-sky-700 dark:text-sky-400',
    borderBadge: 'border-sky-200 dark:border-sky-500/30',
    solidBg: 'bg-sky-600 text-white',
  },
  'high-intermediate': {
    label: 'High Intermediate',
    shortLabel: 'HI',
    rating: 3,
    colorDot: 'bg-purple-500',
    bgBadge: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/30',
    textBadge: 'text-purple-700 dark:text-purple-400',
    borderBadge: 'border-purple-200 dark:border-purple-500/30',
    solidBg: 'bg-purple-600 text-white',
  },
  advanced: {
    label: 'Advanced',
    shortLabel: 'A',
    rating: 4,
    colorDot: 'bg-amber-500',
    bgBadge: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30',
    textBadge: 'text-amber-700 dark:text-amber-400',
    borderBadge: 'border-amber-200 dark:border-amber-500/30',
    solidBg: 'bg-amber-600 text-white',
  },
};
