import React, { useState } from 'react';
import { Game } from '@/types';
import { usePickleballStore } from '@/store/pickleball-store';
import { ConfirmAlert } from '@/components/ui';

interface ScoreControlsProps {
  game: Game;
}

export const ScoreControls: React.FC<ScoreControlsProps> = ({ game }) => {
  const {
    adjustManualScore,
    scoreRally,
    undoScoreAction,
    resetGameScore,
  } = usePickleballStore();

  const { score, history } = game;
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const isManual = score.scoringMode === 'manual';
  const hasHistory = history && history.length > 0;
  const lastActionDesc = hasHistory ? history[history.length - 1].description : null;

  return (
    <div className="space-y-2.5">
      {isManual ? (
        /* Manual Scoring Controls: Large tablet-friendly buttons */
        <div className="grid grid-cols-2 gap-3">
          {/* Team A Controls */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => adjustManualScore(game.id, 'A', -1)}
              disabled={score.teamA <= 0}
              title="Decrease Team A score"
              className="h-12 sm:h-13 w-10 sm:w-11 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 font-black text-lg flex items-center justify-center transition border border-slate-200 dark:border-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer active:scale-95"
            >
              &minus;
            </button>
            <button
              type="button"
              onClick={() => adjustManualScore(game.id, 'A', 1)}
              title="Add point to Team A"
              className="h-12 sm:h-13 flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-black text-2xl flex items-center justify-center transition shadow-xs cursor-pointer active:scale-95"
            >
              +
            </button>
          </div>

          {/* Team B Controls */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => adjustManualScore(game.id, 'B', 1)}
              title="Add point to Team B"
              className="h-12 sm:h-13 flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-black text-2xl flex items-center justify-center transition shadow-xs cursor-pointer active:scale-95"
            >
              +
            </button>
            <button
              type="button"
              onClick={() => adjustManualScore(game.id, 'B', -1)}
              disabled={score.teamB <= 0}
              title="Decrease Team B score"
              className="h-12 sm:h-13 w-10 sm:w-11 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 font-black text-lg flex items-center justify-center transition border border-slate-200 dark:border-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer active:scale-95"
            >
              &minus;
            </button>
          </div>
        </div>
      ) : (
        /* Side-Out / Rally Controls: "Who won the rally?" */
        <div className="space-y-1.5">
          <div className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 text-center uppercase tracking-wider">
            Who won the rally?
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => scoreRally(game.id, 'A')}
              className="h-12 sm:h-13 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer active:scale-95 px-2"
            >
              <span>Team A Won</span>
              <span className="font-mono text-xs opacity-80">(+)</span>
            </button>
            <button
              type="button"
              onClick={() => scoreRally(game.id, 'B')}
              className="h-12 sm:h-13 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer active:scale-95 px-2"
            >
              <span>Team B Won</span>
              <span className="font-mono text-xs opacity-80">(+)</span>
            </button>
          </div>
        </div>
      )}

      {/* Undo and Reset Bar */}
      <div className="flex items-center justify-between gap-2 pt-1">
        <button
          type="button"
          onClick={() => undoScoreAction(game.id)}
          disabled={!hasHistory}
          title={lastActionDesc ? `Undo: ${lastActionDesc}` : 'Undo last action'}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition flex items-center gap-1.5 select-none ${
            hasHistory
              ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-200 dark:border-zinc-700 cursor-pointer'
              : 'bg-slate-50 dark:bg-zinc-900/50 text-slate-300 dark:text-zinc-600 border-slate-200/50 dark:border-zinc-800/50 cursor-not-allowed'
          }`}
        >
          <span>Undo</span>
          {hasHistory && (
            <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono hidden sm:inline">
              ({history.length})
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setIsResetConfirmOpen(true)}
          className="px-2 py-1 text-[11px] font-medium text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition cursor-pointer"
        >
          Reset Score
        </button>
      </div>

      {/* Confirm Alert when resetting game score */}
      {isResetConfirmOpen && (
        <ConfirmAlert
          isOpen={isResetConfirmOpen}
          onClose={() => setIsResetConfirmOpen(false)}
          onConfirm={() => {
            resetGameScore(game.id);
            setIsResetConfirmOpen(false);
          }}
          title="Reset Game Score?"
          message="Are you sure you want to reset the score to 0 - 0? You can still use Undo to restore it if needed."
          confirmText="Reset Score"
          variant="warning"
        />
      )}
    </div>
  );
};
