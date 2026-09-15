import { Player, Court, QueueGroup } from '@/types';
import { calculateBestTeams } from './matchmaking';

export function getSampleSessionData(): {
  players: Player[];
  courts: Court[];
  queue: QueueGroup[];
} {
  const now = Date.now();

  const players: Player[] = [
    // Playing on Court 1
    { id: 'p1', name: 'Juan Dela Cruz', skillLevel: 'high-intermediate', status: 'playing', createdAt: now - 3600000, gamesPlayed: 3 },
    { id: 'p2', name: 'Carlo Mendoza', skillLevel: 'high-intermediate', status: 'playing', createdAt: now - 3500000, gamesPlayed: 2 },
    { id: 'p3', name: 'Mark Bautista', skillLevel: 'low-intermediate', status: 'playing', createdAt: now - 3400000, gamesPlayed: 1 },
    { id: 'p4', name: 'James Ramos', skillLevel: 'low-intermediate', status: 'playing', createdAt: now - 3300000, gamesPlayed: 2 },

    // Playing on Court 2
    { id: 'p5', name: 'Sarah Jenkins', skillLevel: 'advanced', status: 'playing', createdAt: now - 3200000, gamesPlayed: 4 },
    { id: 'p6', name: 'Chris Tan', skillLevel: 'high-intermediate', status: 'playing', createdAt: now - 3100000, gamesPlayed: 3 },
    { id: 'p7', name: 'Patricia Santos', skillLevel: 'advanced', status: 'playing', createdAt: now - 3000000, gamesPlayed: 2 },
    { id: 'p8', name: 'Dave Morales', skillLevel: 'high-intermediate', status: 'playing', createdAt: now - 2900000, gamesPlayed: 1 },

    // Playing on Court 3
    { id: 'p9', name: 'Anna Reyes', skillLevel: 'beginner', status: 'playing', createdAt: now - 2800000, gamesPlayed: 1 },
    { id: 'p10', name: 'Michael Cruz', skillLevel: 'beginner', status: 'playing', createdAt: now - 2700000, gamesPlayed: 1 },
    { id: 'p11', name: 'Bea Soriano', skillLevel: 'low-intermediate', status: 'playing', createdAt: now - 2600000, gamesPlayed: 2 },
    { id: 'p12', name: 'Paolo Diaz', skillLevel: 'low-intermediate', status: 'playing', createdAt: now - 2500000, gamesPlayed: 1 },

    // Queued in Queue #1
    { id: 'p13', name: 'Rachel Lim', skillLevel: 'high-intermediate', status: 'queued', createdAt: now - 2400000, gamesPlayed: 2 },
    { id: 'p14', name: 'Kevin Sy', skillLevel: 'low-intermediate', status: 'queued', createdAt: now - 2300000, gamesPlayed: 1 },
    { id: 'p15', name: 'Jasmine Lee', skillLevel: 'high-intermediate', status: 'queued', createdAt: now - 2200000, gamesPlayed: 3 },
    { id: 'p16', name: 'Gary Vance', skillLevel: 'low-intermediate', status: 'queued', createdAt: now - 2100000, gamesPlayed: 0 },

    // Queued in Queue #2
    { id: 'p17', name: 'Leo Gomez', skillLevel: 'advanced', status: 'queued', createdAt: now - 2000000, gamesPlayed: 2 },
    { id: 'p18', name: 'Diana Ross', skillLevel: 'advanced', status: 'queued', createdAt: now - 1900000, gamesPlayed: 1 },
    { id: 'p19', name: 'Eric Cho', skillLevel: 'high-intermediate', status: 'queued', createdAt: now - 1800000, gamesPlayed: 2 },
    { id: 'p20', name: 'Nina Vega', skillLevel: 'high-intermediate', status: 'queued', createdAt: now - 1700000, gamesPlayed: 1 },

    // Available in Waiting Pool
    { id: 'p21', name: 'Sam Torres', skillLevel: 'beginner', status: 'available', createdAt: now - 1600000, gamesPlayed: 0 },
    { id: 'p22', name: 'Chloe Young', skillLevel: 'beginner', status: 'available', createdAt: now - 1500000, gamesPlayed: 1 },
    { id: 'p23', name: 'Justin Reed', skillLevel: 'low-intermediate', status: 'available', createdAt: now - 1400000, gamesPlayed: 1 },
    { id: 'p24', name: 'Mia Flores', skillLevel: 'high-intermediate', status: 'available', createdAt: now - 1300000, gamesPlayed: 2 },
    { id: 'p25', name: 'Aaron Lopez', skillLevel: 'low-intermediate', status: 'available', createdAt: now - 1200000, gamesPlayed: 0 },
    { id: 'p26', name: 'Karen Wright', skillLevel: 'advanced', status: 'available', createdAt: now - 1100000, gamesPlayed: 3 },
  ];

  // Match 1 on Court 1: ~8:42 remaining
  const court1Players = players.slice(0, 4);
  const match1 = calculateBestTeams(court1Players);

  // Match 2 on Court 2: ~1:30 remaining (Ending soon!)
  const court2Players = players.slice(4, 8);
  const match2 = calculateBestTeams(court2Players);

  // Match 3 on Court 3: ~12:15 remaining
  const court3Players = players.slice(8, 12);
  const match3 = calculateBestTeams(court3Players);

  const courts: Court[] = [
    {
      id: 'c1',
      name: 'Court 1',
      status: 'playing',
      playerIds: court1Players.map((p) => p.id),
      teamAIds: match1.teamAIds,
      teamBIds: match1.teamBIds,
      balance: match1.balance,
      startedAt: now - 6 * 60 * 1000 - 18000,
      endsAt: now + 8 * 60 * 1000 + 42000, // 8:42 left
      durationMinutes: 15,
    },
    {
      id: 'c2',
      name: 'Court 2',
      status: 'playing',
      playerIds: court2Players.map((p) => p.id),
      teamAIds: match2.teamAIds,
      teamBIds: match2.teamBIds,
      balance: match2.balance,
      startedAt: now - 13 * 60 * 1000 - 30000,
      endsAt: now + 1 * 60 * 1000 + 30000, // 1:30 left (Ending soon)
      durationMinutes: 15,
    },
    {
      id: 'c3',
      name: 'Court 3',
      status: 'playing',
      playerIds: court3Players.map((p) => p.id),
      teamAIds: match3.teamAIds,
      teamBIds: match3.teamBIds,
      balance: match3.balance,
      startedAt: now - 2 * 60 * 1000 - 45000,
      endsAt: now + 12 * 60 * 1000 + 15000, // 12:15 left
      durationMinutes: 15,
    },
    {
      id: 'c4',
      name: 'Court 4',
      status: 'available',
      playerIds: [],
    },
    {
      id: 'c5',
      name: 'Court 5',
      status: 'available',
      playerIds: [],
    },
    {
      id: 'c6',
      name: 'Court 6',
      status: 'available',
      playerIds: [],
    },
  ];

  // Queue Group 1
  const q1Players = players.slice(12, 16);
  const q1Match = calculateBestTeams(q1Players);
  // Queue Group 2
  const q2Players = players.slice(16, 20);
  const q2Match = calculateBestTeams(q2Players);

  const queue: QueueGroup[] = [
    {
      id: 'q1',
      playerIds: q1Players.map((p) => p.id),
      teamAIds: q1Match.teamAIds,
      teamBIds: q1Match.teamBIds,
      balance: q1Match.balance,
      createdAt: now - 15 * 60 * 1000,
    },
    {
      id: 'q2',
      playerIds: q2Players.map((p) => p.id),
      teamAIds: q2Match.teamAIds,
      teamBIds: q2Match.teamBIds,
      balance: q2Match.balance,
      createdAt: now - 8 * 60 * 1000,
    },
  ];

  return { players, courts, queue };
}
