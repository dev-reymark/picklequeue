import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  Player,
  Court,
  QueueGroup,
  Settings,
  SkillLevel,
  PlayerStatus,
  PostGameAction,
  GameRecord,
  SessionInfo,
} from '@/types';
import { calculateBestTeams } from '@/lib/matchmaking';
import { generateId } from '@/lib/utils';
import { getSampleSessionData } from '@/lib/demo-data';
import { playSound } from '@/lib/sound';

export interface PickleballStoreState {
  players: Player[];
  courts: Court[];
  queue: QueueGroup[];
  games: GameRecord[];
  session: SessionInfo;
  settings: Settings;
  isHydrated: boolean;
  tutorialStep: number | null; // null if inactive, 0..4 if active

  // Actions
  setHydrated: (val: boolean) => void;
  startTutorial: () => void;
  nextTutorialStep: () => void;
  prevTutorialStep: () => void;
  skipTutorial: () => void;
  finishTutorial: () => void;

  addPlayer: (name: string, skillLevel: SkillLevel) => Player;
  editPlayer: (id: string, updates: Partial<Player>) => void;
  deletePlayer: (id: string) => void;
  setPlayerStatus: (id: string, status: PlayerStatus) => void;

  createQueueGroup: (playerIds: string[]) => void;
  removeQueueGroup: (groupId: string) => void;
  reorderQueue: (fromIndex: number, toIndex: number) => void;

  renameCourt: (courtId: string, newName: string) => void;
  addCourt: (name?: string) => void;
  removeCourt: (courtId: string) => void;

  assignGroupToCourt: (groupId: string, courtId: string) => void;
  assignNextQueueToCourt: (courtId: string) => void;
  addCourtTime: (courtId: string, additionalMinutes: number) => void;
  endGame: (courtId: string, action: PostGameAction) => void;

  updateSettings: (newSettings: Partial<Settings>) => void;
  startNewSession: (venueName?: string, sessionName?: string) => void;
  endCurrentSession: () => void;
  resetSession: () => void;
  clearAllData: () => void;
  loadDemoData: () => void;
  exportBackupJson: () => string;
  importBackupJson: (jsonString: string) => boolean;
}

const DEFAULT_SETTINGS: Settings = {
  venueName: 'Smash Point Pickleball',
  sessionName: 'Open Rotation Session',
  courtCount: 6,
  defaultGameDuration: 15,
  playersPerGroup: 4,
  queueMode: 'fifo',
  warningTimeSeconds: 120, // 2 minutes
  allowOvertime: true,
  timerDirection: 'countdown',
  defaultPostGameAction: 'waiting-pool',
  autoAssignNextGroup: false,
  minimumRestGames: 1,
  soundEnabled: true,
  warningSoundEnabled: true,
  soundVolume: 0.8,
  soundProfile: 'minimal',
  uiSounds: false,
  queueSounds: true,
  timerSounds: true,
  vibrationEnabled: false,
  hasCompletedTutorial: false,
};

function generateInitialCourts(count: number): Court[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `c${i + 1}`,
    name: `Court ${i + 1}`,
    status: 'available',
    playerIds: [],
  }));
}

