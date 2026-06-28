import {Linking, Share} from 'react-native';

import type {ConstructionQuote, DirectoryEntry} from '@/types';
import {formatCurrency} from '@/utils/formatCurrency';
import {showToast} from '@/utils/toast';

export async function callDirectoryPartner(entry: DirectoryEntry): Promise<void> {
  try {
    await Linking.openURL(`tel:${entry.phone}`);
  } catch {
    showToast(`Call ${entry.phone} from your device.`);
  }
}

export async function openWhatsAppForDirectoryPartner(
  entry: DirectoryEntry,
  context: string,
): Promise<void> {
  const message = encodeURIComponent(
    `Hi ${entry.name}, I need help with ${context} from UrbanKart services.`,
  );

  try {
    await Linking.openURL(`https://wa.me/91${entry.whatsapp}?text=${message}`);
  } catch {
    showToast('WhatsApp is not available on this device.');
  }
}

export async function shareConstructionQuote(
  quote: ConstructionQuote,
): Promise<void> {
  const message = [
    'UrbanKart Construction Estimate',
    `Quality: ${quote.quality}`,
    `Plot Size: ${quote.plotSizeSqFt} sq ft`,
    `Built-Up Area: ${quote.builtUpAreaSqFt} sq ft`,
    `Floors: ${quote.floors}`,
    `Material Cost: ${formatCurrency(quote.materialCost)}`,
    `Labour Cost: ${formatCurrency(quote.labourCost)}`,
    `Estimated Total: ${formatCurrency(quote.totalCost)}`,
    `Timeline: ${quote.estimatedTimelineMonths} months`,
  ].join('\n');

  try {
    await Share.share({
      title: 'Construction Estimate',
      message,
    });
  } catch {
    showToast('Unable to share this quotation right now.');
  }
}
