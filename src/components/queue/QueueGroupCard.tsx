import React, { useState } from 'react';
import { ArrowUp, ArrowDown, X } from 'lucide-react';
import { QueueGroup, Player } from '@/types';
import { usePickleballStore } from '@/store/pickleball-store';
import { Badge, Button, Avatar, ConfirmAlert } from '@/components/ui';

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

  const [isDisbandAlertOpen, setIsDisbandAlertOpen] = useState(false);

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
          <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 flex items-center justify-center text-[11px] font-bold text-slate-800 dark:text-zinc-200">
            {index + 1}
          </span>
          <span className="text-xs font-bold text-slate-900 dark:text-zinc-100">
            Queue #{index + 1}
          </span>
          {group.balance && (
            <Badge
              variant={
                group.balance.status === 'balanced'
                  ? 'emerald'
                  : group.balance.status === 'slightly-unbalanced'
                  ? 'amber'
                  : 'rose'
              }
              size="sm"
            >
              {group.balance.statusLabel}
            </Badge>
          )}
        </div>

        {/* Reorder and Delete controls */}
        <div className="flex items-center gap-0.5">
          {index > 0 && (
            <button
              type="button"
              onClick={() => reorderQueue(index, index - 1)}
              title="Move Up in Queue"
              aria-label="Move Up in Queue"
              className="p-1 text-slate-400 hover:text-slate-800 dark:text-zinc-500 dark:hover:text-zinc-200 hover:bg-slate-200/80 dark:hover:bg-zinc-800 rounded-lg transition cursor-pointer"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          )}
          {index < totalGroups - 1 && (
            <button
              type="button"
              onClick={() => reorderQueue(index, index + 1)}
              title="Move Down in Queue"
              aria-label="Move Down in Queue"
              className="p-1 text-slate-400 hover:text-slate-800 dark:text-zinc-500 dark:hover:text-zinc-200 hover:bg-slate-200/80 dark:hover:bg-zinc-800 rounded-lg transition cursor-pointer"
            >
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsDisbandAlertOpen(true)}
            title="Disband Queue Group"
            aria-label="Disband Queue Group"
            className="p-1 text-slate-400 hover:text-rose-600 dark:text-zinc-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition cursor-pointer ml-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Team Breakdown */}
      <div className="grid grid-cols-2 gap-2.5 bg-white dark:bg-zinc-900/80 p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800/80 text-xs">
        {/* Team A */}
        <div className="min-w-0 pr-1">
          <div className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
            <span>Team A</span>
            {group.balance && (
              <span
                title={`Team A Rating: ${group.balance.teamARating}`}
                className="font-mono text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 shrink-0"
              >
                {group.balance.teamARating}
              </span>
            )}
          </div>
          <div className="space-y-1.5">
            {teamAPlayers.map((p) => (
              <div
                key={p.id}
                title={`${p.name} (${p.skillLevel})`}
                className="flex items-center gap-1.5 text-slate-800 dark:text-zinc-200 min-w-0"
              >
                <Avatar name={p.name} id={p.id} size="xs" />
                <span className="truncate font-medium text-xs flex-1">
                  {p.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Team B */}
        <div className="border-l border-slate-200 dark:border-zinc-800 pl-2.5 min-w-0">
          <div className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
            <span>Team B</span>
            {group.balance && (
              <span
                title={`Team B Rating: ${group.balance.teamBRating}`}
                className="font-mono text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 shrink-0"
              >
                {group.balance.teamBRating}
              </span>
            )}
          </div>
          <div className="space-y-1.5">
            {teamBPlayers.map((p) => (
              <div
                key={p.id}
                title={`${p.name} (${p.skillLevel})`}
                className="flex items-center gap-1.5 text-slate-800 dark:text-zinc-200 min-w-0"
              >
                <Avatar name={p.name} id={p.id} size="xs" />
                <span className="truncate font-medium text-xs flex-1">
                  {p.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Assignment button */}
      <div>
        {availableCourts.length > 0 ? (
          <Button
            variant="primary"
            size="sm"
            fullWidth
            onClick={handleQuickAssign}
            className="text-xs"
          >
            Assign to {availableCourts[0].name}
          </Button>
        ) : (
          <div className="text-center py-1.5 text-xs text-slate-400 dark:text-zinc-500 bg-slate-100/70 dark:bg-zinc-900/60 rounded-lg border border-slate-200/80 dark:border-zinc-800/60 font-medium">
            All courts occupied
          </div>
        )}
      </div>

      <ConfirmAlert
        isOpen={isDisbandAlertOpen}
        onClose={() => setIsDisbandAlertOpen(false)}
        onConfirm={() => removeQueueGroup(group.id)}
        variant="warning"
        title={`Disband Queue #${index + 1}?`}
        confirmText="Disband Queue"
        cancelText="Keep in Queue"
        message={
          <div className="space-y-2.5">
            <p className="text-slate-600 dark:text-zinc-400">
              Are you sure you want to disband this queued match? All players will be returned to the waiting pool.
            </p>
            {teamAPlayers.length + teamBPlayers.length > 0 && (
              <div className="p-2.5 rounded-xl bg-slate-100/90 dark:bg-zinc-800/80 border border-slate-200/80 dark:border-zinc-700/60 text-xs">
                <span className="font-semibold text-slate-700 dark:text-zinc-300 block mb-1.5">
                  Players returning to Waiting Pool:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[...teamAPlayers, ...teamBPlayers].map((p) => (
                    <span
                      key={p.id}
                      className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-zinc-200 font-medium text-xs shadow-2xs"
                    >
                      <Avatar name={p.name} id={p.id} size="xs" />
                      <span>{p.name}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        }
      />
    </div>
  );
};
