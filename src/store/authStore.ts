import {create} from 'zustand';

import {primaryProfile} from '@/data/mockUsers';
import {
  deleteAccount as clearDeletedSession,
  logout as clearStoredSession,
  persistSession,
} from '@/services/authApi';
import type {AuthSession, UserProfile, UserRole} from '@/types';

interface AuthStore extends AuthSession {
  isBootstrapping: boolean;
  pendingMobile?: string;
  setUser: (user: UserProfile) => void;
  updateUser: (updates: Partial<UserProfile>) => Promise<void>;
  setRole: (role: UserRole) => void;
  setPendingMobile: (mobile: string) => void;
  hydrateSession: (session: AuthSession) => void;
  finishBootstrap: () => void;
  clearTransientAuth: () => void;
  login: (payload?: Partial<AuthSession>) => void;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  isBootstrapping: true,
  isLoggedIn: false,
  user: undefined,
  selectedRole: undefined,
  pendingMobile: undefined,
  setUser: user => set({user}),
  updateUser: async updates => {
    const state = get();
    if (!state.user) {
      return;
    }

    const nextUser = {...state.user, ...updates};
    const nextSession: AuthSession = {
      isLoggedIn: state.isLoggedIn,
      token: state.token,
      selectedRole: state.selectedRole,
      user: nextUser,
    };

    await persistSession(nextSession);
    set({
      user: nextUser,
      selectedRole: nextUser.role,
      pendingMobile: nextUser.mobile,
    });
  },
  setRole: selectedRole => set({selectedRole}),
  setPendingMobile: pendingMobile => set({pendingMobile}),
  hydrateSession: session =>
    set({
      ...session,
      isBootstrapping: false,
      pendingMobile: session.user?.mobile,
    }),
  finishBootstrap: () => set({isBootstrapping: false}),
  clearTransientAuth: () =>
    set({
      pendingMobile: undefined,
      selectedRole: undefined,
    }),
  login: payload =>
    set({
      isBootstrapping: false,
      isLoggedIn: true,
      token: payload?.token ?? 'static-token',
      user: payload?.user ?? primaryProfile,
      selectedRole: payload?.selectedRole ?? primaryProfile.role,
      pendingMobile: payload?.user?.mobile ?? primaryProfile.mobile,
    }),
  logout: async () => {
    await clearStoredSession();
    set({
      isBootstrapping: false,
      isLoggedIn: false,
      token: undefined,
      user: undefined,
      selectedRole: undefined,
      pendingMobile: undefined,
    });
  },
  deleteAccount: async () => {
    await clearDeletedSession();
    set({
      isBootstrapping: false,
      isLoggedIn: false,
      token: undefined,
      user: undefined,
      selectedRole: undefined,
      pendingMobile: undefined,
    });
  },
}));
