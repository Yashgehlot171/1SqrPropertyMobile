import {Alert, Linking} from 'react-native';
import {callPurchasedLeadBuyer, normalizePurchasedLeadPhone, openPurchasedLeadWhatsApp} from '../src/utils/purchasedLeadContactActions';

beforeEach(() => jest.restoreAllMocks());

test('normalizes local Indian phone and preserves explicit international dial prefix', () => {
  expect(normalizePurchasedLeadPhone('98765 43210')).toEqual({dialNumber:'9876543210',whatsappNumber:'919876543210'});
  expect(normalizePurchasedLeadPhone('+1 (415) 555-2671')).toEqual({dialNumber:'+14155552671',whatsappNumber:'14155552671'});
  expect(normalizePurchasedLeadPhone('0044 20 7946 0958')).toEqual({dialNumber:'+442079460958',whatsappNumber:'442079460958'});
  expect(normalizePurchasedLeadPhone('invalid')).toBeNull();
});

test('call opens a device-compatible tel URI', async () => {
  const openURL=jest.spyOn(Linking,'openURL').mockResolvedValue(undefined);
  await callPurchasedLeadBuyer('+91 98765 43210');
  expect(openURL).toHaveBeenCalledWith('tel:+919876543210');
});

test('WhatsApp uses wa.me with normalized number and encoded context', async () => {
  const openURL=jest.spyOn(Linking,'openURL').mockResolvedValue(undefined);
  await openPurchasedLeadWhatsApp('Buyer Name','9876543210');
  expect(openURL).toHaveBeenCalledWith(expect.stringMatching(/^https:\/\/wa\.me\/919876543210\?text=/));
  const url=openURL.mock.calls[openURL.mock.calls.length-1][0];
  expect(decodeURIComponent(url.split('text=')[1])).toContain('Buyer Name');
});

test('invalid number and unavailable WhatsApp are handled without throwing', async () => {
  const alert=jest.spyOn(Alert,'alert').mockImplementation(()=>undefined);
  const openURL=jest.spyOn(Linking,'openURL').mockRejectedValue(new Error('No WhatsApp handler'));
  openURL.mockClear();
  await callPurchasedLeadBuyer('bad');
  expect(openURL).not.toHaveBeenCalled();
  await openPurchasedLeadWhatsApp('Buyer','9876543210');
  expect(alert).toHaveBeenCalled();
});
