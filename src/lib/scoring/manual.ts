import { GameScore, Team } from '@/types';
import { checkGameWinner } from './winner';
import { ScoringEngineResult } from './types';

/**
 * Adjusts points manually for Team A or Team B (+1 or -1).
 * Guards against negative scores and updates winner detection accordingly.
 */
export function processManualPoint(
  score: GameScore,
  team: Team,
  delta: 1 | -1
): ScoringEngineResult {
  const currentVal = team === 'A' ? score.teamA : score.teamB;
  const nextVal = Math.max(0, currentVal + delta);

  const updatedScore: GameScore = {
    ...score,
    teamA: team === 'A' ? nextVal : score.teamA,
    teamB: team === 'B' ? nextVal : score.teamB,
  };

  const winner = checkGameWinner(updatedScore);
  updatedScore.winner = winner;

  const actionDescription = `${delta > 0 ? '+1' : '-1'} Team ${team} (${updatedScore.teamA} - ${updatedScore.teamB})`;

  let soundEvent: 'point-scored' | 'game-won' | undefined;
  if (winner) {
    soundEvent = 'game-won';
  } else if (delta > 0) {
    soundEvent = 'point-scored';
  }

  return {
    score: updatedScore,
    actionDescription,
    soundEvent,
  };
}
