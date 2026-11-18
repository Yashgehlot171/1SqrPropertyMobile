import React from 'react';
import {act, create, type ReactTestRenderer} from 'react-test-renderer';
import {Alert, Pressable, Text} from 'react-native';
import {BrokerBuyerLeadDetailScreen} from '../src/screens/leads/BrokerBuyerLeadDetailScreen';
import {createBrokerLeadPurchaseIntent, getBrokerBuyerLead, getPurchasedBuyerContact, type BrokerBuyerLead} from '../src/services/propertyLeadDiscoveryApi';

jest.mock('@react-navigation/native', () => {
  const ReactModule = jest.requireActual('react');
  return {useFocusEffect: (callback: () => void) => ReactModule.useEffect(callback, [callback])};
});
jest.mock('react-native-vector-icons/Ionicons', () => 'Ionicons');
jest.mock('../src/services/propertyLeadDiscoveryApi', () => ({
  getBrokerBuyerLead: jest.fn(),
  getPurchasedBuyerContact: jest.fn(),
  createBrokerLeadPurchaseIntent: jest.fn(),
}));

const apiDetail = jest.mocked(getBrokerBuyerLead);
const apiContact = jest.mocked(getPurchasedBuyerContact);
const apiIntent = jest.mocked(createBrokerLeadPurchaseIntent);
const navigation = {goBack: jest.fn()};
let renderer: ReactTestRenderer;
let activeRouteParams: {requirementId: string};
const lead = (purchase: Partial<NonNullable<BrokerBuyerLead['purchase']>>): BrokerBuyerLead => ({
  requirementId:'req-1',buyerDisplayName:'Buyer',propertyType:{id:3,name:'Apartment'},city:{id:7,name:'Pune'},localities:[{id:8,name:'Kothrud'}],
  nearbyLocalityAccepted:false,preferences:{bhk:'2 BHK'},area:{min:'800',max:'1000',unit:'SQFT'},budget:{min:'3000000',max:'5000000'},
  purchaseTimeline:'WITHIN_3_MONTHS',targetPurchaseDate:null,paymentPreference:'HOME_LOAN',loanIntent:{occupation:'SALARIED',amount:'1000000',status:'PRE_APPROVED'},
  additionalRequirement:null,publishedAt:'2026-11-01T00:00:00.000Z',purchase:{purchaseStatus:null,isPurchased:false,isAvailable:true,buyerLeadPrice:'199.00',currency:'INR',remainingSlots:2,...purchase},
});
const allText = () => renderer.root.findAllByType(Text).map(item => JSON.stringify(item.props.children)).join(' ');
const pressableFor = (label: string) => {
  const textNode = renderer.root.findAllByType(Text).find(item => JSON.stringify(item.props.children).includes(label));
  let parent = textNode?.parent;
  while (parent && typeof parent.props.onPress !== 'function') parent = parent.parent;
  return parent;
};
const render = async (item: BrokerBuyerLead) => {
  apiDetail.mockResolvedValue(item);
  activeRouteParams={requirementId:item.requirementId};
  await act(async () => {renderer=create(<BrokerBuyerLeadDetailScreen navigation={navigation as never} route={{key:'test',name:'BrokerBuyerLeadDetail',params:activeRouteParams} as never}/>);await Promise.resolve();await Promise.resolve();});
};
const confirmAlert = async () => {
  const spy = jest.spyOn(Alert,'alert').mockImplementation((_title,_message,buttons) => {
    const confirm = buttons?.find(button => button.text === 'Continue');
    confirm?.onPress?.();
  });
  return spy;
};

beforeEach(() => {jest.clearAllMocks();apiContact.mockResolvedValue({buyerName:'Buyer Name',mobile:'9876543210',canCall:true,canWhatsApp:true});apiIntent.mockResolvedValue({id:'purchase-1',requirementId:'req-1',status:'PENDING',price:'199.00',currency:'INR',createdAt:'',purchasedAt:null,paymentMode:'GATEWAY_PENDING',contactUnlocked:false});});
afterEach(() => {if(renderer)act(()=>renderer.unmount());jest.restoreAllMocks();});

test('available lead displays backend price and creates a price-free pending intent', async () => {
  await render(lead({}));
  expect(allText()).toContain('₹199');
  expect(allText()).toContain('purchase slot');
  expect(allText()).toContain('2');
  await confirmAlert();
  const button = pressableFor('Start Purchase Intent')!;
  await act(async () => {button.props.onPress();await Promise.resolve();});
  expect(apiIntent).toHaveBeenCalledWith('req-1', expect.stringMatching(/^lead-/));
  expect(allText()).toContain('Start Purchase Intent');
  expect(allText()).not.toMatch(/phone|whatsapp|call now/i);
});

