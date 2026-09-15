import {apiRequest, tokenStorage} from '@/api';
import {ApiRouteService} from '@/config/app-reference';
import {getMe, normalizeUser} from '@/services/profileApi';
import type {
  AuthSession,
  BrokerProfilePayload,
  CompleteProfilePayload,
  LoginPayload,
  UserProfile,
  UserRole,
  VerifyOtpPayload,
  VerifyOtpResult,
} from '@/types';
import StorageService from '@/utils/StorageService';

const STORAGE_KEY = 'a1land_auth_session';

interface SendOtpResponse {
  mobile?: string;
}

interface VerifyOtpResponse {
  token?: string;
  access_token?: string;
  tempToken?: string;
  accessToken?: string;
  refreshToken?: string;
  refresh_token?: string;
  isProfileComplete?: boolean;
  profileComplete?: boolean;
  is_profile_complete?: boolean;
  user?: UserProfile;
}

interface TokenResponse {
  token?: string;
  access_token?: string;
  accessToken?: string;
  refresh_token?: string;
  refreshToken?: string;
  user?: UserProfile;
}

interface RefreshTokenResponse extends TokenResponse {}

interface CompleteProfileRequest {
  name: string;
  email: string;
  cityId: number;
  avatarFileId: string | number | null;
  selectedRole: UserRole;
  brokerProfile?: BrokerProfilePayload;
}

function ensureMobile(mobile: string) {
  if (!/^\d{10}$/.test(mobile)) {
    throw new Error('Enter a valid 10 digit mobile number.');
  }
}

function ensureOtp(otp: string) {
  if (!/^\d{6}$/.test(otp)) {
    throw new Error('OTP must be 6 digits.');
  }
}

async function persistAuthTokens(tokens: {
  accessToken?: string;
  refreshToken?: string;
  tempToken?: string;
}) {
  if (tokens.accessToken) {
    await tokenStorage.setAccessToken(tokens.accessToken);
    await tokenStorage.removeTempToken();
  }

  if (tokens.refreshToken) {
    await tokenStorage.setRefreshToken(tokens.refreshToken);
  }

  if (tokens.tempToken) {
    await tokenStorage.setTempToken(tokens.tempToken);
  }
}

export async function clearLocalAuthSession(): Promise<void> {
  await tokenStorage.clearAuthTokens();
  await StorageService.removeItem(STORAGE_KEY);
}

function normalizeTokens(response?: TokenResponse | VerifyOtpResponse | null) {
  return {
    accessToken:
      response?.accessToken ?? response?.token ?? response?.access_token,
    refreshToken: response?.refreshToken ?? response?.refresh_token,
    tempToken:
      response && 'tempToken' in response ? response.tempToken : undefined,
  };
}

function normalizeVerifyOtpTokens(response: VerifyOtpResponse) {
  const isProfileComplete =
    response.isProfileComplete ??
    response.profileComplete ??
    response.is_profile_complete ??
    !!response.user;
  const genericToken = response.token ?? response.access_token;

  return {
    accessToken:
      response.accessToken ?? (isProfileComplete ? genericToken : undefined),
    refreshToken: response.refreshToken ?? response.refresh_token,
    tempToken:
      response.tempToken ?? (!isProfileComplete ? genericToken : undefined),
    isProfileComplete,
  };
}

export async function sendOtp(payload: LoginPayload): Promise<{mobile: string}> {
  ensureMobile(payload.mobile);

  const response = await apiRequest<SendOtpResponse, LoginPayload>({
    endpoint: ApiRouteService.auth.sendOtp,
    method: 'POST',
    body: payload,
    auth: 'none',
  });

  return {mobile: response.mobile ?? payload.mobile};
}

export async function verifyOtp(
  payload: VerifyOtpPayload,
): Promise<VerifyOtpResult> {
  ensureMobile(payload.mobile);
  ensureOtp(payload.otp);

  const response = await apiRequest<VerifyOtpResponse, VerifyOtpPayload>({
    endpoint: ApiRouteService.auth.verifyOtp,
    method: 'POST',
    body: payload,
    auth: 'none',
  });

  const tokens = normalizeVerifyOtpTokens(response);
  const user = normalizeUser(response.user);
  await persistAuthTokens(tokens);

  if (tokens.accessToken && user) {
    await persistSession({
      isLoggedIn: true,
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user,
      selectedRole: user.role,
    });
  }

  return {
    verified: true,
    tempToken: tokens.tempToken,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    isProfileComplete: tokens.isProfileComplete,
    user,
  };
}

export async function saveRole(role: UserRole): Promise<UserRole> {
  await apiRequest<{role?: UserRole}, {role: UserRole}>({
    endpoint: ApiRouteService.auth.selectRole,
    method: 'POST',
    body: {role},
    auth: 'temp',
  });

  const session = await getSession();
  await persistSession({...session, selectedRole: role});
  return role;
}

