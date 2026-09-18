import { GameScore, Team } from '@/types';
import { checkGameWinner } from './winner';
import { ScoringEngineResult } from './types';

/**
 * Processes a rally in Rally scoring mode.
 *
 * Rules:
 * 1. Every rally results in a point awarded to the rally winner.
 * 2. If the serving team wins the rally: +1 point, serve continues.
 * 3. If the receiving team wins the rally: +1 point, side-out occurs (receiver becomes new serving team).
 */
export function processRallyPoint(
  score: GameScore,
  rallyWinner: Team
): ScoringEngineResult {
  const currentServingTeam = score.servingTeam || 'A';
  const updatedTeamA = rallyWinner === 'A' ? score.teamA + 1 : score.teamA;
  const updatedTeamB = rallyWinner === 'B' ? score.teamB + 1 : score.teamB;

  const isSideOut = rallyWinner !== currentServingTeam;
  const nextServingTeam: Team = isSideOut ? rallyWinner : currentServingTeam;

  const updatedScore: GameScore = {
    ...score,
    teamA: updatedTeamA,
    teamB: updatedTeamB,
    servingTeam: nextServingTeam,
  };

  const winner = checkGameWinner(updatedScore);
  updatedScore.winner = winner;

  let actionDescription = `Point Team ${rallyWinner} (${updatedScore.teamA} - ${updatedScore.teamB})`;
  if (isSideOut) {
    actionDescription += ` • Side Out to Team ${nextServingTeam}`;
  }

  return {
    score: updatedScore,
    actionDescription,
    soundEvent: winner ? 'game-won' : isSideOut ? 'side-out' : 'point-scored',
  };
}
