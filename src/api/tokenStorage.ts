import StorageService from '@/utils/StorageService';

const ACCESS_TOKEN_KEY = 'a1property_access_token';
const REFRESH_TOKEN_KEY = 'a1property_refresh_token';
const TEMP_TOKEN_KEY = 'a1property_temp_token';

export const tokenStorage = {
  async getAccessToken() {
    return StorageService.getItem<string>(ACCESS_TOKEN_KEY);
  },

  async setAccessToken(token: string) {
    await StorageService.setItem(ACCESS_TOKEN_KEY, token);
  },

  async removeAccessToken() {
    await StorageService.removeItem(ACCESS_TOKEN_KEY);
  },

  async getRefreshToken() {
    return StorageService.getItem<string>(REFRESH_TOKEN_KEY);
  },

  async setRefreshToken(token: string) {
    await StorageService.setItem(REFRESH_TOKEN_KEY, token);
  },

  async removeRefreshToken() {
    await StorageService.removeItem(REFRESH_TOKEN_KEY);
  },

  async getTempToken() {
    return StorageService.getItem<string>(TEMP_TOKEN_KEY);
  },

  async setTempToken(token: string) {
    await StorageService.setItem(TEMP_TOKEN_KEY, token);
  },

  async removeTempToken() {
    await StorageService.removeItem(TEMP_TOKEN_KEY);
  },

  async clearAuthTokens() {
    await Promise.all([
      StorageService.removeItem(ACCESS_TOKEN_KEY),
      StorageService.removeItem(REFRESH_TOKEN_KEY),
      StorageService.removeItem(TEMP_TOKEN_KEY),
    ]);
  },
};
