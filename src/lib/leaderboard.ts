import {
  Player,
  GameRecord,
  SkillLevel,
  PlayerLeaderboardEntry,
  LeaderboardSortOption,
  LeaderboardFilterOptions,
  VenueLeaderboardHighlights,
} from '@/types';

export type { LeaderboardSortOption, LeaderboardFilterOptions, VenueLeaderboardHighlights };

export function computePlayerStats(
  player: Player,
  games: GameRecord[]
): Omit<PlayerLeaderboardEntry, 'rank'> {
  // Find all completed matches involving this player
  const playerGames = games
    .filter((g) => g.playerIds && g.playerIds.includes(player.id))
    .sort((a, b) => a.endedAt - b.endedAt); // chronological

  let winsFromGames = 0;
  let lossesFromGames = 0;
  let pointsScored = 0;
  let pointsConceded = 0;
  let currentStreak = 0;

  playerGames.forEach((g) => {
    const isTeamA = g.teamAIds && g.teamAIds.includes(player.id);
    const isTeamB = g.teamBIds && g.teamBIds.includes(player.id);

    if (g.score) {
      if (isTeamA) {
        pointsScored += g.score.teamA ?? 0;
        pointsConceded += g.score.teamB ?? 0;
      } else if (isTeamB) {
        pointsScored += g.score.teamB ?? 0;
        pointsConceded += g.score.teamA ?? 0;
      }
    }

    if (g.winner) {
      const won = (isTeamA && g.winner === 'A') || (isTeamB && g.winner === 'B');
      if (won) {
        winsFromGames += 1;
        currentStreak += 1;
      } else {
        lossesFromGames += 1;
        currentStreak = 0; // reset streak on loss
      }
    }
  });

  // Blend with stored player values if player already had records from demo or manual updates
  const finalWins = Math.max(player.wins ?? 0, winsFromGames);
  const finalLosses = Math.max(player.losses ?? 0, lossesFromGames);
  const matchesPlayed = Math.max(
    player.gamesPlayed || 0,
    playerGames.length,
    finalWins + finalLosses
  );

  const streak = player.streak !== undefined && player.streak > currentStreak
    ? player.streak
    : currentStreak;

  const winRate = matchesPlayed > 0 ? Math.round((finalWins / matchesPlayed) * 100) : 0;
  const pointDiff = pointsScored - pointsConceded;

  return {
    player,
    matchesPlayed,
    wins: finalWins,
    losses: finalLosses,
    winRate,
    streak,
    pointsScored: pointsScored || (player.pointsScored ?? 0),
    pointsConceded: pointsConceded || (player.pointsConceded ?? 0),
    pointDiff,
  };
}

export function getLeaderboard(
  players: Player[],
  games: GameRecord[],
  options: LeaderboardFilterOptions = {}
): {
  entries: PlayerLeaderboardEntry[];
  highlights: VenueLeaderboardHighlights;
} {
  const {
    sortBy = 'wins',
    skillLevel = 'all',
    minGames = 0,
    search = '',
  } = options;

  // Compute stats for all players
  const rawEntries = players.map((player) => computePlayerStats(player, games));

  // Compute highlights from ALL players with matches before filtering
  const activeEntries = rawEntries.filter((e) => e.matchesPlayed > 0);

  const topWinner = activeEntries.length > 0
    ? [...activeEntries].sort((a, b) => b.wins - a.wins || b.winRate - a.winRate)[0]
    : null;

  const highestWinRate = activeEntries.length > 0
    ? [...activeEntries]
        .filter((e) => e.matchesPlayed >= 2)
        .sort((a, b) => b.winRate - a.winRate || b.wins - a.wins)[0] ||
      [...activeEntries].sort((a, b) => b.winRate - a.winRate)[0]
    : null;

  const longestStreak = activeEntries.length > 0
    ? [...activeEntries].sort((a, b) => b.streak - a.streak || b.wins - a.wins)[0]
    : null;

  const mostActive = activeEntries.length > 0
    ? [...activeEntries].sort((a, b) => b.matchesPlayed - a.matchesPlayed || b.wins - a.wins)[0]
    : null;

  const totalPointsScored = games.reduce((acc, g) => {
    return acc + (g.score ? (g.score.teamA || 0) + (g.score.teamB || 0) : 0);
  }, 0);

  const highlights: VenueLeaderboardHighlights = {
    topWinner: topWinner ? { ...topWinner, rank: 1 } : null,
    highestWinRate: highestWinRate ? { ...highestWinRate, rank: 1 } : null,
    longestStreak: longestStreak && longestStreak.streak > 0 ? { ...longestStreak, rank: 1 } : null,
    mostActive: mostActive ? { ...mostActive, rank: 1 } : null,
    totalGamesRecorded: games.length,
    totalPointsScored,
  };

  // Filter
  const filtered = rawEntries.filter((entry) => {
    if (minGames > 0 && entry.matchesPlayed < minGames) {
      return false;
    }

    if (skillLevel !== 'all' && entry.player.skillLevel !== skillLevel) {
      return false;
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      if (!entry.player.name.toLowerCase().includes(q)) {
        return false;
      }
    }

    return true;
  });

  // Sort
  filtered.sort((a, b) => {
    switch (sortBy) {
      case 'wins':
        return b.wins - a.wins || b.winRate - a.winRate || b.pointDiff - a.pointDiff;
      case 'winRate':
        return b.winRate - a.winRate || b.wins - a.wins || b.matchesPlayed - a.matchesPlayed;
      case 'matches':
        return b.matchesPlayed - a.matchesPlayed || b.wins - a.wins;
      case 'streak':
        return b.streak - a.streak || b.wins - a.wins || b.winRate - a.winRate;
      case 'pointDiff':
        return b.pointDiff - a.pointDiff || b.wins - a.wins;
      default:
        return b.wins - a.wins;
    }
  });

  // Assign ranks
  const entries: PlayerLeaderboardEntry[] = filtered.map((entry, idx) => ({
    ...entry,
    rank: idx + 1,
  }));

  return { entries, highlights };
}
