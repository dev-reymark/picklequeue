import { Player, Court, QueueGroup, Game, GameRecord, Reservation, PlayerNotification } from '@/types';
import { calculateBestTeams } from './matchmaking';

export function getSampleSessionData(): {
  players: Player[];
  courts: Court[];
  queue: QueueGroup[];
  activeGames: Record<string, Game>;
  games: GameRecord[];
  reservations: Reservation[];
  notifications: PlayerNotification[];
} {
  const now = Date.now();

  const players: Player[] = [
    // Playing on Court 1 (matches user's mock: Juan Carlo vs Mark James, 7 - 5)
    { id: 'p1', name: 'Juan Dela Cruz', skillLevel: 'high-intermediate', status: 'playing', createdAt: now - 3600000, gamesPlayed: 4, wins: 3, losses: 1, streak: 2, pointsScored: 41, pointsConceded: 29, phone: '+1 (555) 234-5678' },
    { id: 'p2', name: 'Carlo Mendoza', skillLevel: 'high-intermediate', status: 'playing', createdAt: now - 3500000, gamesPlayed: 3, wins: 2, losses: 1, streak: 1, pointsScored: 30, pointsConceded: 25, phone: '+1 (555) 345-6789' },
    { id: 'p3', name: 'Mark Bautista', skillLevel: 'low-intermediate', status: 'playing', createdAt: now - 3400000, gamesPlayed: 2, wins: 1, losses: 1, streak: 0, pointsScored: 18, pointsConceded: 21, phone: '+1 (555) 456-7890' },
    { id: 'p4', name: 'James Ramos', skillLevel: 'low-intermediate', status: 'playing', createdAt: now - 3300000, gamesPlayed: 3, wins: 1, losses: 2, streak: 0, pointsScored: 22, pointsConceded: 31, phone: '+1 (555) 567-8901' },

    // Playing on Court 2
    { id: 'p5', name: 'Sarah Jenkins', skillLevel: 'advanced', status: 'playing', createdAt: now - 3200000, gamesPlayed: 5, wins: 4, losses: 1, streak: 3, pointsScored: 52, pointsConceded: 31, phone: '+1 (555) 678-9012' },
    { id: 'p6', name: 'Chris Tan', skillLevel: 'high-intermediate', status: 'playing', createdAt: now - 3100000, gamesPlayed: 4, wins: 3, losses: 1, streak: 2, pointsScored: 43, pointsConceded: 32, phone: '+1 (555) 789-0123' },
    { id: 'p7', name: 'Patricia Santos', skillLevel: 'advanced', status: 'playing', createdAt: now - 3000000, gamesPlayed: 3, wins: 2, losses: 1, streak: 1, pointsScored: 30, pointsConceded: 26, phone: '+1 (555) 890-1234' },
    { id: 'p8', name: 'Dave Morales', skillLevel: 'high-intermediate', status: 'playing', createdAt: now - 2900000, gamesPlayed: 2, wins: 1, losses: 1, streak: 0, pointsScored: 19, pointsConceded: 22, phone: '+1 (555) 901-2345' },

    // Playing on Court 3
    { id: 'p9', name: 'Anna Reyes', skillLevel: 'beginner', status: 'playing', createdAt: now - 2800000, gamesPlayed: 2, wins: 0, losses: 2, streak: 0, pointsScored: 12, pointsConceded: 22, phone: '+1 (555) 111-2222' },
    { id: 'p10', name: 'Michael Cruz', skillLevel: 'beginner', status: 'playing', createdAt: now - 2700000, gamesPlayed: 2, wins: 1, losses: 1, streak: 1, pointsScored: 18, pointsConceded: 18, phone: '+1 (555) 222-3333' },
    { id: 'p11', name: 'Bea Soriano', skillLevel: 'low-intermediate', status: 'playing', createdAt: now - 2600000, gamesPlayed: 3, wins: 2, losses: 1, streak: 1, pointsScored: 30, pointsConceded: 26, phone: '+1 (555) 333-4444' },
    { id: 'p12', name: 'Paolo Diaz', skillLevel: 'low-intermediate', status: 'playing', createdAt: now - 2500000, gamesPlayed: 2, wins: 1, losses: 1, streak: 0, pointsScored: 19, pointsConceded: 21, phone: '+1 (555) 444-5555' },

    // Queued in Queue #1
    { id: 'p13', name: 'Rachel Lim', skillLevel: 'high-intermediate', status: 'queued', createdAt: now - 2400000, gamesPlayed: 2, wins: 2, losses: 0, streak: 2, pointsScored: 22, pointsConceded: 11, phone: '+1 (555) 555-6666' },
    { id: 'p14', name: 'Kevin Sy', skillLevel: 'low-intermediate', status: 'queued', createdAt: now - 2300000, gamesPlayed: 1, wins: 0, losses: 1, streak: 0, pointsScored: 8, pointsConceded: 11, phone: '+1 (555) 666-7777' },
    { id: 'p15', name: 'Jasmine Lee', skillLevel: 'high-intermediate', status: 'queued', createdAt: now - 2200000, gamesPlayed: 3, wins: 2, losses: 1, streak: 1, pointsScored: 28, pointsConceded: 22, phone: '+1 (555) 777-8888' },
    { id: 'p16', name: 'Gary Vance', skillLevel: 'low-intermediate', status: 'queued', createdAt: now - 2100000, gamesPlayed: 0, wins: 0, losses: 0, streak: 0, pointsScored: 0, pointsConceded: 0, phone: '+1 (555) 888-9999' },

    // Queued in Queue #2
    { id: 'p17', name: 'Leo Gomez', skillLevel: 'advanced', status: 'queued', createdAt: now - 2000000, gamesPlayed: 2, wins: 1, losses: 1, streak: 0, pointsScored: 18, pointsConceded: 15, phone: '+1 (555) 999-0000' },
    { id: 'p18', name: 'Diana Ross', skillLevel: 'advanced', status: 'queued', createdAt: now - 1900000, gamesPlayed: 1, wins: 1, losses: 0, streak: 1, pointsScored: 11, pointsConceded: 4, phone: '+1 (555) 123-4567' },
    { id: 'p19', name: 'Eric Cho', skillLevel: 'high-intermediate', status: 'queued', createdAt: now - 1800000, gamesPlayed: 2, wins: 1, losses: 1, streak: 1, pointsScored: 17, pointsConceded: 19, phone: '+1 (555) 234-5670' },
    { id: 'p20', name: 'Nina Vega', skillLevel: 'high-intermediate', status: 'queued', createdAt: now - 1700000, gamesPlayed: 1, wins: 0, losses: 1, streak: 0, pointsScored: 7, pointsConceded: 11, phone: '+1 (555) 345-6780' },

    // Available in Waiting Pool
    { id: 'p21', name: 'Sam Torres', skillLevel: 'beginner', status: 'waiting', createdAt: now - 1600000, gamesPlayed: 0, wins: 0, losses: 0, streak: 0, checkInMethod: 'qr', phone: '+1 (555) 456-7899' },
    { id: 'p22', name: 'Chloe Young', skillLevel: 'beginner', status: 'waiting', createdAt: now - 1500000, gamesPlayed: 1, wins: 0, losses: 1, streak: 0, checkInMethod: 'qr', phone: '+1 (555) 567-8999' },
    { id: 'p23', name: 'Justin Reed', skillLevel: 'low-intermediate', status: 'waiting', createdAt: now - 1400000, gamesPlayed: 1, wins: 1, losses: 0, streak: 1, phone: '+1 (555) 678-9999' },
    { id: 'p24', name: 'Mia Flores', skillLevel: 'high-intermediate', status: 'waiting', createdAt: now - 1300000, gamesPlayed: 2, wins: 1, losses: 1, streak: 1, phone: '+1 (555) 789-0000' },
    { id: 'p25', name: 'Aaron Lopez', skillLevel: 'low-intermediate', status: 'waiting', createdAt: now - 1200000, gamesPlayed: 0, wins: 0, losses: 0, streak: 0, checkInMethod: 'qr' },
    { id: 'p26', name: 'Karen Wright', skillLevel: 'advanced', status: 'waiting', createdAt: now - 1100000, gamesPlayed: 3, wins: 3, losses: 0, streak: 3, pointsScored: 33, pointsConceded: 18, phone: '+1 (555) 890-1111' },
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

  const game1Id = 'game-c1';
  const game2Id = 'game-c2';
  const game3Id = 'game-c3';

  const courts: Court[] = [
    {
      id: 'c1',
      name: 'Court 1 (Championship)',
      status: 'playing',
      currentGameId: game1Id,
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
      name: 'Court 2 (North)',
      status: 'playing',
      currentGameId: game2Id,
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
      name: 'Court 3 (South)',
      status: 'playing',
      currentGameId: game3Id,
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
      name: 'Court 4 (East)',
      status: 'available',
      playerIds: [],
    },
    {
      id: 'c5',
      name: 'Court 5 (West)',
      status: 'available',
      playerIds: [],
    },
    {
      id: 'c6',
      name: 'Court 6 (Covered)',
      status: 'available',
      playerIds: [],
    },
  ];

  // Active Games matching demo courts
  const activeGames: Record<string, Game> = {
    [game1Id]: {
      id: game1Id,
      courtId: 'c1',
      courtName: 'Court 1 (Championship)',
      teamA: { playerIds: match1.teamAIds },
      teamB: { playerIds: match1.teamBIds },
      score: {
        teamA: 7,
        teamB: 5,
        scoringMode: 'manual',
        targetScore: 11,
        winBy: 2,
        servingTeam: 'A',
        serverNumber: 1,
      },
      history: [
        { id: 'h1', teamA: 6, teamB: 5, servingTeam: 'A', serverNumber: 1, timestamp: now - 35000, description: '+1 Team A (6 - 5)' },
      ],
      startedAt: now - 6 * 60 * 1000 - 18000,
      endsAt: now + 8 * 60 * 1000 + 42000,
      durationMinutes: 15,
      status: 'playing',
    },
    [game2Id]: {
      id: game2Id,
      courtId: 'c2',
      courtName: 'Court 2 (North)',
      teamA: { playerIds: match2.teamAIds },
      teamB: { playerIds: match2.teamBIds },
      score: {
        teamA: 9,
        teamB: 10,
        scoringMode: 'manual',
        targetScore: 11,
        winBy: 2,
        servingTeam: 'B',
        serverNumber: 2,
      },
      history: [],
      startedAt: now - 13 * 60 * 1000 - 30000,
      endsAt: now + 1 * 60 * 1000 + 30000,
      durationMinutes: 15,
      status: 'playing',
    },
    [game3Id]: {
      id: game3Id,
      courtId: 'c3',
      courtName: 'Court 3 (South)',
      teamA: { playerIds: match3.teamAIds },
      teamB: { playerIds: match3.teamBIds },
      score: {
        teamA: 2,
        teamB: 1,
        scoringMode: 'manual',
        targetScore: 11,
        winBy: 2,
        servingTeam: 'A',
        serverNumber: 1,
      },
      history: [],
      startedAt: now - 2 * 60 * 1000 - 45000,
      endsAt: now + 12 * 60 * 1000 + 15000,
      durationMinutes: 15,
      status: 'playing',
    },
  };

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

  // Rich Completed Game History
  const games: GameRecord[] = [
    {
      id: 'rec-1',
      courtId: 'c1',
      courtName: 'Court 1 (Championship)',
      playerIds: ['p1', 'p2', 'p5', 'p6'],
      teamAIds: ['p1', 'p2'],
      teamBIds: ['p5', 'p6'],
      score: { teamA: 11, teamB: 9, scoringMode: 'manual', targetScore: 11, winBy: 2, winner: 'A' },
      winner: 'A',
      startedAt: now - 75 * 60 * 1000,
      endedAt: now - 60 * 60 * 1000,
      durationMinutes: 15,
    },
    {
      id: 'rec-2',
      courtId: 'c2',
      courtName: 'Court 2 (North)',
      playerIds: ['p7', 'p8', 'p11', 'p12'],
      teamAIds: ['p7', 'p8'],
      teamBIds: ['p11', 'p12'],
      score: { teamA: 8, teamB: 11, scoringMode: 'manual', targetScore: 11, winBy: 2, winner: 'B' },
      winner: 'B',
      startedAt: now - 80 * 60 * 1000,
      endedAt: now - 65 * 60 * 1000,
      durationMinutes: 15,
    },
    {
      id: 'rec-3',
      courtId: 'c3',
      courtName: 'Court 3 (South)',
      playerIds: ['p24', 'p26', 'p13', 'p15'],
      teamAIds: ['p24', 'p26'],
      teamBIds: ['p13', 'p15'],
      score: { teamA: 11, teamB: 7, scoringMode: 'manual', targetScore: 11, winBy: 2, winner: 'A' },
      winner: 'A',
      startedAt: now - 50 * 60 * 1000,
      endedAt: now - 35 * 60 * 1000,
      durationMinutes: 15,
    },
    {
      id: 'rec-4',
      courtId: 'c4',
      courtName: 'Court 4 (East)',
      playerIds: ['p17', 'p18', 'p3', 'p4'],
      teamAIds: ['p17', 'p18'],
      teamBIds: ['p3', 'p4'],
      score: { teamA: 11, teamB: 4, scoringMode: 'manual', targetScore: 11, winBy: 2, winner: 'A' },
      winner: 'A',
      startedAt: now - 45 * 60 * 1000,
      endedAt: now - 30 * 60 * 1000,
      durationMinutes: 15,
    },
    {
      id: 'rec-5',
      courtId: 'c5',
      courtName: 'Court 5 (West)',
      playerIds: ['p9', 'p10', 'p22', 'p23'],
      teamAIds: ['p9', 'p10'],
      teamBIds: ['p22', 'p23'],
      score: { teamA: 7, teamB: 11, scoringMode: 'manual', targetScore: 11, winBy: 2, winner: 'B' },
      winner: 'B',
      startedAt: now - 40 * 60 * 1000,
      endedAt: now - 25 * 60 * 1000,
      durationMinutes: 15,
    },
  ];

  // Sample Reservations (Premium Feature)
  const todayStr = new Date().toISOString().split('T')[0];
  const reservations: Reservation[] = [
    {
      id: 'res-1',
      courtId: 'c4',
      courtName: 'Court 4 (East)',
      reservedFor: 'Metro League Semifinal Private Match',
      contactPhone: '+1 (555) 987-6543',
      startTime: '14:30',
      endTime: '15:30',
      date: todayStr,
      playerNames: ['David Miller', 'Rebecca Lin', 'Coach Tony', 'Gary Moore'],
      status: 'confirmed',
      notes: 'Please provide extra warm-up balls',
      createdAt: now - 7200000,
    },
    {
      id: 'res-2',
      courtId: 'c6',
      courtName: 'Court 6 (Covered)',
      reservedFor: 'Advanced Drills & Clinic Session',
      contactPhone: '+1 (555) 876-5432',
      startTime: '16:00',
      endTime: '17:30',
      date: todayStr,
      playerNames: ['Coach Sarah', 'Junior Team Elite'],
      status: 'confirmed',
      notes: 'Covered court requested due to afternoon sun',
      createdAt: now - 14400000,
    },
  ];

  // Sample Real-time Notifications
  const notifications: PlayerNotification[] = [
    {
      id: 'notif-1',
      playerId: 'p13',
      playerName: 'Rachel Lim',
      courtName: 'Court 2 (North)',
      type: 'court_ready',
      title: 'Court 2 Ready Soon',
      message: 'Queue #1 is on deck! Please report near Court 2 North.',
      timestamp: now - 90000,
      read: false,
    },
    {
      id: 'notif-2',
      playerId: 'p21',
      playerName: 'Sam Torres',
      type: 'queue_reminder',
      title: 'Welcome to Queue!',
      message: 'You checked in via QR Code. Estimated wait time is ~15 minutes.',
      timestamp: now - 600000,
      read: true,
    },
  ];

  return { players, courts, queue, activeGames, games, reservations, notifications };
}
