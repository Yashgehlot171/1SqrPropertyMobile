const mockApiRequest = jest.fn();
jest.mock('../src/api', () => ({apiRequest: (...args: unknown[]) => mockApiRequest(...args)}));

import {createBrokerLeadPurchaseIntent, getBrokerBuyerLead, getBrokerBuyerLeads, getPurchasedBuyerContact} from '../src/services/propertyLeadDiscoveryApi';

beforeEach(() => mockApiRequest.mockReset().mockResolvedValue({items: [], pagination: {page: 1, limit: 20, total: 0, totalPages: 0}}));

test('feed sends only supported server-side filters and pagination', async () => {
  const filters = {cityId: 12, localityId: 31, propertyTypeId: 8, budgetMin: '1000000', budgetMax: '5000000', bhk: '2 BHK', purchaseTimeline: 'WITHIN_3_MONTHS', paymentPreference: 'HOME_LOAN', page: 2, limit: 20};
  await getBrokerBuyerLeads(filters);
  expect(mockApiRequest).toHaveBeenCalledWith({endpoint: '/me/property-leads?cityId=12&localityId=31&propertyTypeId=8&budgetMin=1000000&budgetMax=5000000&bhk=2+BHK&purchaseTimeline=WITHIN_3_MONTHS&paymentPreference=HOME_LOAN&page=2&limit=20', method: 'GET'});
});

test('detail safely encodes requirement ID and uses Broker-scoped route', async () => {
  await getBrokerBuyerLead('req 8');
  expect(mockApiRequest).toHaveBeenCalledWith({endpoint: '/me/property-leads/req%208', method: 'GET'});
});

test('purchase intent sends only requirement ID in route and idempotency key, never price or success state', async () => {
  await createBrokerLeadPurchaseIntent('req-77', 'retry-token-77');
  expect(mockApiRequest).toHaveBeenCalledWith({
    endpoint: '/me/property-leads/req-77/purchase', method: 'POST', body: {idempotencyKey: 'retry-token-77'},
  });
  const request = mockApiRequest.mock.calls[0][0] as {body?: Record<string, unknown>};
  expect(request.body).not.toHaveProperty('price');
  expect(request.body).not.toHaveProperty('paymentSuccessful');
});

test('purchased contact uses a separate authenticated requirement-scoped GET endpoint', async () => {
  await getPurchasedBuyerContact('req/77');
  expect(mockApiRequest).toHaveBeenCalledWith({endpoint:'/me/property-leads/req%2F77/contact',method:'GET'});
});
