export interface ApiMeta {
  requestId?: string;
  timestamp?: string;
  [key: string]: unknown;
}

export interface ApiSuccessResponse<T> {
  success: true;
  message: string;
  data: T;
  meta?: ApiMeta;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: unknown[];
  meta?: ApiMeta;
}

export type ApiEnvelope<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface ApiRequestOptions<TBody = unknown> {
  endpoint: string;
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: TBody;
  headers?: Record<string, string>;
  auth?: 'none' | 'access' | 'temp';
  showLoader?: boolean;
  showSuccessToast?: boolean;
  showErrorAlert?: boolean;
}

export interface ApiErrorDetails {
  status?: number;
  message: string;
  errors?: unknown[];
  requestId?: string;
}

export interface UploadFileInput {
  uri: string;
  name: string;
  type: string;
}

export interface UploadFileResponse {
  fileId: string;
  url?: string;
}
