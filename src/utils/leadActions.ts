import {Linking} from 'react-native';

import type {Lead} from '@/types';
import {showToast} from '@/utils/toast';

export async function callLeadBuyer(lead: Lead): Promise<void> {
  try {
    await Linking.openURL(`tel:${lead.buyer.mobile}`);
  } catch {
    showToast(`Call ${lead.buyer.mobile} from your device.`);
  }
}

export async function openWhatsAppForLead(lead: Lead): Promise<void> {
  const message = encodeURIComponent(
    `Hi ${lead.buyer.name}, following up on ${lead.property.title} from UrbanKart.`,
  );

  try {
    await Linking.openURL(`https://wa.me/91${lead.buyer.mobile}?text=${message}`);
  } catch {
    showToast('WhatsApp is not available on this device.');
  }
}
