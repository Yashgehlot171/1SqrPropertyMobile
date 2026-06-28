import {Linking, Share} from 'react-native';

import type {Property} from '@/types';
import {buildPropertyShareMessage} from '@/utils/propertyUtils';
import {showToast} from '@/utils/toast';

export async function shareProperty(property: Property): Promise<void> {
  try {
    await Share.share({
      message: buildPropertyShareMessage(property),
      title: property.title,
    });
  } catch {
    showToast('Unable to share this property right now.');
  }
}

export async function callPropertyOwner(property: Property): Promise<void> {
  try {
    await Linking.openURL(`tel:${property.owner.mobile}`);
  } catch {
    showToast(`Call ${property.owner.mobile} from your device.`);
  }
}

export async function openWhatsAppForProperty(property: Property): Promise<void> {
  const message = encodeURIComponent(
    `Hi ${property.owner.name}, I am interested in ${property.title} listed on UrbanKart.`,
  );

  try {
    await Linking.openURL(`https://wa.me/91${property.owner.mobile}?text=${message}`);
  } catch {
    showToast('WhatsApp is not available on this device.');
  }
}
