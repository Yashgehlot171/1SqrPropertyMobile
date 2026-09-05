import {useCallback, useState} from 'react';
import {Alert, Linking} from 'react-native';
import {
  launchCamera,
  launchImageLibrary,
  type Asset,
  type ImagePickerResponse,
} from 'react-native-image-picker';

import {generateId} from '@/services/serviceUtils';
import type {PropertyMedia} from '@/types';

export const MAX_PROPERTY_IMAGES = 10;
const IMAGE_QUALITY = 0.8;

function assetsToMedia(assets: Asset[]): PropertyMedia[] {
  return assets
    .filter((asset): asset is Asset & {uri: string} => Boolean(asset.uri))
    .map((asset, index) => ({
      // generateId() has millisecond resolution, so assets picked together
      // in one multi-select batch can all land on the same timestamp;
      // the batch index keeps ids unique even then. asset.id (when the
      // picker supplies one) is preferred as a genuinely stable identifier.
      id: asset.id ?? `${generateId('image')}-${index}`,
      type: 'image',
      uri: asset.uri,
    }));
}

function handleResponse(
  response: ImagePickerResponse,
  onPicked: (media: PropertyMedia[]) => void,
) {
  if (response.didCancel) {
    return;
  }

  if (response.errorCode === 'permission') {
    Alert.alert(
      'Permission required',
      'Please enable camera/photo access for this app in your device settings to continue.',
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Open Settings', onPress: () => Linking.openSettings()},
      ],
    );
    return;
  }

  if (response.errorCode) {
    Alert.alert(
      'Something went wrong',
      response.errorMessage ?? 'Could not access media. Please try again.',
    );
    return;
  }

  if (response.assets?.length) {
    onPicked(assetsToMedia(response.assets));
  }
}

export function usePropertyImagePicker(
  currentCount: number,
  onPicked: (media: PropertyMedia[]) => void,
) {
  const [isSheetVisible, setSheetVisible] = useState(false);

  const openSheet = useCallback(() => {
    if (currentCount >= MAX_PROPERTY_IMAGES) {
      Alert.alert(
        'Maximum 10 photos reached',
        'Remove a photo to add a new one.',
      );
      return;
    }
    setSheetVisible(true);
  }, [currentCount]);

  const closeSheet = useCallback(() => setSheetVisible(false), []);

  const takePhoto = useCallback(() => {
    setSheetVisible(false);
    launchCamera({mediaType: 'photo', quality: IMAGE_QUALITY}, response =>
      handleResponse(response, onPicked),
    );
  }, [onPicked]);

  const chooseFromGallery = useCallback(() => {
    setSheetVisible(false);
    const remainingSlots = MAX_PROPERTY_IMAGES - currentCount;
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: IMAGE_QUALITY,
        selectionLimit: remainingSlots,
      },
      response => handleResponse(response, onPicked),
    );
  }, [currentCount, onPicked]);

  return {isSheetVisible, openSheet, closeSheet, takePhoto, chooseFromGallery};
}
