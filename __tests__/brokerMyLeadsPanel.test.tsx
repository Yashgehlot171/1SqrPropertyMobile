import React from 'react';
import {act,create,type ReactTestRenderer} from 'react-test-renderer';
import {RefreshControl,Text} from 'react-native';
import {BrokerMyLeadsPanel} from '../src/screens/leads/BrokerMyLeadsPanel';
import {getBrokerLeadCrmLeads} from '../src/services/brokerLeadCrmApi';

jest.mock('react-native-vector-icons/Ionicons',()=> 'Ionicons');
jest.mock('../src/services/brokerLeadCrmApi',()=>({getBrokerLeadCrmLeads:jest.fn()}));
jest.mock('../src/services/masterApi',()=>({getMasterData:jest.fn(async()=>({items:[]}))}));
jest.mock('../src/services/locationApi',()=>({getAreasByCity:jest.fn(async()=>({items:[]}))}));

const api=jest.mocked(getBrokerLeadCrmLeads);let renderer:ReactTestRenderer;const navigation={navigate:jest.fn()};
const lead={id:'crm-1',requirementId:'req-7',purchaseId:'purchase-7',propertyType:'Apartment',city:'Pune',localities:['Vijay Nagar'],budget:{min:'5000000',max:'7000000'},area:{min:'900',max:'1200',unit:'SQFT'},status:'CONTACTED' as const,nextFollowUpAt:'2020-01-01T10:00:00Z',lastContactedAt:null,purchasedAt:'2026-11-01T00:00:00Z',updatedAt:'2026-11-10T00:00:00Z'};
const content=(value:unknown):string=>typeof value==='string'||typeof value==='number'?String(value):Array.isArray(value)?value.map(content).join(' '):value&&typeof value==='object'?'props' in value?content((value as {props:{children?:unknown}}).props.children):'':'';
const text=()=>renderer.root.findAllByType(Text).map(item=>content(item.props.children)).join(' ');
const render=async()=>{api.mockResolvedValue({items:[lead],pagination:{page:1,limit:20,total:1,totalPages:1}});await act(async()=>{renderer=create(<BrokerMyLeadsPanel navigation={navigation as never}/>);await new Promise<void>(resolve=>setTimeout(()=>resolve(),0));});};
afterEach(()=>{if(renderer)act(()=>renderer.unmount());jest.clearAllMocks();});

test('My Leads shows readable CRM stage, buyer, purchased context and overdue follow-up',async()=>{
  await render();
  expect(text()).toContain('Contacted');expect(text()).toContain('Buyer');expect(text()).toContain('Overdue');expect(text()).toContain('Vijay Nagar');
  expect(text()).not.toContain('9876543210');
});

test('My Leads navigation sends CRM and requirement IDs only',async()=>{
  await render();
  const card=renderer.root.findByProps({testID:'broker-crm-lead-crm-1'});
  await act(async()=>{card.props.onPress();});
  expect(navigation.navigate).toHaveBeenCalledWith('BrokerLeadCrmDetail',{leadId:'crm-1',requirementId:'req-7'});
});

test('My Leads list sends bounded server query and API error remains visible',async()=>{
  await render();
  expect(api).toHaveBeenCalledWith({page:1,limit:20});
  api.mockRejectedValueOnce(new Error('CRM unavailable'));
  await act(async()=>{renderer.root.findByType(RefreshControl).props.onRefresh();await Promise.resolve();await Promise.resolve();});
  expect(text()).toContain('Buyer');
  expect(text()).toContain('CRM unavailable');
});
