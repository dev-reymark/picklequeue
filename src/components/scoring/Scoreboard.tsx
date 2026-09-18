import React, { useState } from 'react';
import { Game, Court } from '@/types';
import { usePickleballStore } from '@/store/pickleball-store';
import { ScoreDisplay } from './ScoreDisplay';
import { ServeIndicator } from './ServeIndicator';
import { ScoreControls } from './ScoreControls';
import { GameResultModal } from './GameResultModal';

interface ScoreboardProps {
  game: Game;
  court: Court;
  onOpenEndGameModal?: () => void;
}

export const Scoreboard: React.FC<ScoreboardProps> = ({
  game,
  court,
  onOpenEndGameModal,
}) => {
  const { settings, undoScoreAction } = usePickleballStore();
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);

  const { score } = game;
  const isGameWon = !!score.winner;

  return (
    <div className="space-y-3">
      {/* Central Score Display */}
      <ScoreDisplay
        game={game}
        court={court}
        showServing={settings.showServingTeam}
      />

      {/* Serve Indicator & 3-Part Call Bar */}
      {settings.showServingTeam && !isGameWon && (
        <ServeIndicator game={game} />
      )}

      {/* Controls or Winner Announcement */}
      {isGameWon ? (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-center space-y-2 animate-in fade-in zoom-in-95 duration-200">
          <div className="text-xs font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
            Team {score.winner} Wins ({score.teamA} - {score.teamB})
          </div>
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => undoScoreAction(game.id)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 transition cursor-pointer"
            >
              Correct Score
            </button>
            <button
              type="button"
              onClick={() => {
                if (onOpenEndGameModal) {
                  onOpenEndGameModal();
                } else {
                  setIsResultModalOpen(true);
                }
              }}
              className="px-4 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-xs cursor-pointer"
            >
              Complete Match &rarr;
            </button>
          </div>
        </div>
      ) : (
        <ScoreControls game={game} />
      )}

      {/* Full Result Modal if triggered */}
      {isResultModalOpen && (
        <GameResultModal
          game={game}
          court={court}
          isOpen={isResultModalOpen}
          onClose={() => setIsResultModalOpen(false)}
          onProceedToEndGame={() => {
            setIsResultModalOpen(false);
            if (onOpenEndGameModal) {
              onOpenEndGameModal();
            }
          }}
        />
      )}
    </div>
  );
};
