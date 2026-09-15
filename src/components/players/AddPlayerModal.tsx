import { playSound } from '@/lib/sound';
import React, { useState } from 'react';
import { SkillLevel, SKILL_CONFIG } from '@/types';
import { usePickleballStore } from '@/store/pickleball-store';
import { Modal, Input, Button } from '@/components/ui';

interface AddPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SKILL_LEVELS: SkillLevel[] = [
  'beginner',
  'low-intermediate',
  'high-intermediate',
  'advanced',
];

export const AddPlayerModal: React.FC<AddPlayerModalProps> = ({ isOpen, onClose }) => {
  const { addPlayer } = usePickleballStore();
  const [name, setName] = useState('');
  const [skillLevel, setSkillLevel] = useState<SkillLevel>('high-intermediate');
  const [keepOpen, setKeepOpen] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    playSound.playerAdded();
    addPlayer(name.trim(), skillLevel);
    setName('');

    if (!keepOpen) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Player"
      description="Register player into the session waiting pool"
      maxWidth="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!name.trim()}
          >
            Add Player
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Player Name */}
        <Input
          label="Player Name"
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Juan Dela Cruz"
          helperText="Press Enter after typing name to quickly add"
        />

        {/* Skill Level Selection Cards */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-2 cursor-pointer">
            Skill Level
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            {SKILL_LEVELS.map((lvl) => {
              const config = SKILL_CONFIG[lvl];
              const isSelected = skillLevel === lvl;
              return (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => { playSound.click(); setSkillLevel(lvl); }}
                  className={`p-3 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-slate-100 dark:bg-zinc-800/90 border-slate-400 dark:border-zinc-500 ring-1 ring-slate-400 dark:ring-zinc-500'
                      : 'bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                      {config.label}
                    </span>
                    <span className={`w-2.5 h-2.5 rounded-full ${config.colorDot}`} />
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono">
                    Level {config.rating}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Keep open toggle */}
        <div className="flex items-center gap-2 pt-1 cursor-pointer">
          <input
            type="checkbox"
            id="keepOpen"
            checked={keepOpen}
            onChange={(e) => setKeepOpen(e.target.checked)}
            className="rounded bg-slate-50 dark:bg-zinc-950 border-slate-300 dark:border-zinc-700 text-emerald-500 focus:ring-0 cursor-pointer"
          />
          <label htmlFor="keepOpen" className="text-xs text-slate-700 dark:text-zinc-300 cursor-pointer">
            Keep modal open to add more players
          </label>
        </div>
      </form>
    </Modal>
  );
};
