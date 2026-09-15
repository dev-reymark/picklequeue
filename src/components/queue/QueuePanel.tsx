import React from "react";
import { usePickleballStore } from "@/store/pickleball-store";
import { QueueGroupCard } from "./QueueGroupCard";
import { suggestBalancedGroup } from "@/lib/matchmaking";
import { Badge, Button } from "@/components/ui";
import { Users } from "lucide-react";

export const QueuePanel: React.FC = () => {
  const { queue, players, createQueueGroup } = usePickleballStore();

  const waitingPlayers = players.filter(
    (p) => p.status === "waiting" || (p.status as any) === "available",
  );

  const handleAutoBalancedGroup = () => {
    if (waitingPlayers.length < 4) return;
    const suggested = suggestBalancedGroup(waitingPlayers, 4);
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
          <Badge variant="neutral" size="sm">
            {queue.length}
          </Badge>
        </div>

        {waitingPlayers.length >= 4 && (
          <Button
            variant="secondary"
            size="xs"
            onClick={handleAutoBalancedGroup}
            className="text-xs"
          >
            Auto-Balance (4)
          </Button>
        )}
      </div>

      {/* Queue items */}
      <div className="flex-1 space-y-3 overflow-y-auto pr-1">
        {queue.length === 0 ? (
          <div className="h-52 flex flex-col items-center justify-center text-center p-4 rounded-xl border border-dashed border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/40">
            <Users className="w-8 h-8 text-slate-300 dark:text-zinc-600 mb-2" />
            <p className="text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-1">
              Queue is Empty
            </p>
            <p className="text-xs text-slate-400 dark:text-zinc-500 max-w-[200px]">
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
