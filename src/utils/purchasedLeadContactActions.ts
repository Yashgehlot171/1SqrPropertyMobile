import {Linking} from 'react-native';
import {showToast} from '@/utils/toast';

const contactDigits = (mobile: string) => mobile.replace(/\D/g, '');

export function normalizePurchasedLeadPhone(mobile: string): {dialNumber: string; whatsappNumber: string} | null {
  const trimmed = mobile.trim();
  const digits = contactDigits(trimmed);
  if (digits.length < 10 || digits.length > 15) return null;
  const international00 = trimmed.startsWith('00');
  const internationalDigits = international00 ? digits.slice(2) : digits;
  if (internationalDigits.length < 10) return null;
  const dialNumber = trimmed.startsWith('+') || international00 ? `+${internationalDigits}` : digits;
  let whatsappNumber = internationalDigits;
  if (internationalDigits.length === 10) whatsappNumber = `91${internationalDigits}`;
  else if (internationalDigits.length === 11 && internationalDigits.startsWith('0')) whatsappNumber = `91${internationalDigits.slice(1)}`;
  return {dialNumber, whatsappNumber};
}

export async function callPurchasedLeadBuyer(mobile: string): Promise<void> {
  const phone = normalizePurchasedLeadPhone(mobile);
  if (!phone) { showToast('This Buyer phone number is not valid for calling.'); return; }
  try { await Linking.openURL(`tel:${phone.dialNumber}`); }
  catch { showToast('Unable to open the phone app on this device.'); }
}

export async function openPurchasedLeadWhatsApp(buyerName: string, mobile: string): Promise<void> {
  const phone = normalizePurchasedLeadPhone(mobile);
  if (!phone) { showToast('This Buyer phone number is not valid for WhatsApp.'); return; }
  const message = encodeURIComponent(`Hi ${buyerName}, I am following up on your property requirement on 1SQUARE.`);
  try { await Linking.openURL(`https://wa.me/${phone.whatsappNumber}?text=${message}`); }
  catch { showToast('WhatsApp is not available on this device.'); }
}
