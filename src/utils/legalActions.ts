import {Linking} from 'react-native';

import type {LegalTeam} from '@/types';
import {showToast} from '@/utils/toast';

export async function callLegalTeam(team: LegalTeam): Promise<void> {
  try {
    await Linking.openURL(`tel:${team.phone}`);
  } catch {
    showToast(`Call ${team.phone} from your device.`);
  }
}

export async function openWhatsAppForLegalTeam(
  team: LegalTeam,
  context: string,
): Promise<void> {
  const message = encodeURIComponent(
    `Hi ${team.name}, I need help with ${context} from UrbanKart legal services.`,
  );

  try {
    await Linking.openURL(`https://wa.me/91${team.whatsapp}?text=${message}`);
  } catch {
    showToast('WhatsApp is not available on this device.');
  }
}
