import {launchImageLibrary} from 'react-native-image-picker';
import {uploadFile} from '@/api';
import type {UploadedDocument} from '@/types';

/** Existing native image picker: uploads real images, never placeholder URIs. */
export async function pickRequestAttachment(module: 'loan' | 'legal' | 'support' | 'construction'): Promise<UploadedDocument | undefined> {
  const result = await launchImageLibrary({mediaType: 'photo', selectionLimit: 1});
  if (result.didCancel) { return undefined; }
  if (result.errorCode) { throw new Error(result.errorMessage ?? 'Unable to open photos.'); }
  const asset = result.assets?.[0];
  if (!asset?.uri) { return undefined; }
  const type = asset.type ?? 'image/jpeg';
  if (!['image/jpeg', 'image/png'].includes(type)) { throw new Error('Choose a JPG or PNG image.'); }
  const name = asset.fileName ?? ('attachment.' + (type === 'image/png' ? 'png' : 'jpg'));
  const uploaded = await uploadFile({uri: asset.uri, name, type}, {module, visibility: 'private'});
  return {id: String(uploaded.fileId), name, type: type === 'image/png' ? 'PNG' : 'JPG', uri: asset.uri,
    uploadedAt: new Date().toISOString(), status: 'uploaded'};
}
