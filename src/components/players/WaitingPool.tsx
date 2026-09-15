import React, { useState } from 'react';
import { Users, UserPlus, Sparkles, Coffee } from 'lucide-react';
import { Player, PlayerStatus } from '@/types';
import { usePickleballStore } from '@/store/pickleball-store';
import { playSound } from '@/lib/sound';
import { calculateBestTeams, suggestBalancedGroup } from '@/lib/matchmaking';
import { Card, Badge, Button, Checkbox, Avatar } from '@/components/ui';
import { PlayerBadge } from './PlayerBadge';
import { AddPlayerModal } from './AddPlayerModal';

interface WaitingPoolProps {
  onOpenPlayerList: () => void;
}

export const WaitingPool: React.FC<WaitingPoolProps> = ({ onOpenPlayerList }) => {
  const { players, createQueueGroup, setPlayerStatus } = usePickleballStore();
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [poolFilter, setPoolFilter] = useState<'waiting' | 'resting' | 'all'>('waiting');

  const waitingPlayers = players.filter(
    (p) => p.status === 'waiting' || (p.status as any) === 'available'
  );
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
      <Card
        id="waiting-players-section"
        className="p-4 sm:p-5 space-y-4"
      >
        {/* Pool Header: Responsive 2-column or stacked layout */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5 pb-3.5 border-b border-slate-100 dark:border-zinc-800">
          <div className="flex flex-wrap items-center justify-between sm:justify-start gap-2.5">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wide">
                Waiting Players
              </h2>
              <Badge variant="neutral" size="sm">
                {waitingPlayers.length} ready
              </Badge>
            </div>

            {/* Filter pills */}
            <div className="inline-flex items-center p-1 bg-slate-100 dark:bg-zinc-800/80 rounded-lg border border-slate-200/80 dark:border-zinc-700/60 text-xs">
              <button
                type="button"
                onClick={() => setPoolFilter('waiting')}
                className={`px-3 py-1 rounded-md font-semibold text-xs transition min-h-[30px] cursor-pointer touch-manipulation ${
                  poolFilter === 'waiting'
                    ? 'bg-white text-slate-900 shadow-xs dark:bg-zinc-700 dark:text-zinc-100'
                    : 'text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-200'
                }`}
              >
                Waiting ({waitingPlayers.length})
              </button>
              <button
                type="button"
                onClick={() => setPoolFilter('resting')}
                className={`px-3 py-1 rounded-md font-semibold text-xs transition min-h-[30px] cursor-pointer touch-manipulation ${
                  poolFilter === 'resting'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : restingPlayers.length > 0
                    ? 'text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300'
                    : 'text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-400'
                }`}
              >
                Resting ({restingPlayers.length})
              </button>
            </div>
          </div>

          {/* Action Buttons: Touch friendly & wrap cleanly on mobile */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full md:w-auto">
            <Button
              variant="secondary"
              size="sm"
              onClick={onOpenPlayerList}
              className="flex-1 sm:flex-none text-xs"
            >
              <Users className="w-3.5 h-3.5 mr-1 shrink-0" />
              All Players ({players.length})
            </Button>

            {waitingPlayers.length >= 4 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleAutoGroup}
                className="flex-1 sm:flex-none text-xs border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1 shrink-0" />
                Auto-Balance (4)
              </Button>
            )}

            <Button
              id="add-player-btn"
              variant="primary"
              size="sm"
              onClick={() => setIsAddModalOpen(true)}
              className="w-full sm:w-auto text-xs"
            >
              <UserPlus className="w-3.5 h-3.5 mr-1 shrink-0" />
              Add Player <span className="opacity-70 text-[10px] ml-0.5 font-normal">(N)</span>
            </Button>
          </div>
        </div>

        {/* Selected bar if players checked */}
        {selectedPlayerIds.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200 dark:border-emerald-800/60 shadow-2xs animate-in fade-in duration-150">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                Selected: {selectedPlayerIds.length} {selectedPlayerIds.length === 1 ? 'player' : 'players'}
              </span>
              {previewMatch && (
                <Badge
                  variant={
                    previewMatch.balance.status === 'balanced'
                      ? 'emerald'
                      : previewMatch.balance.status === 'slightly-unbalanced'
                      ? 'amber'
                      : 'rose'
                  }
                  size="sm"
                >
                  {previewMatch.balance.statusLabel} ({previewMatch.balance.qualityPercent}%)
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedPlayerIds([])}
                className="text-xs text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200"
              >
                Deselect
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={selectedPlayerIds.length < 2}
                onClick={handleCreateGroupFromSelected}
                className="flex-1 sm:flex-none text-xs"
              >
                <Users className="w-3.5 h-3.5 mr-1 shrink-0" />
                Create Queue Group ({selectedPlayerIds.length})
              </Button>
            </div>
          </div>
        )}

        {/* Players Chips Grid */}
        {displayedPlayers.length === 0 ? (
          <div className="py-8 px-4 text-center border border-dashed border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50/50 dark:bg-zinc-950/40">
            {poolFilter === 'resting' ? (
              <Coffee className="w-8 h-8 mx-auto text-amber-500/70 mb-2" />
            ) : (
              <Users className="w-8 h-8 mx-auto text-slate-400 dark:text-zinc-500 mb-2" />
            )}
            <p className="text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-1">
              {poolFilter === 'resting' ? 'No resting players' : 'No players waiting'}
            </p>
            <p className="text-xs text-slate-400 dark:text-zinc-500 mb-3 max-w-sm mx-auto">
              {poolFilter === 'resting'
                ? 'All registered players are currently active in the waiting pool or playing.'
                : 'All registered players are either queued or currently playing on courts.'}
            </p>
            {poolFilter === 'resting' ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPoolFilter('waiting')}
                className="text-xs"
              >
                View Waiting Players
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsAddModalOpen(true)}
                className="text-xs"
              >
                <UserPlus className="w-3.5 h-3.5 mr-1" />
                Add New Player
              </Button>
            )}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 sm:gap-2.5">
            {displayedPlayers.map((player) => {
              const isSelected = selectedPlayerIds.includes(player.id);
              const isResting = player.status === 'resting';
              return (
                <div
                  key={player.id}
                  role="checkbox"
                  aria-checked={isSelected}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === ' ' || e.key === 'Enter') {
                      e.preventDefault();
                      toggleSelectPlayer(player.id);
                    }
                  }}
                  onClick={() => toggleSelectPlayer(player.id)}
                  className={`group relative cursor-pointer inline-flex items-center justify-between gap-2.5 px-3 py-1.5 rounded-xl border transition-all select-none touch-manipulation min-h-[42px] sm:min-h-[38px] ${
                    isSelected
                      ? 'bg-emerald-50/80 border-emerald-500 ring-1 ring-emerald-500 shadow-2xs text-slate-950 dark:bg-emerald-950/30 dark:border-emerald-500 dark:ring-emerald-500 dark:text-zinc-100'
                      : isResting
                      ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200 hover:border-amber-300'
                      : 'bg-slate-50/80 hover:bg-slate-100/80 border-slate-200 hover:border-slate-300 text-slate-700 dark:bg-zinc-950 dark:hover:bg-zinc-800/60 dark:border-zinc-800 dark:hover:border-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Checkbox
                      checked={isSelected}
                      readOnly
                      tabIndex={-1}
                      className="pointer-events-none"
                    />
                    <Avatar name={player.name} id={player.id} size="xs" />
                    <span
                      title={player.name}
                      className="text-xs font-semibold truncate max-w-[110px] sm:max-w-[150px]"
                    >
                      {player.name}
                    </span>
                    <PlayerBadge skillLevel={player.skillLevel} compact />
                    {player.gamesPlayed > 0 && (
                      <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono font-medium shrink-0">
                        {player.gamesPlayed}G
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={(e) => toggleRestingStatus(e, player)}
                    title={isResting ? 'Return to Active Waiting' : 'Mark as Resting'}
                    className={`shrink-0 text-[11px] px-2 py-1 rounded-lg font-semibold transition-all cursor-pointer touch-manipulation ml-0.5 ${
                      isResting
                        ? 'bg-amber-200 text-amber-900 hover:bg-amber-300 dark:bg-amber-900/80 dark:text-amber-200 dark:hover:bg-amber-800'
                        : 'text-slate-400 hover:text-slate-700 hover:bg-slate-200/80 dark:text-zinc-500 dark:hover:text-zinc-200 dark:hover:bg-zinc-800'
                    }`}
                  >
                    {isResting ? (
                      <span className="inline-flex items-center gap-1">
                        <Coffee className="w-3 h-3 text-amber-700 dark:text-amber-300" />
                        Resting
                      </span>
                    ) : (
                      'Rest'
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <AddPlayerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </>
  );
};
