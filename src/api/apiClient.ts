import {baseConfig} from '@/config/base-config';
import {ApiRouteService} from '@/config/app-reference';
import {ROUTES} from '@/constants/routes';
import {resetAndNavigate} from '@/navigation/NavigationService';

import {runForceLogoutHandler} from './authSession';
import {apiLoader} from './loader';
import {parseApiResponse} from './responseParser';
import {tokenStorage} from './tokenStorage';
import type {ApiRequestOptions} from './types';

interface TokenRefreshResponse {
  token?: string;
  access_token?: string;
  accessToken?: string;
  refresh_token?: string;
  refreshToken?: string;
}

async function buildHeaders(options: ApiRequestOptions): Promise<Headers> {
  const headers = new Headers(options.headers);

  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }

  if (options.body !== undefined && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const authMode = options.auth ?? 'access';
  const token =
    authMode === 'temp'
      ? await tokenStorage.getTempToken()
      : authMode === 'access'
        ? await tokenStorage.getAccessToken()
        : null;

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return headers;
}

function buildUrl(endpoint: string): string {
  if (/^https?:\/\//.test(endpoint)) {
    return endpoint;
  }

  return `${baseConfig.baseUrl}${endpoint}`;
}

async function fetchWithTimeout(
  input: RequestInfo,
  init: RequestInit,
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), baseConfig.requestTimeoutMs);

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = await tokenStorage.getRefreshToken();

  if (!refreshToken) {
    return false;
  }

  const response = await fetchWithTimeout(buildUrl(ApiRouteService.auth.refreshToken), {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({refreshToken}),
  });

  if (!response.ok) {
    await tokenStorage.clearAuthTokens();
    return false;
  }

  const tokens = await parseApiResponse<TokenRefreshResponse>(response);
  const accessToken = tokens.accessToken ?? tokens.token ?? tokens.access_token;
  const nextRefreshToken = tokens.refreshToken ?? tokens.refresh_token;

  if (!accessToken) {
    await tokenStorage.clearAuthTokens();
    return false;
  }

  await tokenStorage.setAccessToken(accessToken);

  if (nextRefreshToken) {
    await tokenStorage.setRefreshToken(nextRefreshToken);
  }

  return true;
}

// Concurrent requests that all hit a 401 around the same time must share a
// single in-flight refresh attempt instead of each independently calling the
// refresh endpoint.
let inFlightRefresh: Promise<boolean> | null = null;

function refreshAccessTokenOnce(): Promise<boolean> {
  if (!inFlightRefresh) {
    inFlightRefresh = refreshAccessToken().finally(() => {
      inFlightRefresh = null;
    });
  }

  return inFlightRefresh;
}

// Likewise, a burst of concurrent 401s whose refresh attempt fails must only
// force the app into a logged-out state and redirect to Login once.
let inFlightForcedLogout: Promise<void> | null = null;

function forceLogoutOnce(): Promise<void> {
  if (!inFlightForcedLogout) {
    inFlightForcedLogout = (async () => {
      await runForceLogoutHandler();

      // Deferred so the RootNavigator has a chance to re-render into
      // AuthNavigator (driven by the store's isLoggedIn flag) before this
      // dispatch runs — resetting to a screen that isn't mounted yet would
      // otherwise be a no-op.
      setTimeout(() => {
        resetAndNavigate(ROUTES.root.auth, {screen: ROUTES.auth.login});
      }, 0);
    })().finally(() => {
      inFlightForcedLogout = null;
    });
  }

  return inFlightForcedLogout;
}

export async function apiRequest<TResponse, TBody = unknown>(
  options: ApiRequestOptions<TBody>,
): Promise<TResponse> {
  const {body, endpoint, method = 'GET'} = options;
  const shouldShowLoader = options.showLoader ?? true;

  if (shouldShowLoader) {
    apiLoader.start();
  }

  try {
    const headers = await buildHeaders(options);
    const requestBody =
      body === undefined
        ? undefined
        : body instanceof FormData
          ? body
          : JSON.stringify(body);
    let response = await fetchWithTimeout(buildUrl(endpoint), {
      method,
      headers,
      body: requestBody,
    });

    if (
      response.status === 401 &&
      (options.auth ?? 'access') === 'access' &&
      endpoint !== ApiRouteService.auth.refreshToken
    ) {
      const refreshed = await refreshAccessTokenOnce();

      if (refreshed) {
        response = await fetchWithTimeout(buildUrl(endpoint), {
          method,
          headers: await buildHeaders(options),
          body: requestBody,
        });
      } else {
        // Refresh token is invalid/expired (or the refresh call itself
        // failed) — tokens are already cleared inside refreshAccessToken.
        // Force the app back to a logged-out state exactly once, even if
        // several requests hit this branch concurrently.
        await forceLogoutOnce();
      }
    }

    return parseApiResponse<TResponse>(response);
  } finally {
    if (shouldShowLoader) {
      apiLoader.stop();
    }
  }
}