export async function completeProfile(
  payload: CompleteProfilePayload & {
    mobile: string;
    selectedRole: UserRole;
  },
): Promise<AuthSession> {
  const requestBody: CompleteProfileRequest = {
    name: payload.name,
    email: payload.email,
    cityId: payload.cityId ?? 12,
    avatarFileId: payload.avatarFileId ?? null,
    selectedRole: payload.selectedRole,
    ...(payload.selectedRole === 'broker' && payload.brokerProfile
      ? {brokerProfile: payload.brokerProfile}
      : {}),
  };

  const response = await apiRequest<TokenResponse | null, CompleteProfileRequest>({
    endpoint: ApiRouteService.auth.completeProfile,
    method: 'POST',
    body: requestBody,
    auth: 'temp',
  });

  const tokens = normalizeTokens(response);
  await persistAuthTokens(tokens);

  const responseUser = normalizeUser(response?.user);
  const me = await getMe().catch(() => responseUser);

  const session: AuthSession = {
    isLoggedIn: true,
    token: tokens.accessToken ?? (await tokenStorage.getAccessToken()) ?? undefined,
    refreshToken:
      tokens.refreshToken ?? (await tokenStorage.getRefreshToken()) ?? undefined,
    selectedRole: me?.role ?? payload.selectedRole,
    user: me ?? {
      id: payload.mobile,
      name: payload.name,
      mobile: payload.mobile,
      email: payload.email,
      city: payload.city,
      cityId: requestBody.cityId,
      avatarFileId: requestBody.avatarFileId ?? undefined,
      role: payload.selectedRole,
    },
  };

  await persistSession(session);
  return session;
}

export async function refreshToken(): Promise<{
  accessToken?: string;
  refreshToken?: string;
}> {
  const refreshTokenValue = await tokenStorage.getRefreshToken();
  if (!refreshTokenValue) {
    throw new Error('Refresh token is not available.');
  }

  const response = await apiRequest<
    RefreshTokenResponse,
    {refreshToken: string}
  >({
    endpoint: ApiRouteService.auth.refreshToken,
    method: 'POST',
    body: {refreshToken: refreshTokenValue},
    auth: 'none',
  });

  const tokens = normalizeTokens(response);
  await persistAuthTokens(tokens);
  return tokens;
}

export async function getSession(): Promise<AuthSession> {
  const session = await StorageService.getItem<AuthSession>(STORAGE_KEY);
  const [accessToken, refreshToken, tempToken] = await Promise.all([
    tokenStorage.getAccessToken(),
    tokenStorage.getRefreshToken(),
    tokenStorage.getTempToken(),
  ]);

  return {
    ...(session ?? {isLoggedIn: !!accessToken}),
    token: accessToken ?? session?.token,
    refreshToken: refreshToken ?? session?.refreshToken,
    tempToken: tempToken ?? session?.tempToken,
  };
}

export async function logout(): Promise<void> {
  try {
    await apiRequest<null>({
      endpoint: ApiRouteService.auth.logout,
      method: 'POST',
      auth: 'access',
    });
  } finally {
    await clearLocalAuthSession();
  }
}

/**
 * Fire-and-forget server-side session invalidation for the user-facing
 * Logout action. Local logout (token/session clear + redirect) has already
 * completed by the time this is called, so it deliberately:
 *  - takes the access token as a snapshot instead of reading it from
 *    tokenStorage (which is already cleared), so the backend can still
 *    identify and invalidate the right session/device;
 *  - uses `auth: 'none'` with a manual Authorization header so a 401 here
 *    never triggers the central apiClient's refresh/forced-logout handling
 *    (there is nothing left to refresh, and the app is already logged out);
 *  - swallows every failure (network error, 401, 500, ...) since it must
 *    never re-authenticate the user, show an error, or affect the local
 *    logout that already happened.
 */
export async function notifyServerLogout(accessToken?: string): Promise<void> {
  if (!accessToken) {
    return;
  }

  try {
    await apiRequest<null>({
      endpoint: ApiRouteService.auth.logout,
      method: 'POST',
      auth: 'none',
      headers: {Authorization: `Bearer ${accessToken}`},
      showLoader: false,
    });
  } catch {
    // Intentionally ignored — see comment above.
  }
}

export async function logoutAll(): Promise<void> {
  try {
    await apiRequest<null>({
      endpoint: ApiRouteService.auth.logoutAll,
      method: 'POST',
      auth: 'access',
    });
  } finally {
    await clearLocalAuthSession();
  }
}

export async function persistSession(session: AuthSession): Promise<AuthSession> {
  await StorageService.setItem(STORAGE_KEY, session);
  await persistAuthTokens({
    accessToken: session.token,
    refreshToken: session.refreshToken,
    tempToken: session.tempToken,
  });
  return session;
}

export {getMe};
