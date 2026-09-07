import {ApiRouteService} from '@/config/app-reference';

import {apiRequest} from './apiClient';
import type {UploadFileInput, UploadFileResponse} from './types';

// Mirrors the backend's `uploadModules` Zod enum exactly
// (1SqrPropertyBackend/src/validators/upload.validator.ts) — `module` is a required
// field on POST /uploads, not a default/optional one, so every caller must supply it.
export type UploadModule =
  | 'profile'
  | 'property'
  | 'broker'
  | 'construction'
  | 'legal'
  | 'loan'
  | 'support'
  | 'supplier'
  | 'provider'
  | 'notification'
  | 'banner'
  | 'cms';

export interface UploadFileOptions {
  /** Required by the backend's createUploadSchema; identifies which feature owns the file. */
  module: UploadModule;
  /** Numeric/bigint-coercible id of the record this file will be attached to, if known yet. */
  entityId?: string | number;
  /**
   * Optional client-declared category. The backend independently derives the real
   * category from the uploaded file's mimetype and rejects the request if this
   * disagrees, so only pass this when you are certain it matches the actual file
   * (e.g. a known-PDF document) — omit it to let the backend infer the category.
   */
  fileType?: 'image' | 'video' | 'document';
  isPublic?: boolean;
  visibility?: 'public' | 'private';
}

export async function uploadFile(
  file: UploadFileInput,
  options: UploadFileOptions,
): Promise<UploadFileResponse> {
  const formData = new FormData();
  formData.append('file', file as unknown as Blob);
  formData.append('module', options.module);

  if (options.entityId !== undefined) {
    formData.append('entityId', String(options.entityId));
  }
  if (options.fileType) {
    formData.append('fileType', options.fileType);
  }
  if (options.isPublic !== undefined) {
    formData.append('isPublic', String(options.isPublic));
  }
  if (options.visibility) {
    formData.append('visibility', options.visibility);
  }

  return apiRequest<UploadFileResponse, FormData>({
    endpoint: ApiRouteService.upload.file,
    method: 'POST',
    body: formData,
    auth: 'access',
  });
}
