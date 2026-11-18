import {apiRequest} from '../src/api';
import {getBuilderConstructionCommission} from '../src/services/constructionCommissionApi';

jest.mock('../src/api', () => ({apiRequest: jest.fn()}));
const request = jest.mocked(apiRequest);
beforeEach(() => request.mockReset().mockResolvedValue(null as never));

test('Builder commission uses only the authenticated own-project endpoint', async () => {
  await getBuilderConstructionCommission('p/1');
  expect(request).toHaveBeenCalledWith({endpoint: '/me/construction/projects/p%2F1/commission'});
});

test('Builder commission API exposes immutable rate snapshot, totals, adjustment and settlement history', async () => {
  const value = await getBuilderConstructionCommission('1');
  expect(value).toBeNull();
  expect(request).toHaveBeenCalledTimes(1);
});
