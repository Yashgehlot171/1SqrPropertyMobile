import {buildApiError} from './errorHandler';
import type {ApiEnvelope, ApiErrorResponse} from './types';

export async function parseApiResponse<T>(
  response: Response,
): Promise<T> {
  const text = await response.text();
  let payload: ApiEnvelope<T> | Record<string, unknown> | undefined;

  try {
    payload = text ? (JSON.parse(text) as ApiEnvelope<T>) : undefined;
  } catch {
    throw buildApiError(
      {
        success: false,
        message: text || 'Invalid response from server.',
        errors: [],
        meta: {},
      },
      response.status,
    );
  }

  if (response.status === 204) {
    return null as T;
  }

  if (!payload) {
    throw buildApiError(
      {
        success: false,
        message: 'Empty response from server.',
        errors: [],
        meta: {},
      },
      response.status,
    );
  }

  if ('success' in payload && payload.success === false) {
    throw buildApiError(payload as ApiErrorResponse, response.status);
  }

  if (!response.ok) {
    throw buildApiError(
      {
        success: false,
        message:
          typeof payload.message === 'string'
            ? payload.message
            : 'Request failed.',
        errors: [],
        meta:
          typeof payload.meta === 'object' && payload.meta !== null
            ? payload.meta
            : {},
      },
      response.status,
    );
  }

  if ('data' in payload) {
    return payload.data as T;
  }

  return payload as T;
}