test('pending state does not show a second purchase action', async () => {
  await render(lead({purchaseStatus:'PENDING',isAvailable:false,buyerLeadPrice:null}));
  expect(allText()).toContain('Payment Pending');
  expect(renderer.root.findAllByType(Pressable).some(item => JSON.stringify(item.props.children).includes('Purchase Intent'))).toBe(false);
});

test('sold-out state disables purchases', async () => {
  await render(lead({isAvailable:false,buyerLeadPrice:null,remainingSlots:0}));
  expect(allText()).toContain('Sold Out');
  expect(allText()).not.toContain('Start Purchase Intent');
});

test('purchased state explicitly fetches and displays only the entitlement contact', async () => {
  await render(lead({purchaseStatus:'SUCCESS',isPurchased:true,isAvailable:false,remainingSlots:0}));
  const visible = allText();
  expect(visible).toContain('Lead Purchased');
  expect(apiContact).toHaveBeenCalledWith('req-1');
  expect(visible).toContain('Buyer Name');
  expect(visible).toContain('9876543210');
  expect(visible).toContain('Call');
  expect(visible).toContain('WhatsApp');
  expect(renderer.root.findAllByType(Pressable).some(item => JSON.stringify(item.props.children).includes('Purchase Intent'))).toBe(false);
});

test('non-purchaser sold-out lead never requests contact', async () => {
  await render(lead({purchaseStatus:null,isPurchased:false,isAvailable:false,remainingSlots:0}));
  expect(apiContact).not.toHaveBeenCalled();
  expect(allText()).not.toContain('9876543210');
});

test('contact endpoint failure does not show a number or stale contact', async () => {
  apiContact.mockRejectedValueOnce(new Error('Purchased contact is unavailable.'));
  await render(lead({purchaseStatus:'SUCCESS',isPurchased:true,isAvailable:false,remainingSlots:0}));
  expect(allText()).toContain('Purchased contact is unavailable.');
  expect(allText()).not.toContain('9876543210');
  expect(allText()).not.toContain('Buyer Name');
  expect(renderer.root.findAllByType(Pressable).some(item => JSON.stringify(item.props.children).includes('Call'))).toBe(false);
});

test('available and pending lead states remain contact-free', async () => {
  await render(lead({purchaseStatus:'PENDING',isPurchased:false,isAvailable:false,buyerLeadPrice:null}));
  expect(apiContact).not.toHaveBeenCalled();
  expect(allText()).not.toContain('9876543210');
  expect(allText()).not.toContain('Buyer Name');
});

test('route params carry only requirement ID, never fetched contact', async () => {
  await render(lead({purchaseStatus:'SUCCESS',isPurchased:true,isAvailable:false,remainingSlots:0}));
  expect(apiContact).toHaveBeenCalledTimes(1);
  expect(activeRouteParams).toEqual({requirementId:'req-1'});
  expect(navigation.goBack).not.toHaveBeenCalled();
  expect(allText()).not.toContain('contactSnapshot');
});

test('purchased call and WhatsApp actions use the server contact number', async () => {
  const {Linking} = require('react-native');
  const openURL = jest.spyOn(Linking,'openURL').mockResolvedValue(undefined);
  await render(lead({purchaseStatus:'SUCCESS',isPurchased:true,isAvailable:false,remainingSlots:0}));
  const call = pressableFor('Call')!;
  await act(async()=>{call.props.onPress();await Promise.resolve();});
  expect(openURL).toHaveBeenCalledWith('tel:9876543210');
  const whatsapp = pressableFor('WhatsApp')!;
  await act(async()=>{whatsapp.props.onPress();await Promise.resolve();});
  expect(openURL).toHaveBeenLastCalledWith(expect.stringMatching(/^https:\/\/wa\.me\/919876543210\?text=/));
});

test('purchase API error leaves the lead available and visible', async () => {
  apiIntent.mockRejectedValueOnce(new Error('Payment service unavailable.'));
  await render(lead({}));
  await confirmAlert();
  const button = pressableFor('Start Purchase Intent')!;
  await act(async () => {button.props.onPress();await Promise.resolve();await Promise.resolve();});
  expect(allText()).toContain('Payment service unavailable.');
  expect(allText()).toContain('Start Purchase Intent');
  expect(allText()).toContain('₹199');
});

test('duplicate taps while an intent is in flight create only one request', async () => {
  let resolveIntent!: (value: never) => void;
  apiIntent.mockReturnValueOnce(new Promise(resolve => {resolveIntent=resolve;}) as never);
  await render(lead({}));
  await confirmAlert();
  const button=pressableFor('Start Purchase Intent')!;
  await act(async()=>{button.props.onPress();await Promise.resolve();});
  const disabledButton=pressableFor('Creating intent')!;
  expect(disabledButton.props.disabled).toBe(true);
  await act(async()=>{disabledButton.props.onPress();await Promise.resolve();});
  expect(apiIntent).toHaveBeenCalledTimes(1);
  await act(async()=>{resolveIntent({} as never);await Promise.resolve();await Promise.resolve();});
});
