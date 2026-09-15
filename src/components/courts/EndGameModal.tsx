import React, { useState } from 'react';
import { Court, PostGameAction, Player } from '@/types';
import { usePickleballStore } from '@/store/pickleball-store';
import { Modal, Button, Avatar } from '@/components/ui';

interface EndGameModalProps {
  court: Court;
  onClose: () => void;
}

export const EndGameModal: React.FC<EndGameModalProps> = ({ court, onClose }) => {
  const { players, endGame, settings } = usePickleballStore();
  const [selectedAction, setSelectedAction] = useState<PostGameAction>(
    settings.defaultPostGameAction || 'waiting-pool'
  );

  const courtPlayers = court.playerIds
    .map((id) => players.find((p) => p.id === id))
    .filter(Boolean) as Player[];

  const handleConfirm = () => {
    endGame(court.id, selectedAction);
    onClose();
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={`End Game: ${court.name}`}
      description="Select rotation workflow for these players"
      maxWidth="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirm}>
            Confirm &amp; End Match
          </Button>
        </>
      }
    >
      {/* Players in match */}
      <div className="bg-slate-50 dark:bg-zinc-950 rounded-xl p-3.5 border border-slate-200 dark:border-zinc-800/80">
        <div className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
          Match Players ({courtPlayers.length})
        </div>
        <div className="grid grid-cols-2 gap-2">
          {courtPlayers.map((p) => (
            <div
              key={p.id}
              title={`${p.name} (${p.skillLevel})`}
              className="flex items-center gap-2 bg-white dark:bg-zinc-900/90 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 min-w-0"
            >
              <Avatar name={p.name} id={p.id} size="xs" />
              <span className="text-xs font-medium text-slate-800 dark:text-zinc-200 truncate flex-1">
                {p.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Requeue Options */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 uppercase tracking-wider block">
          What should happen to the players?
        </label>

        {/* Option 1: Return to waiting pool */}
        <div
          onClick={() => setSelectedAction('waiting-pool')}
          className={`cursor-pointer p-2.5 rounded-xl border transition select-none ${
            selectedAction === 'waiting-pool'
              ? 'bg-emerald-50 border-emerald-400 text-slate-900 dark:bg-emerald-500/10 dark:border-emerald-500/50 dark:text-zinc-100'
              : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-400'
          }`}
        >
          <span className="text-xs font-semibold text-slate-900 dark:text-zinc-200">
            Return to Waiting Pool
          </span>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
            Available immediately in pool for next group selection.
          </p>
        </div>

        {/* Option 2: Add to end of queue */}
        <div
          onClick={() => setSelectedAction('requeue')}
          className={`cursor-pointer p-2.5 rounded-xl border transition select-none ${
            selectedAction === 'requeue'
              ? 'bg-sky-50 border-sky-400 text-slate-900 dark:bg-sky-500/10 dark:border-sky-500/50 dark:text-zinc-100'
              : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-400'
          }`}
        >
          <span className="text-xs font-semibold text-slate-900 dark:text-zinc-200">
            Add to End of Queue
          </span>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
            Keeps this 4-player group together and queues for next court.
          </p>
        </div>

        {/* Option 3: Mark as resting */}
        <div
          onClick={() => setSelectedAction('resting')}
          className={`cursor-pointer p-2.5 rounded-xl border transition select-none ${
            selectedAction === 'resting'
              ? 'bg-amber-50 border-amber-400 text-slate-900 dark:bg-amber-500/10 dark:border-amber-500/50 dark:text-zinc-100'
              : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-400'
          }`}
        >
          <span className="text-xs font-semibold text-slate-900 dark:text-zinc-200">
            Mark as Resting
          </span>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
            Players take a break before returning to the active waiting pool.
          </p>
        </div>

        {/* Option 4: Remove from session */}
        <div
          onClick={() => setSelectedAction('remove')}
          className={`cursor-pointer p-2.5 rounded-xl border transition select-none ${
            selectedAction === 'remove'
              ? 'bg-slate-200 border-slate-400 text-slate-900 dark:bg-zinc-800 dark:border-zinc-600 dark:text-zinc-100'
              : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-400'
          }`}
        >
          <span className="text-xs font-semibold text-slate-900 dark:text-zinc-200">
            Check Out / Inactive
          </span>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
            Player has left the venue; preserves session games history.
          </p>
        </div>
      </div>
    </Modal>
  );
};
