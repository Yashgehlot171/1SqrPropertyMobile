import {baseConfig} from '@/config/base-config';

export const apiClient = {
  baseURL: baseConfig.baseUrl,
  timeout: 10000,
} as const;

export interface StaticApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export async function buildStaticResponse<T>(
  data: T,
  message = 'Success',
): Promise<StaticApiResponse<T>> {
  return {
    success: true,
    data,
    message,
  };
}

// Currently using static data. Replace this with real API integration later.
