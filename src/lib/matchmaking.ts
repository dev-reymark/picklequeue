import { Player, MatchBalanceResult, SKILL_RATINGS, QueueMode } from '@/types';

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

  // Standard doubles match (4 players)
  if (players.length === 4) {
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

  // Unsupported / invalid match size (e.g. 3 players, 5+ players)
  const half = Math.ceil(players.length / 2);
  return {
    teamAIds: players.slice(0, half).map((p) => p.id),
    teamBIds: players.slice(half).map((p) => p.id),
    balance: {
      teamARating: 0,
      teamBRating: 0,
      diff: 99,
      status: 'unbalanced',
      statusLabel: 'Invalid Match Size',
      qualityPercent: 0,
    },
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
 * If queueMode is 'fifo', strictly prioritizes oldest waiting players.
 * If queueMode is 'skill-balanced', finds the combination with best skill parity.
 */
export function suggestBalancedGroup(
  availablePlayers: Player[],
  targetSize = 4,
  mode: QueueMode = 'skill-balanced'
): Player[] {
  if (availablePlayers.length <= targetSize) {
    return [...availablePlayers];
  }

  // Strict First-Come First-Served mode: take the players who have waited longest
  if (mode === 'fifo') {
    return availablePlayers.slice(0, targetSize);
  }

  // Skill-Balanced Mode: Sort candidates by wait time (createdAt) first, but take the oldest 10 candidates
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