export const usePickleballStore = create<PickleballStoreState>()(
  persist(
    (set, get) => ({
      players: [],
      courts: generateInitialCourts(6),
      queue: [],
      games: [],
      session: {
        id: generateId(),
        venueName: 'Smash Point Pickleball',
        sessionName: 'Open Rotation Session',
        startedAt: Date.now(),
      },
      settings: DEFAULT_SETTINGS,
      isHydrated: false,
      tutorialStep: null,

      setHydrated: (val: boolean) => set({ isHydrated: val }),

      startTutorial: () => set({ tutorialStep: 0 }),
      nextTutorialStep: () => {
        const curr = get().tutorialStep ?? 0;
        if (curr >= 4) {
          get().finishTutorial();
        } else {
          set({ tutorialStep: curr + 1 });
        }
      },
      prevTutorialStep: () => {
        const curr = get().tutorialStep ?? 0;
        set({ tutorialStep: Math.max(0, curr - 1) });
      },
      skipTutorial: () => {
        set((s) => ({
          tutorialStep: null,
          settings: { ...s.settings, hasCompletedTutorial: true },
        }));
      },
      finishTutorial: () => {
        set((s) => ({
          tutorialStep: null,
          settings: { ...s.settings, hasCompletedTutorial: true },
        }));
      },

      addPlayer: (name: string, skillLevel: SkillLevel) => {
        const newPlayer: Player = {
          id: generateId(),
          name: name.trim(),
          skillLevel,
          status: 'waiting',
          createdAt: Date.now(),
          gamesPlayed: 0,
        };

        set((state) => ({
          players: [...state.players, newPlayer],
        }));

        return newPlayer;
      },

      editPlayer: (id: string, updates: Partial<Player>) => {
        set((state) => ({
          players: state.players.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        }));
      },

      setPlayerStatus: (id: string, status: PlayerStatus) => {
        set((state) => ({
          players: state.players.map((p) => (p.id === id ? { ...p, status } : p)),
        }));
      },

      deletePlayer: (id: string) => {
        set((state) => {
          const players = state.players.filter((p) => p.id !== id);

          const queue = state.queue
            .map((q) => {
              const updatedPlayerIds = q.playerIds.filter((pid) => pid !== id);
              if (updatedPlayerIds.length === 0) return null;
              const groupPlayers = updatedPlayerIds
                .map((pid) => players.find((p) => p.id === pid))
                .filter(Boolean) as Player[];
              const match = calculateBestTeams(groupPlayers);
              return {
                ...q,
                playerIds: updatedPlayerIds,
                teamAIds: match.teamAIds,
                teamBIds: match.teamBIds,
                balance: match.balance,
              };
            })
            .filter(Boolean) as QueueGroup[];

          const courts = state.courts.map((court) => {
            if (court.playerIds.includes(id)) {
              const updatedPlayerIds = court.playerIds.filter((pid) => pid !== id);
              return {
                ...court,
                playerIds: updatedPlayerIds,
                status: updatedPlayerIds.length === 0 ? 'available' : court.status,
              };
            }
            return court;
          });

          return { players, queue, courts };
        });
      },

      createQueueGroup: (playerIds: string[]) => {
        const state = get();
        const targetSize = state.settings.playersPerGroup || 4;

        // Disallow invalid group sizes (must match session targetSize, or valid 2 or 4 players)
        if (playerIds.length !== targetSize && playerIds.length !== 2 && playerIds.length !== 4) {
          return;
        }

        const groupPlayers = playerIds
          .map((id) => state.players.find((p) => p.id === id))
          .filter(Boolean) as Player[];

        if (groupPlayers.length !== playerIds.length) return;

        const match = calculateBestTeams(groupPlayers);
        if (match.balance.statusLabel === 'Invalid Match Size') return;

        const newGroup: QueueGroup = {
          id: generateId(),
          playerIds,
          teamAIds: match.teamAIds,
          teamBIds: match.teamBIds,
          balance: match.balance,
          createdAt: Date.now(),
        };

        set((s) => ({
          queue: [...s.queue, newGroup],
          players: s.players.map((p) =>
            playerIds.includes(p.id) ? { ...p, status: 'queued' } : p
          ),
        }));
      },

      removeQueueGroup: (groupId: string) => {
        const state = get();
        const group = state.queue.find((q) => q.id === groupId);
        if (!group) return;

        set((s) => ({
          queue: s.queue.filter((q) => q.id !== groupId),
          players: s.players.map((p) =>
            group.playerIds.includes(p.id) ? { ...p, status: 'waiting' } : p
          ),
        }));
      },

      reorderQueue: (fromIndex: number, toIndex: number) => {
        set((state) => {
          const newQueue = [...state.queue];
          const [moved] = newQueue.splice(fromIndex, 1);
          newQueue.splice(toIndex, 0, moved);
          return { queue: newQueue };
        });
      },

      renameCourt: (courtId: string, newName: string) => {
        set((state) => ({
          courts: state.courts.map((c) =>
            c.id === courtId ? { ...c, name: newName.trim() } : c
          ),
        }));
      },

      addCourt: (name?: string) => {
        set((state) => {
          const nextIndex = state.courts.length + 1;
          const newCourt: Court = {
            id: generateId(),
            name: name?.trim() || `Court ${nextIndex}`,
            status: 'available',
            playerIds: [],
          };
          return {
            courts: [...state.courts, newCourt],
            settings: { ...state.settings, courtCount: state.courts.length + 1 },
          };
        });
      },

      removeCourt: (courtId: string) => {
        set((state) => {
          const target = state.courts.find((c) => c.id === courtId);
          if (!target || target.status === 'playing') return state; // Don't delete while playing

          const updatedCourts = state.courts.filter((c) => c.id !== courtId);
          return {
            courts: updatedCourts,
            settings: { ...state.settings, courtCount: updatedCourts.length },
          };
        });
      },

      assignGroupToCourt: (groupId: string, courtId: string) => {
        const state = get();
        const group = state.queue.find((q) => q.id === groupId);
        const court = state.courts.find((c) => c.id === courtId);

        if (!group || !court) return;

        const durationMinutes = state.settings.defaultGameDuration;
        const now = Date.now();
        const endsAt = now + durationMinutes * 60 * 1000;

        set((s) => ({
          queue: s.queue.filter((q) => q.id !== groupId),
          courts: s.courts.map((c) =>
            c.id === courtId
              ? {
                  ...c,
                  status: 'playing',
                  playerIds: group.playerIds,
                  teamAIds: group.teamAIds,
                  teamBIds: group.teamBIds,
                  balance: group.balance,
                  startedAt: now,
                  endsAt,
                  durationMinutes,
                }
              : c
          ),
          players: s.players.map((p) =>
            group.playerIds.includes(p.id)
              ? { ...p, status: 'playing', gamesPlayed: p.gamesPlayed + 1 }
              : p
          ),
        }));
      },

      assignNextQueueToCourt: (courtId: string) => {
        const state = get();
        if (state.queue.length === 0) return;
        const nextGroup = state.queue[0];
        get().assignGroupToCourt(nextGroup.id, courtId);
      },

      addCourtTime: (courtId: string, additionalMinutes: number) => {
        set((state) => ({
          courts: state.courts.map((c) => {
            if (c.id === courtId && c.status === 'playing' && c.endsAt) {
              const currentEndsAt = Math.max(c.endsAt, Date.now());
              return {
                ...c,
                endsAt: currentEndsAt + additionalMinutes * 60 * 1000,
                durationMinutes: (c.durationMinutes || state.settings.defaultGameDuration) + additionalMinutes,
              };
            }
            return c;
          }),
        }));
      },

      endGame: (courtId: string, action: PostGameAction) => {
        const state = get();
        const court = state.courts.find((c) => c.id === courtId);
        if (!court || court.status !== 'playing') return;

        const courtPlayerIds = [...court.playerIds];
        const now = Date.now();

        // Record completed match into history
        const newGameRecord: GameRecord = {
          id: generateId(),
          courtId: court.id,
          courtName: court.name,
          playerIds: court.playerIds,
          teamAIds: court.teamAIds || [],
          teamBIds: court.teamBIds || [],
          startedAt: court.startedAt || now - 15 * 60 * 1000,
          endedAt: now,
          durationMinutes: court.durationMinutes || state.settings.defaultGameDuration,
        };

        // 1. Reset court to available
        const updatedCourts = state.courts.map((c) =>
          c.id === courtId
            ? {
                ...c,
                status: 'available' as const,
                playerIds: [],
                teamAIds: undefined,
                teamBIds: undefined,
                balance: undefined,
                startedAt: undefined,
                endsAt: undefined,
                durationMinutes: undefined,
              }
            : c
        );

        // 2. Determine exiting players status and decrement rest for existing resting players
        let updatedPlayers = state.players.map((p) => {
          // If player was on this finished court:
          if (courtPlayerIds.includes(p.id)) {
            if (action === 'remove') {
              return { ...p, status: 'inactive' as const, restGamesRemaining: 0 };
            }
            if (action === 'requeue') {
              return { ...p, status: 'queued' as const, restGamesRemaining: 0 };
            }
            if (action === 'resting') {
              const restGames = state.settings.minimumRestGames > 0 ? state.settings.minimumRestGames : 1;
              return { ...p, status: 'resting' as const, restGamesRemaining: restGames };
            }
            // Default: waiting-pool
            return { ...p, status: 'waiting' as const, restGamesRemaining: 0 };
          }

          // If another player was resting, decrement their rest counter since a match finished
          if (p.status === 'resting' && (p.restGamesRemaining ?? 0) > 0) {
            const nextRemaining = (p.restGamesRemaining ?? 1) - 1;
            if (nextRemaining <= 0) {
              // Rest period over, automatically return to waiting pool
              return { ...p, status: 'waiting' as const, restGamesRemaining: 0 };
            }
            return { ...p, restGamesRemaining: nextRemaining };
          }

          return p;
        });

        // 3. Update queue (if requeue action, append to queue)
        let updatedQueue = [...state.queue];
        if (action === 'requeue') {
          const requeuedPlayers = courtPlayerIds
            .map((id) => state.players.find((p) => p.id === id))
            .filter(Boolean) as Player[];

          const match = calculateBestTeams(requeuedPlayers);
          const newGroup: QueueGroup = {
            id: generateId(),
            playerIds: courtPlayerIds,
            teamAIds: match.teamAIds,
            teamBIds: match.teamBIds,
            balance: match.balance,
            createdAt: Date.now(),
          };
          updatedQueue.push(newGroup);
        }

        // 4. Auto-Assign Next Group: if enabled and queue has groups, immediately start Queue #1 on this court
        let finalCourts = updatedCourts;
        if (state.settings.autoAssignNextGroup && updatedQueue.length > 0) {
          const nextGroup = updatedQueue[0];
          updatedQueue = updatedQueue.slice(1);

          const gameDuration = court.durationMinutes || state.settings.defaultGameDuration;
          finalCourts = finalCourts.map((c) =>
            c.id === courtId
              ? {
                  ...c,
                  status: 'playing' as const,
                  playerIds: nextGroup.playerIds,
                  teamAIds: nextGroup.teamAIds,
                  teamBIds: nextGroup.teamBIds,
                  balance: nextGroup.balance,
                  startedAt: now,
                  endsAt: now + gameDuration * 60 * 1000,
                  durationMinutes: gameDuration,
                }
              : c
          );

          updatedPlayers = updatedPlayers.map((p) =>
            nextGroup.playerIds.includes(p.id)
              ? { ...p, status: 'playing' as const, gamesPlayed: p.gamesPlayed + 1 }
              : p
          );

          playSound.assignCourt();
        }

        set((s) => ({
          courts: finalCourts,
          games: [newGameRecord, ...s.games],
          queue: updatedQueue,
          players: updatedPlayers,
        }));
      },

      updateSettings: (newSettings: Partial<Settings>) => {
        set((state) => {
          const mergedSettings = { ...state.settings, ...newSettings };
          let courts = [...state.courts];

          if (
            newSettings.courtCount !== undefined &&
            newSettings.courtCount !== state.settings.courtCount
          ) {
            const count = newSettings.courtCount;
            if (count > courts.length) {
              for (let i = courts.length; i < count; i++) {
                courts.push({
                  id: `c${i + 1}`,
                  name: `Court ${i + 1}`,
                  status: 'available',
                  playerIds: [],
                });
              }
            } else if (count < courts.length) {
              courts = courts.slice(0, count);
            }
          }

          return { settings: mergedSettings, courts };
        });
      },

      startNewSession: (venueName, sessionName) => {
        set((state) => ({
          session: {
            id: generateId(),
            venueName: venueName || state.settings.venueName,
            sessionName: sessionName || state.settings.sessionName,
            startedAt: Date.now(),
          },
          games: [],
          queue: [],
          courts: state.courts.map((c) => ({
            ...c,
            status: 'available',
            playerIds: [],
            startedAt: undefined,
            endsAt: undefined,
          })),
          players: state.players.map((p) => ({
            ...p,
            status: 'waiting',
            gamesPlayed: 0,
          })),
        }));
      },

      endCurrentSession: () => {
        set((state) => ({
          session: {
            ...state.session,
            endedAt: Date.now(),
          },
        }));
      },

      resetSession: () => {
        set((state) => ({
          courts: generateInitialCourts(state.settings.courtCount),
          queue: [],
          games: [],
          players: state.players.map((p) => ({
            ...p,
            status: 'waiting',
            gamesPlayed: 0,
          })),
        }));
      },

      clearAllData: () => {
        set({
          players: [],
          courts: generateInitialCourts(6),
          queue: [],
          games: [],
          session: {
            id: generateId(),
            venueName: 'Smash Point Pickleball',
            sessionName: 'Open Rotation Session',
            startedAt: Date.now(),
          },
          settings: DEFAULT_SETTINGS,
        });
      },

      loadDemoData: () => {
        const demo = getSampleSessionData();
        set((state) => ({
          players: demo.players.map((p) => ({
            ...p,
            status: p.status === 'available' ? 'waiting' : p.status,
          })),
          courts: demo.courts,
          queue: demo.queue,
          games: [],
          session: {
            id: generateId(),
            venueName: 'Smash Point Pickleball',
            sessionName: 'Tuesday Evening League',
            startedAt: Date.now() - 4200000,
          },
          settings: {
            ...state.settings,
            courtCount: 6,
            defaultGameDuration: 15,
            venueName: 'Smash Point Pickleball',
            sessionName: 'Tuesday Evening League',
          },
        }));
      },

      exportBackupJson: () => {
        const state = get();
        const backupData = {
          version: '1.1.0',
          exportedAt: new Date().toISOString(),
          venueName: state.settings.venueName,
          session: state.session,
          settings: state.settings,
          players: state.players,
          courts: state.courts,
          queue: state.queue,
          games: state.games,
        };
        return JSON.stringify(backupData, null, 2);
      },

      importBackupJson: (jsonString: string) => {
        try {
          const data = JSON.parse(jsonString);
          if (!data || !Array.isArray(data.players) || !Array.isArray(data.courts)) {
            return false;
          }

          set({
            players: data.players || [],
            courts: data.courts || generateInitialCourts(6),
            queue: data.queue || [],
            games: data.games || [],
            session: data.session || {
              id: generateId(),
              venueName: data.settings?.venueName || 'Imported Session',
              sessionName: data.settings?.sessionName || 'Imported Session',
              startedAt: Date.now(),
            },
            settings: { ...DEFAULT_SETTINGS, ...(data.settings || {}) },
          });

          return true;
        } catch {
          return false;
        }
      },
    }),
    {
      name: 'picklequeue-state',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHydrated(true);
          // Safeguard: Ensure settings has all new keys
          state.settings = {
            ...DEFAULT_SETTINGS,
            ...(state.settings || {}),
            venueName: state.settings?.venueName || DEFAULT_SETTINGS.venueName,
            sessionName: state.settings?.sessionName || DEFAULT_SETTINGS.sessionName,
          };
          // If first run and hasn't completed tutorial, start tutorial
          if (!state.settings.hasCompletedTutorial) {
            state.startTutorial();
          }
        }
      },
    }
  )
);
