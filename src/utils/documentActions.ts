import {Linking} from 'react-native';

import type {UploadedDocument} from '@/types';
import {showToast} from '@/utils/toast';

export async function openUploadedDocument(document: UploadedDocument) {
  try {
    const supported = await Linking.canOpenURL(document.uri);
    if (!supported) {
      showToast('This document cannot be opened on this device.');
      return;
    }
    await Linking.openURL(document.uri);
  } catch {
    showToast('Unable to open this document.');
  }
}
