import {STATIC_OTP} from '@/constants/appConstants';
import {primaryProfile} from '@/data/mockUsers';
import type {
  AuthSession,
  CompleteProfilePayload,
  LoginPayload,
  UserRole,
  VerifyOtpPayload,
} from '@/types';
import StorageService from '@/utils/StorageService';

import {simulateNetwork} from './serviceUtils';

const STORAGE_KEY = 'a1land_auth_session';

export async function sendOtp(payload: LoginPayload): Promise<{mobile: string}> {
  if (!/^\d{10}$/.test(payload.mobile)) {
    throw new Error('Enter a valid 10 digit mobile number.');
  }

  return simulateNetwork({mobile: payload.mobile});
}

export async function verifyOtp(
  payload: VerifyOtpPayload,
): Promise<{verified: boolean}> {
  if (!/^\d{6}$/.test(payload.otp)) {
    throw new Error('OTP must be 6 digits.');
  }

  return simulateNetwork({verified: payload.otp === STATIC_OTP});
}

export async function saveRole(role: UserRole): Promise<UserRole> {
  const session = await getSession();
  const nextSession: AuthSession = {...session, selectedRole: role};
  await StorageService.setItem(STORAGE_KEY, nextSession);
  return simulateNetwork(role);
}

export async function completeProfile(
  payload: CompleteProfilePayload & {
    mobile: string;
    selectedRole: UserRole;
  },
): Promise<AuthSession> {
  const existingSession = await getSession();
  const savedSession: AuthSession = {
    isLoggedIn: true,
    token: 'static-token',
    selectedRole: payload.selectedRole || existingSession.selectedRole || 'buyer',
    user: {
      ...primaryProfile,
      ...payload,
      mobile: payload.mobile,
      role: payload.selectedRole || existingSession.selectedRole || 'buyer',
    },
  };

  await StorageService.setItem(STORAGE_KEY, savedSession);
  return simulateNetwork(savedSession);
}

export async function getSession(): Promise<AuthSession> {
  const session = await StorageService.getItem<AuthSession>(STORAGE_KEY);
  return session ?? {isLoggedIn: false};
}

export async function logout(): Promise<void> {
  await StorageService.removeItem(STORAGE_KEY);
}

export async function deleteAccount(): Promise<void> {
  await StorageService.removeItem(STORAGE_KEY);
}

export async function persistSession(session: AuthSession): Promise<AuthSession> {
  await StorageService.setItem(STORAGE_KEY, session);
  return simulateNetwork(session);
}

// Currently using static data. Replace this with real API integration later.
