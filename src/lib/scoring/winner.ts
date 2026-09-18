import { GameScore, Team } from '@/types';

/**
 * Reusable pickleball victory detection.
 * Requires reaching target score and possessing at least the winBy margin.
 *
 * Examples with target=11, winBy=2:
 * 11 - 7 => Won
 * 11 - 10 => Not won (continue)
 * 12 - 10 => Won
 * 15 - 14 => Not won (continue)
 * 16 - 14 => Won
 */
export function hasWon(
  score: number,
  opponentScore: number,
  targetScore: number,
  winBy: number = 2
): boolean {
  return score >= targetScore && score - opponentScore >= winBy;
}

/**
 * Evaluates the current game score and returns the winning team if one has clinched victory.
 */
export function checkGameWinner(score: GameScore): Team | undefined {
  const { teamA, teamB, targetScore, winBy } = score;

  if (hasWon(teamA, teamB, targetScore, winBy)) {
    return 'A';
  }
  if (hasWon(teamB, teamA, targetScore, winBy)) {
    return 'B';
  }
  return undefined;
}

/**
 * Returns whether the game is at Match Point / Game Point for either team.
 * Meaning either team is 1 point away from reaching target and satisfying win-by.
 */
export function isMatchPoint(score: GameScore): { team: Team; isMatchPoint: boolean } | null {
  const { teamA, teamB, targetScore, winBy } = score;
  if (checkGameWinner(score)) return null;

  if (hasWon(teamA + 1, teamB, targetScore, winBy)) {
    return { team: 'A', isMatchPoint: true };
  }
  if (hasWon(teamB + 1, teamA, targetScore, winBy)) {
    return { team: 'B', isMatchPoint: true };
  }
  return null;
}
