import {Alert} from 'react-native';

import type {ApiErrorDetails, ApiErrorResponse} from './types';

export class ApiError extends Error {
  status?: number;
  errors?: unknown[];
  requestId?: string;

  constructor(details: ApiErrorDetails) {
    super(details.message);
    this.name = 'ApiError';
    this.status = details.status;
    this.errors = details.errors;
    this.requestId = details.requestId;
  }
}

export function normalizeApiError(
  error: unknown,
  fallbackMessage = 'Something went wrong. Please try again.',
): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (error instanceof Error) {
    return new ApiError({message: error.message || fallbackMessage});
  }

  return new ApiError({message: fallbackMessage});
}

export function buildApiError(
  response: ApiErrorResponse,
  status?: number,
): ApiError {
  return new ApiError({
    status,
    message: response.message || 'Request failed.',
    errors: response.errors,
    requestId: response.meta?.requestId,
  });
}

export function showApiError(error: unknown) {
  const normalized = normalizeApiError(error);
  Alert.alert('1Square Property', normalized.message);
}
