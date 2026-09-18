import { GameScore, Team } from '@/types';
import { checkGameWinner } from './winner';
import { ScoringEngineResult } from './types';

/**
 * Generates the traditional three-part pickleball score call:
 * "Server Score - Receiver Score - Server Number" (e.g., "7 - 5 - 1")
 */
export function formatThreePartScore(score: GameScore): string {
  const servingTeam = score.servingTeam || 'A';
  const serverScore = servingTeam === 'A' ? score.teamA : score.teamB;
  const receiverScore = servingTeam === 'A' ? score.teamB : score.teamA;
  const serverNumber = score.serverNumber ?? 1;

  return `${serverScore} - ${receiverScore} - ${serverNumber}`;
}

/**
 * Initializes traditional doubles side-out scoring state.
 * Under USA Pickleball rules, the starting service begins on Server 2 (0-0-2)
 * so that only one fault occurs before the first side-out.
 */
export function initializeSideOutScore(
  targetScore: number = 11,
  winBy: number = 2,
  startingServingTeam: Team = 'A'
): GameScore {
  return {
    teamA: 0,
    teamB: 0,
    scoringMode: 'side-out',
    targetScore,
    winBy,
    servingTeam: startingServingTeam,
    serverNumber: 2, // Official 0-0-2 start
    winner: undefined,
  };
}

/**
 * Processes a rally in Side-Out doubles scoring mode according to USA Pickleball rules.
 *
 * Rules:
 * 1. Only the serving team can score points.
 * 2. If the serving team wins the rally: +1 point to serving team, same server continues.
 * 3. If the serving team loses the rally:
 *    - If Server 1 loses: Fault. Server 2 on the same team now serves.
 *    - If Server 2 loses: Side-out! Opposing team serves, starting with Server 1.
 */
export function processSideOutRally(
  score: GameScore,
  rallyWinner: Team
): ScoringEngineResult {
  const currentServingTeam = score.servingTeam || 'A';
  const currentServerNumber = score.serverNumber ?? 1;
  const opponentTeam: Team = currentServingTeam === 'A' ? 'B' : 'A';

  // Case 1: Serving team wins the rally -> Score Point!
  if (rallyWinner === currentServingTeam) {
    const updatedScore: GameScore = {
      ...score,
      teamA: currentServingTeam === 'A' ? score.teamA + 1 : score.teamA,
      teamB: currentServingTeam === 'B' ? score.teamB + 1 : score.teamB,
    };

    const winner = checkGameWinner(updatedScore);
    updatedScore.winner = winner;

    const actionDescription = `Point Team ${currentServingTeam}! (${formatThreePartScore(updatedScore)})`;

    return {
      score: updatedScore,
      actionDescription,
      soundEvent: winner ? 'game-won' : 'point-scored',
    };
  }

  // Case 2: Serving team loses rally (Fault)
  // Sub-case 2a: First server faulted -> Move to Server 2
  if (currentServerNumber === 1) {
    const updatedScore: GameScore = {
      ...score,
      serverNumber: 2,
    };

    const actionDescription = `Fault on Server 1 → Team ${currentServingTeam} Server 2 (${formatThreePartScore(updatedScore)})`;

    return {
      score: updatedScore,
      actionDescription,
      soundEvent: 'side-out',
    };
  }

  // Sub-case 2b: Second server faulted -> Side Out!
  const updatedScore: GameScore = {
    ...score,
    servingTeam: opponentTeam,
    serverNumber: 1,
  };

  const actionDescription = `Side Out! → Serve to Team ${opponentTeam} (${formatThreePartScore(updatedScore)})`;

  return {
    score: updatedScore,
    actionDescription,
    soundEvent: 'side-out',
  };
}
