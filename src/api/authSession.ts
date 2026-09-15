/**
 * Thin indirection between the central apiClient and the auth store.
 *
 * apiClient.ts needs to clear the authenticated session when a token refresh
 * fails, but it cannot import `useAuthStore` directly: authStore -> authApi
 * -> `@/api` (this module's barrel) -> apiClient would form a circular
 * import. Instead, the auth store registers a handler here once (see
 * `src/store/authStore.ts`), and apiClient calls `runForceLogoutHandler()`
 * without ever importing the store.
 */
type ForceLogoutHandler = () => void | Promise<void>;

let forceLogoutHandler: ForceLogoutHandler | null = null;

export function registerForceLogoutHandler(handler: ForceLogoutHandler): void {
  forceLogoutHandler = handler;
}

export async function runForceLogoutHandler(): Promise<void> {
  if (forceLogoutHandler) {
    await forceLogoutHandler();
  }
}
