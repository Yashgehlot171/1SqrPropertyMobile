import React from 'react';
import {act,create,type ReactTestRenderer} from 'react-test-renderer';
import {Text,TextInput} from 'react-native';
import {BrokerLeadCrmDetailScreen} from '../src/screens/leads/BrokerLeadCrmDetailScreen';
import {addBrokerLeadCrmNote,getBrokerLeadCrmDetail,setBrokerLeadCrmFollowUp,updateBrokerLeadCrmStatus,type BrokerLeadCrmDetail} from '../src/services/brokerLeadCrmApi';
import {getPurchasedBuyerContact} from '../src/services/propertyLeadDiscoveryApi';

jest.mock('@react-navigation/native',()=>{const R=jest.requireActual('react');return {useFocusEffect:(callback:()=>void)=>R.useEffect(callback,[callback])};});
jest.mock('react-native-vector-icons/Ionicons',()=> 'Ionicons');
jest.mock('../src/services/brokerLeadCrmApi',()=>({addBrokerLeadCrmNote:jest.fn(),getBrokerLeadCrmDetail:jest.fn(),setBrokerLeadCrmFollowUp:jest.fn(),updateBrokerLeadCrmStatus:jest.fn()}));
jest.mock('../src/services/propertyLeadDiscoveryApi',()=>({getPurchasedBuyerContact:jest.fn()}));
jest.mock('../src/utils/purchasedLeadContactActions',()=>({callPurchasedLeadBuyer:jest.fn(async()=>{}),openPurchasedLeadWhatsApp:jest.fn(async()=>{})}));
jest.mock('../src/screens/constructionRequirement/SchedulePickerFields',()=>{
  const ReactModule=require('react');const RN=require('react-native');
  return {SchedulePickerFields:({onDateChange,onTimeChange,dateLabel,timeLabel}:{onDateChange:(value:string)=>void;onTimeChange:(value:string)=>void;dateLabel:string;timeLabel:string})=>ReactModule.createElement(RN.View,null,
    ReactModule.createElement(RN.Pressable,{testID:'choose-follow-date',onPress:()=>onDateChange('2099-01-02')},ReactModule.createElement(RN.Text,null,dateLabel)),
    ReactModule.createElement(RN.Pressable,{testID:'choose-follow-time',onPress:()=>onTimeChange('10:30')},ReactModule.createElement(RN.Text,null,timeLabel)),
  )};
});

const detailApi=jest.mocked(getBrokerLeadCrmDetail);const contactApi=jest.mocked(getPurchasedBuyerContact);const statusApi=jest.mocked(updateBrokerLeadCrmStatus);const noteApi=jest.mocked(addBrokerLeadCrmNote);const followApi=jest.mocked(setBrokerLeadCrmFollowUp);
let renderer:ReactTestRenderer;
const lead=(input:Partial<BrokerLeadCrmDetail>={}):BrokerLeadCrmDetail=>({id:'crm-1',requirementId:'req-1',purchaseId:'purchase-1',propertyType:'Apartment',city:'Pune',localities:['Kothrud'],budget:{min:'3000000',max:'5000000'},area:{min:'800',max:'1000',unit:'SQFT'},status:'PURCHASED',nextFollowUpAt:null,lastContactedAt:null,purchasedAt:'2026-11-01T00:00:00.000Z',updatedAt:'2026-11-01T00:00:00.000Z',contactEntitlementAvailable:true,allowedNextStatuses:['CONTACTED','NOT_INTERESTED'],notes:[],activities:[{id:'a1',type:'INITIALIZED',previousValue:null,newValue:'PURCHASED',createdAt:'2026-11-01T00:00:00.000Z'}],historyTruncated:false,...input});
const text=()=>renderer.root.findAllByType(Text).map(item=>JSON.stringify(item.props.children)).join(' ');
const action=(label:string)=>renderer.root.findByProps({testID:`broker-crm-action-${label.toLowerCase().replace(/[^a-z0-9]+/g,'-')}`});
const render=async(item=lead())=>{detailApi.mockResolvedValue(item);await act(async()=>{renderer=create(<BrokerLeadCrmDetailScreen navigation={{goBack:jest.fn()} as never} route={{key:'test',name:'BrokerLeadCrmDetail',params:{leadId:'crm-1',requirementId:'req-1'}} as never}/>);await Promise.resolve();await Promise.resolve();});};
beforeEach(()=>{jest.clearAllMocks();detailApi.mockResolvedValue(lead());contactApi.mockResolvedValue({buyerName:'Buyer Name',mobile:'9876543210',canCall:true,canWhatsApp:true});statusApi.mockResolvedValue(lead({status:'CONTACTED',allowedNextStatuses:['INTERESTED','NOT_INTERESTED']}));noteApi.mockResolvedValue(lead({notes:[{id:'n1',note:'Call Saturday',createdAt:'2026-11-01T10:00:00Z'}]}));followApi.mockResolvedValue(lead());});
afterEach(()=>{if(renderer)act(()=>renderer.unmount());});

test('CRM detail fetches contact only via Phase 2C and shows readable Buyer/contact/history',async()=>{
  await render();
  expect(contactApi).toHaveBeenCalledWith('req-1');expect(text()).toContain('Buyer Name');expect(text()).toContain('9876543210');expect(text()).toContain('Purchased');
  expect(text()).not.toContain('INITIALIZED');
});

test('status action submits only an allowed next status and refreshes readable stage',async()=>{
  await render();
  const button=action('Contacted')!;
  await act(async()=>{button.props.onPress();await Promise.resolve();});
  expect(statusApi).toHaveBeenCalledWith('crm-1','CONTACTED');expect(text()).toContain('Contacted');
});

test('private note can be added and activity remains visible',async()=>{
  await render();
  const input=renderer.root.findAllByType(TextInput).find(item=>item.props.accessibilityLabel==='Private Broker note')!;
  await act(async()=>{input.props.onChangeText('Call Saturday');});
  const button=action('Add Note')!;
  await act(async()=>{button.props.onPress();await Promise.resolve();});
  expect(noteApi).toHaveBeenCalledWith('crm-1','Call Saturday');expect(text()).toContain('Call Saturday');
});

test('date/time picker values are combined locally then serialized as an ISO instant',async()=>{
  await render();
  await act(async()=>{renderer.root.findByProps({testID:'choose-follow-date'}).props.onPress();renderer.root.findByProps({testID:'choose-follow-time'}).props.onPress();});
  const button=action('Schedule')!;
  await act(async()=>{button.props.onPress();await Promise.resolve();});
  expect(followApi).toHaveBeenCalledWith('crm-1',new Date(2099,0,2,10,30).toISOString());
});

test('overdue follow-up is derived in UI and API failure retains current lead state',async()=>{
  await render(lead({status:'CONTACTED',nextFollowUpAt:'2020-01-01T10:00:00.000Z',allowedNextStatuses:['INTERESTED','NOT_INTERESTED']}));
  expect(text()).toContain('Overdue');
  statusApi.mockRejectedValueOnce(new Error('Status service unavailable'));
  const button=action('Interested')!;
  await act(async()=>{button.props.onPress();await Promise.resolve();});
  expect(text()).toContain('Status service unavailable');expect(text()).toContain('Contacted');
});

test('terminal CRM state offers no status, note, or follow-up mutation actions',async()=>{
  await render(lead({status:'DEAL_CLOSED',allowedNextStatuses:[]}));
  expect(text()).toContain('Deal Closed');expect(text()).toContain('This lead is closed.');
  expect(text()).not.toContain('Add Note');expect(text()).not.toContain('Schedule');
});
