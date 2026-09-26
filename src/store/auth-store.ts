'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AuthUser, UserRole, SkillLevel } from '@/types';

export const SEED_USERS: AuthUser[] = [
  {
    id: 'user-admin-seed',
    email: 'admin@picklequeue.com',
    password: 'admin123',
    name: 'Coach Marcus',
    role: 'admin',
    venueName: 'Metro Pickleball Arena',
    createdAt: 1711000000000,
  },
  {
    id: 'user-player-seed',
    email: 'player@picklequeue.com',
    password: 'player123',
    name: 'Alex Rivera',
    role: 'player',
    skillLevel: 'high-intermediate',
    createdAt: 1711000000000,
  },
];

export interface AuthState {
  users: AuthUser[];
  currentUser: AuthUser | null;
  isAuthenticated: boolean;
  isHydrated: boolean;

  setHydrated: (val: boolean) => void;
  login: (credentials: {
    email: string;
    password?: string;
    role?: UserRole;
  }) => { success: boolean; error?: string; user?: AuthUser };
  signup: (data: {
    email: string;
    password?: string;
    name: string;
    role: UserRole;
    venueName?: string;
    skillLevel?: SkillLevel;
  }) => { success: boolean; error?: string; user?: AuthUser };
  logout: () => void;
  quickDemoLogin: (role: UserRole) => AuthUser;
  loginById: (userId: string) => { success: boolean; error?: string; user?: AuthUser };
  loginWithQRToken: (token: string) => { success: boolean; error?: string; user?: AuthUser };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      users: SEED_USERS,
      currentUser: null,
      isAuthenticated: false,
      isHydrated: false,

      setHydrated: (val: boolean) => set({ isHydrated: val }),

      login: ({ email, password, role }) => {
        const cleanEmail = email.trim().toLowerCase();
        const users = get().users;

        const user = users.find(
          (u) =>
            u.email.toLowerCase() === cleanEmail &&
            (!role || u.role === role)
        );

        if (!user) {
          return {
            success: false,
            error: 'No account found with this email and role. Please sign up or check your credentials.',
          };
        }

        if (password && user.password && user.password !== password) {
          return {
            success: false,
            error: 'Invalid password. (Hint: Try demo credentials "admin123" or "player123")',
          };
        }

        set({ currentUser: user, isAuthenticated: true });
        return { success: true, user };
      },

      signup: (data) => {
        const cleanEmail = data.email.trim().toLowerCase();
        const users = get().users;

        const existing = users.find(
          (u) => u.email.toLowerCase() === cleanEmail && u.role === data.role
        );

        if (existing) {
          return {
            success: false,
            error: `An account with this email already exists as a ${data.role}. Please sign in.`,
          };
        }

        const newUser: AuthUser = {
          id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          email: cleanEmail,
          password: data.password || 'password123',
          name: data.name.trim() || (data.role === 'admin' ? 'Court Director' : 'Pickle Player'),
          role: data.role,
          venueName: data.role === 'admin' ? (data.venueName?.trim() || 'My Pickleball Center') : undefined,
          skillLevel: data.role === 'player' ? (data.skillLevel || 'low-intermediate') : undefined,
          createdAt: Date.now(),
        };

        set({
          users: [newUser, ...users],
          currentUser: newUser,
          isAuthenticated: true,
        });

        return { success: true, user: newUser };
      },

      logout: () => {
        set({ currentUser: null, isAuthenticated: false });
      },

      quickDemoLogin: (role: UserRole) => {
        const seedUser =
          SEED_USERS.find((u) => u.role === role) || SEED_USERS[0];
        set({ currentUser: seedUser, isAuthenticated: true });
        return seedUser;
      },

      loginById: (userId: string) => {
        const user = get().users.find((u) => u.id === userId);
        if (!user) {
          return { success: false, error: 'User account not found.' };
        }
        set({ currentUser: user, isAuthenticated: true });
        return { success: true, user };
      },

      loginWithQRToken: (token: string) => {
        const cleanToken = token.trim();
        let targetId = cleanToken;
        let targetRole: UserRole | undefined;

        if (cleanToken.startsWith('{') && cleanToken.endsWith('}')) {
          try {
            const parsed = JSON.parse(cleanToken);
            targetId = parsed.userId || parsed.id || '';
            targetRole = parsed.role;
          } catch {
          }
        } else if (cleanToken.includes('quickAuth=') || cleanToken.includes('token=')) {
          try {
            const urlObj = new URL(cleanToken, 'http://localhost');
            targetId = urlObj.searchParams.get('token') || urlObj.searchParams.get('userId') || '';
            targetRole = (urlObj.searchParams.get('quickAuth') || urlObj.searchParams.get('role')) as UserRole;
          } catch {
          }
        }

        if (targetId) {
          const user = get().users.find((u) => u.id === targetId || u.email.toLowerCase() === targetId.toLowerCase());
          if (user) {
            set({ currentUser: user, isAuthenticated: true });
            return { success: true, user };
          }
        }

        if (targetRole) {
          const user = get().quickDemoLogin(targetRole);
          return { success: true, user };
        }

        const fallbackUser = get().users[0] || SEED_USERS[1];
        set({ currentUser: fallbackUser, isAuthenticated: true });
        return { success: true, user: fallbackUser };
      },
    }),
    {
      name: 'picklequeue_auth',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);
