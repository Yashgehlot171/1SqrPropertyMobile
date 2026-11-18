const mockApiRequest=jest.fn();
jest.mock('../src/api',()=>({apiRequest:(...args:unknown[])=>mockApiRequest(...args)}));

import {addBrokerLeadCrmNote,getBrokerLeadCrmDetail,getBrokerLeadCrmLeads,setBrokerLeadCrmFollowUp,updateBrokerLeadCrmStatus} from '../src/services/brokerLeadCrmApi';

beforeEach(()=>mockApiRequest.mockReset().mockResolvedValue({items:[],pagination:{page:1,limit:20,total:0,totalPages:0}}));

test('My Leads list uses server pagination and status/location/follow-up filters',async()=>{
  await getBrokerLeadCrmLeads({page:2,limit:20,status:'SITE_VISIT',propertyTypeId:91,cityId:12,localityId:31,followUp:'DUE'});
  expect(mockApiRequest).toHaveBeenCalledWith({endpoint:'/me/property-leads/crm?page=2&limit=20&status=SITE_VISIT&propertyTypeId=91&cityId=12&localityId=31&followUp=DUE',method:'GET'});
});

test('detail and updates are Broker CRM scoped and never submit owner IDs',async()=>{
  await getBrokerLeadCrmDetail('lead/7');
  expect(mockApiRequest).toHaveBeenLastCalledWith({endpoint:'/me/property-leads/crm/lead%2F7',method:'GET'});
  await updateBrokerLeadCrmStatus('7','CONTACTED');
  expect(mockApiRequest).toHaveBeenLastCalledWith({endpoint:'/me/property-leads/crm/7/status',method:'PATCH',body:{status:'CONTACTED'}});
  await addBrokerLeadCrmNote('7','Call on Saturday');
  expect(mockApiRequest).toHaveBeenLastCalledWith({endpoint:'/me/property-leads/crm/7/notes',method:'POST',body:{note:'Call on Saturday'}});
  await setBrokerLeadCrmFollowUp('7','2026-11-20T06:00:00.000Z');
  expect(mockApiRequest).toHaveBeenLastCalledWith({endpoint:'/me/property-leads/crm/7/follow-up',method:'PUT',body:{nextFollowUpAt:'2026-11-20T06:00:00.000Z'}});
  await setBrokerLeadCrmFollowUp('7',null);
  expect(mockApiRequest).toHaveBeenLastCalledWith({endpoint:'/me/property-leads/crm/7/follow-up',method:'PUT',body:{nextFollowUpAt:null}});
  for(const call of mockApiRequest.mock.calls){expect(call[0]).not.toHaveProperty('body.brokerUserId');}
});
