import {acceptConstructionHandover, getBuilderHandover, getCustomerHandover, reportConstructionHandoverIssue, requestConstructionCompletion, resolveConstructionHandoverIssue} from '../src/services/constructionHandoverApi';
import {apiRequest} from '../src/api';

jest.mock('../src/api', () => ({apiRequest: jest.fn()}));
const request = jest.mocked(apiRequest);
beforeEach(() => request.mockReset().mockResolvedValue({} as never));

test('Customer read and accept use Customer project routes and explicit confirmation', async () => {
  await getCustomerHandover('p/1'); await acceptConstructionHandover('p/1');
  expect(request).toHaveBeenNthCalledWith(1, {endpoint: '/construction/projects/p%2F1/handover'});
  expect(request).toHaveBeenNthCalledWith(2, {endpoint: '/construction/projects/p%2F1/handover/accept', method: 'POST', body: {confirmed: true}});
});
test('Builder read and completion request use the selected Builder routes', async () => {
  await getBuilderHandover('7'); await requestConstructionCompletion('7', 'Scope complete');
  expect(request).toHaveBeenNthCalledWith(1, {endpoint: '/me/construction/projects/7/handover'});
  expect(request).toHaveBeenNthCalledWith(2, {endpoint: '/me/construction/projects/7/handover/request', method: 'POST', body: {completionNote: 'Scope complete'}});
});
test('Customer issue report and Builder resolution use separate routes', async () => {
  await reportConstructionHandoverIssue('7', 'Paint', 'Touch-up pending'); await resolveConstructionHandoverIssue('7', 'i/3', 'Touch-up complete');
  expect(request).toHaveBeenNthCalledWith(1, {endpoint: '/construction/projects/7/handover/issues', method: 'POST', body: {title: 'Paint', description: 'Touch-up pending'}});
  expect(request).toHaveBeenNthCalledWith(2, {endpoint: '/me/construction/projects/7/handover/issues/i%2F3/resolve', method: 'POST', body: {resolutionNote: 'Touch-up complete'}});
});
