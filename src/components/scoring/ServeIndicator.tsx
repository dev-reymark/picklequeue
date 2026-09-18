import React from 'react';
import { Game, Team } from '@/types';
import { usePickleballStore } from '@/store/pickleball-store';
import { formatThreePartScore } from '@/lib/scoring';

interface ServeIndicatorProps {
  game: Game;
}

export const ServeIndicator: React.FC<ServeIndicatorProps> = ({ game }) => {
  const { setServingDetails } = usePickleballStore();
  const { score } = game;
  const servingTeam = score.servingTeam || 'A';
  const serverNumber = score.serverNumber ?? 1;

  const toggleServingTeam = () => {
    const nextTeam: Team = servingTeam === 'A' ? 'B' : 'A';
    setServingDetails(game.id, nextTeam, serverNumber);
  };

  const toggleServerNumber = () => {
    const nextServer: 1 | 2 = serverNumber === 1 ? 2 : 1;
    setServingDetails(game.id, servingTeam, nextServer);
  };

  return (
    <div className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-xl bg-slate-100/80 dark:bg-zinc-900/90 border border-slate-200/80 dark:border-zinc-800 text-xs">
      {/* 3-Part Call or Serving Team */}
      <div className="flex items-center gap-2 min-w-0">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
        <button
          type="button"
          onClick={toggleServingTeam}
          title="Click to toggle serving team"
          className="font-bold text-slate-800 dark:text-zinc-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition cursor-pointer flex items-center gap-1 truncate"
        >
          <span>Serve: Team {servingTeam}</span>
          <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-normal underline">
            (switch)
          </span>
        </button>
      </div>

      {/* Side-Out 3-part Score Call & Server Number Toggle */}
      {score.scoringMode === 'side-out' && (
        <div className="flex items-center gap-2 shrink-0">
          <span
            title="Official three-part score call (Server Score - Receiver Score - Server Number)"
            className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
          >
            Call: {formatThreePartScore(score)}
          </span>

          <button
            type="button"
            onClick={toggleServerNumber}
            title="Toggle Server 1 / Server 2"
            className="px-1.5 py-0.5 text-[10px] font-mono font-bold rounded bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-300 dark:hover:bg-zinc-700 transition cursor-pointer"
          >
            S{serverNumber}
          </button>
        </div>
      )}
    </div>
  );
};
