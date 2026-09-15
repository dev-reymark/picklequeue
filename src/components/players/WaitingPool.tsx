import { playSound } from '@/lib/sound';
import React, { useState } from 'react';
import { Player, PlayerStatus } from '@/types';
import { usePickleballStore } from '@/store/pickleball-store';
import { PlayerBadge } from './PlayerBadge';
import { AddPlayerModal } from './AddPlayerModal';
import { calculateBestTeams, suggestBalancedGroup } from '@/lib/matchmaking';

interface WaitingPoolProps {
  onOpenPlayerList: () => void;
}

export const WaitingPool: React.FC<WaitingPoolProps> = ({ onOpenPlayerList }) => {
  const { players, createQueueGroup, setPlayerStatus } = usePickleballStore();
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [poolFilter, setPoolFilter] = useState<'waiting' | 'resting' | 'all'>('waiting');

  const waitingPlayers = players.filter((p) => p.status === 'waiting' || (p.status as any) === 'available');
  const restingPlayers = players.filter((p) => p.status === 'resting');

  const displayedPlayers =
    poolFilter === 'waiting'
      ? waitingPlayers
      : poolFilter === 'resting'
      ? restingPlayers
      : players.filter((p) => p.status !== 'playing' && p.status !== 'queued');

  const toggleSelectPlayer = (id: string) => {
    setSelectedPlayerIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleCreateGroupFromSelected = () => {
    if (selectedPlayerIds.length < 2) return;
    playSound.groupCreated();
    createQueueGroup(selectedPlayerIds);
    setSelectedPlayerIds([]);
  };

  const handleAutoGroup = () => {
    if (waitingPlayers.length < 4) return;
    const suggested = suggestBalancedGroup(waitingPlayers, 4);
    playSound.groupCreated();
    createQueueGroup(suggested.map((p) => p.id));
  };

  const toggleRestingStatus = (e: React.MouseEvent, player: Player) => {
    e.stopPropagation();
    const newStatus: PlayerStatus = player.status === 'resting' ? 'waiting' : 'resting';
    setPlayerStatus(player.id, newStatus);
    setSelectedPlayerIds((prev) => prev.filter((id) => id !== player.id));
  };

  // Preview match balance if players checked
  const selectedObjects = selectedPlayerIds
    .map((id) => players.find((p) => p.id === id))
    .filter(Boolean) as Player[];

  const previewMatch =
    selectedObjects.length >= 2 ? calculateBestTeams(selectedObjects) : null;

  return (
    <>
      <div
        id="waiting-players-section"
        className="bg-white dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 sm:p-5 space-y-4 shadow-xs transition-colors"
      >
        {/* Pool Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wide">
                Waiting Players
              </h2>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700">
                {waitingPlayers.length} ready
              </span>
            </div>

            {/* Filter pills */}
            <div className="flex items-center gap-1 text-xs">
              <button
                type="button"
                onClick={() => setPoolFilter('waiting')}
                className={`px-2.5 py-1 rounded-lg transition font-medium ${
                  poolFilter === 'waiting'
                    ? 'bg-slate-900 text-white dark:bg-zinc-800 dark:text-zinc-100'
                    : 'text-slate-500 hover:text-slate-900 dark:text-zinc-400'
                }`}
              >
                Waiting ({waitingPlayers.length})
              </button>
              {restingPlayers.length > 0 && (
                <button
                  type="button"
                  onClick={() => setPoolFilter('resting')}
                  className={`px-2.5 py-1 rounded-lg transition font-medium ${
                    poolFilter === 'resting'
                      ? 'bg-amber-600 text-white'
                      : 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                  }`}
                >
                  Resting ({restingPlayers.length})
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenPlayerList}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-200 dark:border-zinc-700 transition"
            >
              All Players ({players.length})
            </button>

            {waitingPlayers.length >= 4 && (
              <button
                type="button"
                onClick={handleAutoGroup}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-emerald-400 dark:border-zinc-700 transition"
              >
                Auto-Balance Group (4)
              </button>
            )}

            <button
              id="add-player-btn"
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-xs"
            >
              + Add Player (N)
            </button>
          </div>
        </div>

        {/* Selected bar if players checked */}
        {selectedPlayerIds.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-zinc-700/80 animate-in fade-in duration-150">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                Selected: {selectedPlayerIds.length} players
              </span>
              {previewMatch && (
                <span
                  className={`text-[11px] font-medium px-2 py-0.5 rounded border ${
                    previewMatch.balance.status === 'balanced'
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:text-emerald-400 dark:bg-emerald-500/10'
                      : previewMatch.balance.status === 'slightly-unbalanced'
                      ? 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:text-amber-400 dark:bg-amber-500/10'
                      : 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:text-rose-400 dark:bg-rose-500/10'
                  }`}
                >
                  {previewMatch.balance.statusLabel} ({previewMatch.balance.qualityPercent}%)
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedPlayerIds([])}
                className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200"
              >
                Deselect
              </button>
              <button
                type="button"
                onClick={handleCreateGroupFromSelected}
                className="px-3.5 py-1 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-xs"
              >
                Create Queue Group ({selectedPlayerIds.length})
              </button>
            </div>
          </div>
        )}

        {/* Players Chips Grid */}
        {displayedPlayers.length === 0 ? (
          <div className="py-8 text-center border border-dashed border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50/50 dark:bg-zinc-950/40">
            <p className="text-sm font-medium text-slate-600 dark:text-zinc-400 mb-1">
              {poolFilter === 'resting' ? 'No resting players' : 'No players waiting'}
            </p>
            <p className="text-xs text-slate-400 dark:text-zinc-400 mb-3">
              {poolFilter === 'resting'
                ? 'All players are currently active or playing.'
                : 'All registered players are either queued or currently playing.'}
            </p>
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="px-3.5 py-1.5 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-200 dark:border-zinc-700 transition"
            >
              Add New Player
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {displayedPlayers.map((player) => {
              const isSelected = selectedPlayerIds.includes(player.id);
              const isResting = player.status === 'resting';
              return (
                <div
                  key={player.id}
                  onClick={() => toggleSelectPlayer(player.id)}
                  className={`cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border transition select-none ${
                    isSelected
                      ? 'bg-slate-100 border-slate-400 ring-1 ring-slate-400 text-slate-950 dark:bg-zinc-800 dark:border-zinc-500 dark:ring-zinc-500 dark:text-zinc-100'
                      : isResting
                      ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/60 text-amber-800 dark:text-amber-300'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700 dark:bg-zinc-950 dark:border-zinc-800 dark:hover:border-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}}
                    className="rounded bg-white dark:bg-zinc-900 border-slate-300 dark:border-zinc-700 text-emerald-500 focus:ring-0 w-3.5 h-3.5"
                  />
                  <span className="text-xs font-medium">{player.name}</span>
                  <PlayerBadge skillLevel={player.skillLevel} compact />
                  {player.gamesPlayed > 0 && (
                    <span className="text-[10px] text-slate-400 dark:text-zinc-400 font-mono">
                      {player.gamesPlayed}G
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={(e) => toggleRestingStatus(e, player)}
                    title={isResting ? 'Return to Active Waiting' : 'Mark as Resting'}
                    className={`text-[10px] px-1.5 py-0.5 rounded font-semibold transition ${
                      isResting
                        ? 'bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200'
                        : 'text-slate-400 hover:text-slate-700 hover:bg-slate-200 dark:hover:bg-zinc-800 dark:hover:text-zinc-200'
                    }`}
                  >
                    {isResting ? 'Resting' : 'Rest'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <AddPlayerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </>
  );
};
