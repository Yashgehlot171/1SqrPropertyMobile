import {create} from 'zustand';

import {
  clearLocalAuthSession,
  logout as clearStoredSession,
  persistSession,
} from '@/services/authApi';
import {
  deleteAccount as deleteRemoteAccount,
  getBrokerProfile,
  getMe,
  updateBrokerProfile as updateRemoteBrokerProfile,
  updateMe,
} from '@/services/profileApi';
import {normalizeApiError} from '@/api';
import type {
  AuthSession,
  BrokerProfile,
  BrokerProfilePayload,
  ProfileUpdatePayload,
  UserProfile,
  UserRole,
} from '@/types';

interface AuthStore extends AuthSession {
  isBootstrapping: boolean;
  isProfileLoading: boolean;
  isBrokerProfileLoading: boolean;
  profileError?: string;
  pendingMobile?: string;
  setUser: (user: UserProfile) => void;
  refreshProfile: (options?: {forceBroker?: boolean}) => Promise<void>;
  updateUser: (updates: ProfileUpdatePayload) => Promise<void>;
  updateBrokerProfile: (updates: BrokerProfilePayload) => Promise<void>;
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
  isProfileLoading: false,
  isBrokerProfileLoading: false,
  profileError: undefined,
  isLoggedIn: false,
  user: undefined,
  brokerProfile: undefined,
  selectedRole: undefined,
  pendingMobile: undefined,
  setUser: user => set({user}),
  refreshProfile: async options => {
    const state = get();

    if (!state.token) {
      set({isProfileLoading: false, profileError: undefined});
      return;
    }

    set({isProfileLoading: true, profileError: undefined});

    try {
      const user = await getMe();
      let brokerProfile: BrokerProfile | undefined = state.brokerProfile;

      if ((user.role === 'broker' || options?.forceBroker) && user.role === 'broker') {
        set({isBrokerProfileLoading: true});
        brokerProfile = await getBrokerProfile();
      } else {
        brokerProfile = undefined;
      }

      const nextSession: AuthSession = {
        isLoggedIn: true,
        token: state.token,
        refreshToken: state.refreshToken,
        tempToken: state.tempToken,
        selectedRole: user.role,
        user,
        brokerProfile,
      };

      await persistSession(nextSession);
      set({
        ...nextSession,
        pendingMobile: user.mobile,
        isProfileLoading: false,
        isBrokerProfileLoading: false,
        profileError: undefined,
      });
    } catch (error) {
      const normalized = normalizeApiError(error);

      if (normalized.status === 401) {
        await clearLocalAuthSession();
        set({
          isLoggedIn: false,
          token: undefined,
          refreshToken: undefined,
          tempToken: undefined,
          user: undefined,
          brokerProfile: undefined,
          selectedRole: undefined,
          pendingMobile: undefined,
        });
      }

      set({
        isProfileLoading: false,
        isBrokerProfileLoading: false,
        profileError: normalized.message,
      });
      throw normalized;
    }
  },
  updateUser: async updates => {
    const state = get();
    if (!state.user) {
      return;
    }

    try {
      const nextUser = {...state.user, ...updates};
      const savedUser = await updateMe(updates);
      const nextSession: AuthSession = {
        isLoggedIn: state.isLoggedIn,
        token: state.token,
        refreshToken: state.refreshToken,
        tempToken: state.tempToken,
        selectedRole: state.selectedRole,
        brokerProfile: state.brokerProfile,
        user: savedUser ? {...nextUser, ...savedUser} : nextUser,
      };

      await persistSession(nextSession);
      set({
        user: nextSession.user,
        selectedRole: nextSession.user?.role,
        pendingMobile: nextSession.user?.mobile,
      });
    } catch (error) {
      const normalized = normalizeApiError(error);

      if (normalized.status === 401) {
        await clearLocalAuthSession();
        set({
          isLoggedIn: false,
          token: undefined,
          refreshToken: undefined,
          tempToken: undefined,
          user: undefined,
          brokerProfile: undefined,
          selectedRole: undefined,
          pendingMobile: undefined,
        });
      }

      throw normalized;
    }
  },
  updateBrokerProfile: async updates => {
    const state = get();
    if (state.user?.role !== 'broker') {
      return;
    }

    set({isBrokerProfileLoading: true, profileError: undefined});

    try {
      await updateRemoteBrokerProfile(updates);
      const brokerProfile = await getBrokerProfile();
      const nextSession: AuthSession = {
        isLoggedIn: state.isLoggedIn,
        token: state.token,
        refreshToken: state.refreshToken,
        tempToken: state.tempToken,
        selectedRole: state.selectedRole,
        user: state.user,
        brokerProfile,
      };

      await persistSession(nextSession);
      set({
        brokerProfile,
        isBrokerProfileLoading: false,
        profileError: undefined,
      });
    } catch (error) {
      const normalized = normalizeApiError(error);

      if (normalized.status === 401) {
        await clearLocalAuthSession();
        set({
          isLoggedIn: false,
          token: undefined,
          refreshToken: undefined,
          tempToken: undefined,
          user: undefined,
          brokerProfile: undefined,
          selectedRole: undefined,
          pendingMobile: undefined,
        });
      }

      set({
        isBrokerProfileLoading: false,
        profileError: normalized.message,
      });
      throw normalized;
    }
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
      isLoggedIn: !!payload?.token,
      token: payload?.token,
      refreshToken: payload?.refreshToken,
      tempToken: payload?.tempToken,
      user: payload?.user,
      brokerProfile: payload?.brokerProfile,
      selectedRole: payload?.selectedRole ?? payload?.user?.role,
      pendingMobile: payload?.user?.mobile,
    }),
  logout: async () => {
    await clearStoredSession();
    set({
      isBootstrapping: false,
      isLoggedIn: false,
      token: undefined,
      refreshToken: undefined,
      tempToken: undefined,
      user: undefined,
      brokerProfile: undefined,
      selectedRole: undefined,
      pendingMobile: undefined,
    });
  },
  deleteAccount: async () => {
    await deleteRemoteAccount();
    await clearLocalAuthSession();
    set({
      isBootstrapping: false,
      isLoggedIn: false,
      token: undefined,
      refreshToken: undefined,
      tempToken: undefined,
      user: undefined,
      brokerProfile: undefined,
      selectedRole: undefined,
      pendingMobile: undefined,
    });
  },
}));
