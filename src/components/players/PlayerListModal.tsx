import React, { useState } from 'react';
import { Player, SkillLevel, SKILL_CONFIG } from '@/types';
import { usePickleballStore } from '@/store/pickleball-store';
import { PlayerBadge } from './PlayerBadge';

interface PlayerListModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SKILL_LEVELS: SkillLevel[] = [
  'beginner',
  'low-intermediate',
  'high-intermediate',
  'advanced',
];

export const PlayerListModal: React.FC<PlayerListModalProps> = ({ isOpen, onClose }) => {
  const { players, editPlayer, deletePlayer } = usePickleballStore();
  const [filter, setFilter] = useState<'all' | 'available' | 'queued' | 'playing'>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editSkill, setEditSkill] = useState<SkillLevel>('beginner');

  if (!isOpen) return null;

  const filteredPlayers = players.filter((p) => {
    if (filter === 'all') return true;
    return p.status === filter;
  });

  const startEdit = (p: Player) => {
    setEditingId(p.id);
    setEditName(p.name);
    setEditSkill(p.skillLevel);
  };

  const saveEdit = () => {
    if (editingId && editName.trim()) {
      editPlayer(editingId, { name: editName.trim(), skillLevel: editSkill });
      setEditingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/75 backdrop-blur-xs p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100">
              Player Directory ({players.length})
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Manage player skill ratings and session participation
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200 text-lg px-2 font-bold"
          >
            ✕
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2">
          {(['all', 'available', 'queued', 'playing'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition ${
                filter === tab
                  ? 'bg-slate-900 text-white dark:bg-zinc-800 dark:text-zinc-100 border border-slate-900 dark:border-zinc-700'
                  : 'text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-200'
              }`}
            >
              {tab} (
              {tab === 'all'
                ? players.length
                : players.filter((p) => p.status === tab).length}
              )
            </button>
          ))}
        </div>

        {/* Players List Table */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {filteredPlayers.length === 0 ? (
            <div className="text-center py-8 text-slate-400 dark:text-zinc-400 text-xs">
              No players found for this filter.
            </div>
          ) : (
            filteredPlayers.map((player) => (
              <div
                key={player.id}
                className="flex items-center justify-between bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800/80 rounded-xl p-3"
              >
                {editingId === player.id ? (
                  <div className="flex-1 flex flex-wrap items-center gap-2 mr-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="px-2.5 py-1 text-xs bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-lg text-slate-900 dark:text-zinc-100 focus:outline-none"
                    />
                    <select
                      value={editSkill}
                      onChange={(e) => setEditSkill(e.target.value as SkillLevel)}
                      className="px-2.5 py-1 text-xs bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-lg text-slate-900 dark:text-zinc-100 focus:outline-none"
                    >
                      {SKILL_LEVELS.map((lvl) => (
                        <option key={lvl} value={lvl}>
                          {SKILL_CONFIG[lvl].label}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={saveEdit}
                      className="px-2.5 py-1 text-xs bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="px-2.5 py-1 text-xs bg-slate-200 hover:bg-slate-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-300 rounded-lg font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-slate-900 dark:text-zinc-200">
                        {player.name}
                      </span>
                      <PlayerBadge skillLevel={player.skillLevel} />
                      <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded capitalize border ${
                          player.status === 'playing'
                            ? 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/30'
                            : player.status === 'queued'
                            ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/30'
                            : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700'
                        }`}
                      >
                        {player.status}
                      </span>
                      <span className="text-xs text-slate-400 dark:text-zinc-400 font-mono">
                        {player.gamesPlayed} games played
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(player)}
                        className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-200 transition"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => deletePlayer(player.id)}
                        className="px-2.5 py-1 text-xs font-medium rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-zinc-800 dark:hover:bg-rose-950/60 dark:hover:text-rose-400 dark:text-zinc-400 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-300 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
