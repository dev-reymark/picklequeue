import React from 'react';
import { Game, Court, Player } from '@/types';
import { usePickleballStore } from '@/store/pickleball-store';
import { Modal, Button, Avatar } from '@/components/ui';
import { formatDuration } from '@/lib/utils';

interface GameResultModalProps {
  game: Game;
  court: Court;
  isOpen: boolean;
  onClose: () => void;
  onProceedToEndGame: () => void;
}

export const GameResultModal: React.FC<GameResultModalProps> = ({
  game,
  court,
  isOpen,
  onClose,
  onProceedToEndGame,
}) => {
  const { players, undoScoreAction } = usePickleballStore();

  if (!isOpen) return null;

  const winner = game.score.winner;
  const winningTeam = winner === 'A' ? 'Team A' : winner === 'B' ? 'Team B' : null;

  const teamAPlayers = (game.teamA.playerIds || [])
    .map((id) => players.find((p) => p.id === id))
    .filter(Boolean) as Player[];

  const teamBPlayers = (game.teamB.playerIds || [])
    .map((id) => players.find((p) => p.id === id))
    .filter(Boolean) as Player[];

  const winningPlayers = winner === 'A' ? teamAPlayers : winner === 'B' ? teamBPlayers : [];
  const winningNames = winningPlayers.map((p) => p.name).join(' & ');

  const durationMs = Math.max(0, Date.now() - game.startedAt);
  const durationText = formatDuration(durationMs);

  const handleCorrectScore = () => {
    undoScoreAction(game.id);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Game Complete"
      description={`${court.name} • Match Result`}
      maxWidth="md"
      footer={
        <>
          <Button variant="secondary" onClick={handleCorrectScore}>
            Correct Score (Undo)
          </Button>
          <Button variant="primary" onClick={onProceedToEndGame}>
            Complete Game &amp; Rotate
          </Button>
        </>
      }
    >
      <div className="space-y-4 text-center py-2">
        {/* Winner Banner */}
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
          <div className="text-xs font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-1">
            Winner &bull; {winningTeam}
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-zinc-100">
            {winningNames || winningTeam}
          </div>
          <div className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            Match Duration: <span className="font-mono font-medium">{durationText}</span>
          </div>
        </div>

        {/* Final Scoreboard Box */}
        <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
          {/* Team A */}
          <div className={`p-2 rounded-xl ${winner === 'A' ? 'bg-emerald-500/10 font-bold' : ''}`}>
            <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">
              Team A
            </span>
            <div className="text-4xl font-black tabular-nums my-1 text-slate-900 dark:text-zinc-100">
              {game.score.teamA}
            </div>
            <div className="text-xs text-slate-700 dark:text-zinc-300 truncate">
              {teamAPlayers.map((p) => p.name.split(' ')[0]).join(' & ')}
            </div>
          </div>

          {/* Team B */}
          <div className={`p-2 rounded-xl ${winner === 'B' ? 'bg-emerald-500/10 font-bold' : ''}`}>
            <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">
              Team B
            </span>
            <div className="text-4xl font-black tabular-nums my-1 text-slate-900 dark:text-zinc-100">
              {game.score.teamB}
            </div>
            <div className="text-xs text-slate-700 dark:text-zinc-300 truncate">
              {teamBPlayers.map((p) => p.name.split(' ')[0]).join(' & ')}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
