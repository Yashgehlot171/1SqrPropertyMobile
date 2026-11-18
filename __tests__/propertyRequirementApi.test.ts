const mockApiRequest = jest.fn();
jest.mock('../src/api', () => ({apiRequest: (...args: unknown[]) => mockApiRequest(...args)}));

import {
  createPropertyRequirement,
  getPropertyRequirement,
  myPropertyRequirements,
  transitionPropertyRequirement,
  updatePropertyRequirement,
} from '../src/services/propertyRequirementApi';

beforeEach(() => mockApiRequest.mockReset().mockResolvedValue({}));

test('create and list call the expected Property Requirement API contracts', async () => {
  const input = {propertyTypeId: 7, preferences: {bhk: '2 BHK'}};
  await createPropertyRequirement(input);
  expect(mockApiRequest).toHaveBeenLastCalledWith({endpoint: '/property-requirements', method: 'POST', body: input});
  await myPropertyRequirements();
  expect(mockApiRequest).toHaveBeenLastCalledWith({endpoint: '/property-requirements/me'});
});

test('detail and update retain the requested requirement ID and latest payload', async () => {
  await getPropertyRequirement('req-17');
  expect(mockApiRequest).toHaveBeenLastCalledWith({endpoint: '/property-requirements/req-17'});
  const input = {additionalRequirement: ''};
  await updatePropertyRequirement('req-17', input);
  expect(mockApiRequest).toHaveBeenLastCalledWith({endpoint: '/property-requirements/req-17', method: 'PATCH', body: input});
});

test.each(['publish', 'pause', 'resume', 'close'] as const)('%s maps to the matching lifecycle endpoint', async action => {
  const body = action === 'publish' ? {consentAccepted: true} : {};
  await transitionPropertyRequirement('req-17', action, body);
  expect(mockApiRequest).toHaveBeenLastCalledWith({
    endpoint: `/property-requirements/req-17/${action}`, method: 'POST', body,
  });
});
