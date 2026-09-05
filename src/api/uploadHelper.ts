import {ApiRouteService} from '@/config/app-reference';

import {apiRequest} from './apiClient';
import type {UploadFileInput, UploadFileResponse} from './types';

export async function uploadFile(
  file: UploadFileInput,
): Promise<UploadFileResponse> {
  const formData = new FormData();
  formData.append('file', file as unknown as Blob);

  return apiRequest<UploadFileResponse, FormData>({
    endpoint: ApiRouteService.upload.file,
    method: 'POST',
    body: formData,
    auth: 'access',
  });
}
