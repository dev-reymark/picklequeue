import React from 'react';
import { usePickleballStore } from '@/store/pickleball-store';
import { QueueGroupCard } from './QueueGroupCard';
import { suggestBalancedGroup } from '@/lib/matchmaking';

export const QueuePanel: React.FC = () => {
  const { queue, players, createQueueGroup } = usePickleballStore();

  const availablePlayers = players.filter((p) => p.status === 'available');

  const handleAutoBalancedGroup = () => {
    if (availablePlayers.length < 4) return;
    const suggested = suggestBalancedGroup(availablePlayers, 4);
    createQueueGroup(suggested.map((p) => p.id));
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-900/70 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 sm:p-5 shadow-xs transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wide">
            Queue
          </h2>
          <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700">
            {queue.length}
          </span>
        </div>

        {availablePlayers.length >= 4 && (
          <button
            type="button"
            onClick={handleAutoBalancedGroup}
            className="text-xs font-medium px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-200 dark:border-zinc-700 transition"
          >
            Auto-Balance 4
          </button>
        )}
      </div>

      {/* Queue items */}
      <div className="flex-1 space-y-3 overflow-y-auto pr-1">
        {queue.length === 0 ? (
          <div className="h-48 flex flex-col items-center justify-center text-center p-4 rounded-xl border border-dashed border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/40">
            <p className="text-sm font-medium text-slate-600 dark:text-zinc-400 mb-1">
              Queue is Empty
            </p>
            <p className="text-xs text-slate-400 dark:text-zinc-400 max-w-[200px]">
              Select players from the waiting pool to create match groups.
            </p>
          </div>
        ) : (
          queue.map((group, index) => (
            <QueueGroupCard
              key={group.id}
              group={group}
              index={index}
              totalGroups={queue.length}
            />
          ))
        )}
      </div>
    </div>
  );
};
