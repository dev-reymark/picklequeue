import React from 'react';
import { QueueGroup, Player } from '@/types';
import { usePickleballStore } from '@/store/pickleball-store';
import { PlayerBadge } from '../players/PlayerBadge';

interface QueueGroupCardProps {
  group: QueueGroup;
  index: number;
  totalGroups: number;
}

export const QueueGroupCard: React.FC<QueueGroupCardProps> = ({
  group,
  index,
  totalGroups,
}) => {
  const {
    players,
    courts,
    removeQueueGroup,
    reorderQueue,
    assignGroupToCourt,
  } = usePickleballStore();

  const groupPlayers = group.playerIds
    .map((id) => players.find((p) => p.id === id))
    .filter(Boolean) as Player[];

  const teamAPlayers = group.teamAIds
    .map((id) => players.find((p) => p.id === id))
    .filter(Boolean) as Player[];

  const teamBPlayers = group.teamBIds
    .map((id) => players.find((p) => p.id === id))
    .filter(Boolean) as Player[];

  const availableCourts = courts.filter((c) => c.status === 'available');

  const handleQuickAssign = () => {
    if (availableCourts.length > 0) {
      assignGroupToCourt(group.id, availableCourts[0].id);
    }
  };

  return (
    <div className="bg-slate-50/80 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 space-y-3 hover:border-slate-300 dark:hover:border-zinc-700 transition shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 flex items-center justify-center text-xs font-bold text-slate-800 dark:text-zinc-200">
            {index + 1}
          </span>
          <span className="text-xs font-semibold text-slate-800 dark:text-zinc-300">
            Queue #{index + 1}
          </span>
          {group.balance && (
            <span
              className={`text-[10px] font-medium px-2 py-0.5 rounded border ${
                group.balance.status === 'balanced'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:text-emerald-400 dark:bg-emerald-500/10'
                  : group.balance.status === 'slightly-unbalanced'
                  ? 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:text-amber-400 dark:bg-amber-500/10'
                  : 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:text-rose-400 dark:bg-rose-500/10'
              }`}
            >
              {group.balance.statusLabel}
            </span>
          )}
        </div>

        {/* Reorder and Delete controls */}
        <div className="flex items-center gap-1">
          {index > 0 && (
            <button
              type="button"
              onClick={() => reorderQueue(index, index - 1)}
              title="Move Up in Queue"
              className="px-1.5 py-0.5 text-xs text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-slate-200 dark:hover:bg-zinc-800 rounded transition"
            >
              ↑
            </button>
          )}
          {index < totalGroups - 1 && (
            <button
              type="button"
              onClick={() => reorderQueue(index, index + 1)}
              title="Move Down in Queue"
              className="px-1.5 py-0.5 text-xs text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-slate-200 dark:hover:bg-zinc-800 rounded transition"
            >
              ↓
            </button>
          )}
          <button
            type="button"
            onClick={() => removeQueueGroup(group.id)}
            title="Remove from Queue"
            className="px-1.5 py-0.5 text-xs text-slate-400 hover:text-rose-600 dark:text-zinc-500 dark:hover:text-rose-400 hover:bg-slate-200 dark:hover:bg-zinc-800 rounded transition font-bold"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Team Breakdown */}
      <div className="grid grid-cols-2 gap-2 bg-white dark:bg-zinc-900/80 p-2.5 rounded-lg border border-slate-200 dark:border-zinc-800/80 text-xs">
        <div>
          <div className="text-[10px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-1 flex justify-between">
            <span>Team A</span>
            {group.balance && <span className="font-mono">{group.balance.teamARating}</span>}
          </div>
          <div className="space-y-1">
            {teamAPlayers.map((p) => (
              <div key={p.id} className="flex items-center justify-between text-slate-800 dark:text-zinc-200">
                <span className="truncate pr-1">{p.name}</span>
                <PlayerBadge skillLevel={p.skillLevel} compact />
              </div>
            ))}
          </div>
        </div>

        <div className="border-l border-slate-200 dark:border-zinc-800 pl-2">
          <div className="text-[10px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-1 flex justify-between">
            <span>Team B</span>
            {group.balance && <span className="font-mono">{group.balance.teamBRating}</span>}
          </div>
          <div className="space-y-1">
            {teamBPlayers.map((p) => (
              <div key={p.id} className="flex items-center justify-between text-slate-800 dark:text-zinc-200">
                <span className="truncate pr-1">{p.name}</span>
                <PlayerBadge skillLevel={p.skillLevel} compact />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Assignment button */}
      <div className="flex items-center gap-2">
        {availableCourts.length > 0 ? (
          <button
            type="button"
            onClick={handleQuickAssign}
            className="flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-xs text-center"
          >
            Assign to {availableCourts[0].name}
          </button>
        ) : (
          <div className="flex-1 text-center py-1.5 text-xs text-slate-400 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-900/60 rounded-lg border border-slate-200 dark:border-zinc-800/60">
            All courts occupied
          </div>
        )}
      </div>
    </div>
  );
};
