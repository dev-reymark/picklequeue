import { Player, MatchBalanceResult, SKILL_RATINGS } from '@/types';

/**
 * Given 2 to 4 players, determine the best Team A vs Team B split that minimizes skill gap.
 */
export function calculateBestTeams(players: Player[]): {
  teamAIds: string[];
  teamBIds: string[];
  balance: MatchBalanceResult;
} {
  if (players.length === 0) {
    return {
      teamAIds: [],
      teamBIds: [],
      balance: {
        teamARating: 0,
        teamBRating: 0,
        diff: 0,
        status: 'balanced',
        statusLabel: 'Balanced',
        qualityPercent: 100,
      },
    };
  }

  // Singles match (2 players)
  if (players.length === 2) {
    const rA = SKILL_RATINGS[players[0].skillLevel] || 1;
    const rB = SKILL_RATINGS[players[1].skillLevel] || 1;
    const diff = Math.abs(rA - rB);
    return {
      teamAIds: [players[0].id],
      teamBIds: [players[1].id],
      balance: evaluateBalance(rA, rB, diff),
    };
  }

  // 3 players (odd group)
  if (players.length === 3) {
    const r0 = SKILL_RATINGS[players[0].skillLevel] || 1;
    const r1 = SKILL_RATINGS[players[1].skillLevel] || 1;
    const r2 = SKILL_RATINGS[players[2].skillLevel] || 1;
    return {
      teamAIds: [players[0].id, players[1].id],
      teamBIds: [players[2].id],
      balance: evaluateBalance(r0 + r1, r2, Math.abs(r0 + r1 - r2)),
    };
  }

  // Standard doubles match (4 players)
  // Pairings:
  // Option 1: (0, 1) vs (2, 3)
  // Option 2: (0, 2) vs (1, 3)
  // Option 3: (0, 3) vs (1, 2)
  const r = players.map((p) => SKILL_RATINGS[p.skillLevel] || 1);

  const options = [
    {
      teamAIds: [players[0].id, players[1].id],
      teamBIds: [players[2].id, players[3].id],
      rA: r[0] + r[1],
      rB: r[2] + r[3],
    },
    {
      teamAIds: [players[0].id, players[2].id],
      teamBIds: [players[1].id, players[3].id],
      rA: r[0] + r[2],
      rB: r[1] + r[3],
    },
    {
      teamAIds: [players[0].id, players[3].id],
      teamBIds: [players[1].id, players[2].id],
      rA: r[0] + r[3],
      rB: r[1] + r[2],
    },
  ];

  let best = options[0];
  let minDiff = Math.abs(options[0].rA - options[0].rB);

  for (let i = 1; i < options.length; i++) {
    const diff = Math.abs(options[i].rA - options[i].rB);
    if (diff < minDiff) {
      minDiff = diff;
      best = options[i];
    }
  }

  return {
    teamAIds: best.teamAIds,
    teamBIds: best.teamBIds,
    balance: evaluateBalance(best.rA, best.rB, minDiff),
  };
}

function evaluateBalance(rA: number, rB: number, diff: number): MatchBalanceResult {
  if (diff <= 0) {
    return {
      teamARating: rA,
      teamBRating: rB,
      diff,
      status: 'balanced',
      statusLabel: 'Balanced',
      qualityPercent: 100,
    };
  }
  if (diff === 1) {
    return {
      teamARating: rA,
      teamBRating: rB,
      diff,
      status: 'balanced',
      statusLabel: 'Balanced',
      qualityPercent: 90,
    };
  }
  if (diff === 2) {
    return {
      teamARating: rA,
      teamBRating: rB,
      diff,
      status: 'slightly-unbalanced',
      statusLabel: 'Slightly Unbalanced',
      qualityPercent: 70,
    };
  }
  return {
    teamARating: rA,
    teamBRating: rB,
    diff,
    status: 'unbalanced',
    statusLabel: 'Unbalanced',
    qualityPercent: 45,
  };
}

/**
 * Suggest optimal 4 players from the available waiting pool.
 * If queueMode is skill-balanced, prioritize players with close ratings.
 */
export function suggestBalancedGroup(availablePlayers: Player[], targetSize = 4): Player[] {
  if (availablePlayers.length <= targetSize) {
    return [...availablePlayers];
  }

  // Sort candidates by wait time (createdAt) first, but take the oldest 8 candidates
  // and find 4 among them that form the most balanced game.
  const pool = availablePlayers.slice(0, Math.min(10, availablePlayers.length));

  let bestGroup: Player[] = pool.slice(0, targetSize);
  let bestQuality = 0;

  // Combination generator for picking 4 out of pool
  function pickCombinations(current: Player[], startIndex: number) {
    if (current.length === targetSize) {
      const match = calculateBestTeams(current);
      if (match.balance.qualityPercent > bestQuality) {
        bestQuality = match.balance.qualityPercent;
        bestGroup = [...current];
      }
      return;
    }

    for (let i = startIndex; i < pool.length; i++) {
      current.push(pool[i]);
      pickCombinations(current, i + 1);
      current.pop();
    }
  }

  pickCombinations([], 0);
  return bestGroup;
}
