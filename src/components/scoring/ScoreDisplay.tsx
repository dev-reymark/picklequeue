import React from 'react';
import { Game, Court, Player } from '@/types';
import { usePickleballStore } from '@/store/pickleball-store';
import { Avatar } from '@/components/ui';
import { isMatchPoint } from '@/lib/scoring';

interface ScoreDisplayProps {
  game: Game;
  court: Court;
  showServing?: boolean;
}

export const ScoreDisplay: React.FC<ScoreDisplayProps> = ({
  game,
  showServing = true,
}) => {
  const { players } = usePickleballStore();
  const { score } = game;

  const teamAPlayers = (game.teamA.playerIds || [])
    .map((id) => players.find((p) => p.id === id))
    .filter(Boolean) as Player[];

  const teamBPlayers = (game.teamB.playerIds || [])
    .map((id) => players.find((p) => p.id === id))
    .filter(Boolean) as Player[];

  const teamANames =
    teamAPlayers.length > 0
      ? teamAPlayers.map((p) => p.name.split(' ')[0]).join(' & ')
      : 'Team A';

  const teamBNames =
    teamBPlayers.length > 0
      ? teamBPlayers.map((p) => p.name.split(' ')[0]).join(' & ')
      : 'Team B';

  const matchPointInfo = isMatchPoint(score);
  const isTeamALeading = score.teamA > score.teamB;
  const isTeamBLeading = score.teamB > score.teamA;
  const isServingA = showServing && score.servingTeam === 'A';
  const isServingB = showServing && score.servingTeam === 'B';

  return (
    <div className="w-full">
      {/* Match Point Alert Bar */}
      {matchPointInfo && !score.winner && (
        <div className="mb-2 py-0.5 px-2.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-[10px] font-bold tracking-wider uppercase text-center animate-pulse">
          Match Point &bull; Team {matchPointInfo.team}
        </div>
      )}

      {/* Main Score Board */}
      <div className="bg-slate-50/90 dark:bg-zinc-950/80 rounded-2xl p-3 border border-slate-200 dark:border-zinc-800/80 shadow-inner">
        <div className="grid grid-cols-2 gap-3 items-center divide-x divide-slate-200 dark:divide-zinc-800">
          {/* Team A */}
          <div
            className={`flex flex-col items-center text-center p-1 rounded-xl transition-all ${
              isServingA
                ? 'bg-emerald-500/5 ring-1 ring-emerald-500/30 dark:ring-emerald-400/20'
                : ''
            }`}
          >
            {/* Header: Team Label & Players */}
            <div className="flex items-center gap-1.5 mb-1 max-w-full">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Team A
              </span>
              {isServingA && (
                <span
                  title="Serving Team"
                  className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"
                />
              )}
            </div>

            {/* Player Avatars & First Names */}
            <div className="flex items-center gap-1 mb-1 max-w-full px-1">
              <div className="flex -space-x-1.5 shrink-0">
                {teamAPlayers.slice(0, 2).map((p) => (
                  <Avatar key={p.id} name={p.name} id={p.id} size="xs" />
                ))}
              </div>
              <span
                title={teamAPlayers.map((p) => p.name).join(', ')}
                className="text-xs font-semibold text-slate-800 dark:text-zinc-200 truncate"
              >
                {teamANames}
              </span>
            </div>

            {/* Score Digit (Big, bold, tabular numbers) */}
            <div
              className={`text-5xl font-bold tabular-nums tracking-tight leading-none my-1 select-none transition-transform duration-150 ${
                isTeamALeading
                  ? 'text-emerald-600 dark:text-emerald-400 font-black scale-105'
                  : 'text-slate-900 dark:text-zinc-100'
              }`}
            >
              {score.teamA}
            </div>

            {/* Serving status sub-badge */}
            {showServing && score.scoringMode === 'side-out' && isServingA && (
              <span className="mt-0.5 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                Server {score.serverNumber ?? 1}
              </span>
            )}
          </div>

          {/* Team B */}
          <div
            className={`flex flex-col items-center text-center p-1 rounded-xl pl-3 transition-all ${
              isServingB
                ? 'bg-emerald-500/5 ring-1 ring-emerald-500/30 dark:ring-emerald-400/20'
                : ''
            }`}
          >
            {/* Header: Team Label & Players */}
            <div className="flex items-center gap-1.5 mb-1 max-w-full">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Team B
              </span>
              {isServingB && (
                <span
                  title="Serving Team"
                  className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"
                />
              )}
            </div>

            {/* Player Avatars & First Names */}
            <div className="flex items-center gap-1 mb-1 max-w-full px-1">
              <div className="flex -space-x-1.5 shrink-0">
                {teamBPlayers.slice(0, 2).map((p) => (
                  <Avatar key={p.id} name={p.name} id={p.id} size="xs" />
                ))}
              </div>
              <span
                title={teamBPlayers.map((p) => p.name).join(', ')}
                className="text-xs font-semibold text-slate-800 dark:text-zinc-200 truncate"
              >
                {teamBNames}
              </span>
            </div>

            {/* Score Digit (Big, bold, tabular numbers) */}
            <div
              className={`text-5xl font-bold tabular-nums tracking-tight leading-none my-1 select-none transition-transform duration-150 ${
                isTeamBLeading
                  ? 'text-emerald-600 dark:text-emerald-400 font-black scale-105'
                  : 'text-slate-900 dark:text-zinc-100'
              }`}
            >
              {score.teamB}
            </div>

            {/* Serving status sub-badge */}
            {showServing && score.scoringMode === 'side-out' && isServingB && (
              <span className="mt-0.5 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                Server {score.serverNumber ?? 1}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
