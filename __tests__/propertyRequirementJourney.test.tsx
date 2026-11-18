import React from 'react';
import {act, create, type ReactTestRenderer} from 'react-test-renderer';
import {Alert, Text} from 'react-native';
import {PropertyRequirementJourneyScreen} from '../src/screens/propertyRequirement/PropertyRequirementJourneyScreen';
import {usePropertyRequirementStore} from '../src/store/propertyRequirementStore';
import {
  createPropertyRequirement,
  getPropertyRequirement,
  transitionPropertyRequirement,
  updatePropertyRequirement,
} from '../src/services/propertyRequirementApi';
import {getAreasByCity, getCitiesByState, getStates} from '../src/services/locationApi';
import {getMasterData} from '../src/services/masterApi';

jest.mock('../src/services/propertyRequirementApi', () => ({
  createPropertyRequirement: jest.fn(),
  getPropertyRequirement: jest.fn(),
  transitionPropertyRequirement: jest.fn(),
  updatePropertyRequirement: jest.fn(),
}));
jest.mock('../src/services/locationApi', () => ({
  getAreasByCity: jest.fn(), getCitiesByState: jest.fn(), getStates: jest.fn(),
}));
jest.mock('../src/services/masterApi', () => ({getMasterData: jest.fn()}));
jest.mock('../src/screens/propertyRequirement/steps/RequirementBudgetTimelineStep', () => ({RequirementBudgetTimelineStep: () => null}));
jest.mock('../src/screens/propertyRequirement/steps/RequirementPaymentStep', () => ({RequirementPaymentStep: () => null}));
jest.mock('../src/screens/propertyRequirement/steps/RequirementPreferencesStep', () => ({RequirementPreferencesStep: () => null}));
jest.mock('../src/screens/propertyRequirement/steps/RequirementPropertyStep', () => ({RequirementPropertyStep: () => null}));

const apiCreate = jest.mocked(createPropertyRequirement);
const apiDetail = jest.mocked(getPropertyRequirement);
const apiTransition = jest.mocked(transitionPropertyRequirement);
const apiUpdate = jest.mocked(updatePropertyRequirement);
const apiStates = jest.mocked(getStates);
const apiCities = jest.mocked(getCitiesByState);
const apiAreas = jest.mocked(getAreasByCity);
const apiMaster = jest.mocked(getMasterData);
const navigationMock = {goBack: jest.fn(), navigate: jest.fn()};
const navigation = navigationMock as unknown as React.ComponentProps<typeof PropertyRequirementJourneyScreen>['navigation'];
let renderer: ReactTestRenderer;

const pressable = (label: string) => {
  const text = renderer.root.findAllByType(Text).find(item => String(item.props.children ?? '').includes(label));
  let parent = text?.parent;
  while (parent && typeof parent.props.onPress !== 'function') parent = parent.parent;
  return parent;
};
const tap = async (label: string) => {
  const item = pressable(label);
  if (!item?.props.onPress) throw new Error(`No pressable found for ${label}`);
  await act(async () => { item.props.onPress(); await Promise.resolve(); });
};
const flush = async () => { await Promise.resolve(); await Promise.resolve(); };
const route = (requirementId?: string) => ({key: 'test-route', name: 'PropertyRequirementJourney', params: requirementId ? {requirementId} : undefined}) as never;
const renderJourney = async (requirementId?: string) => {
  await act(async () => {
    renderer = create(<PropertyRequirementJourneyScreen navigation={navigation} route={route(requirementId)} />);
    await flush();
  });
};
const goToReview = async () => { for (let index = 0; index < 5; index += 1) await tap('Continue'); };
const acceptConsent = async () => {
  const item = pressable('eligible property professionals');
  if (!item) throw new Error('Consent control not found');
  await act(async () => item.props.onPress());
};
const deferred = <T,>() => {
  let resolve!: (value: T) => void;
  let reject!: (reason: Error) => void;
  const promise = new Promise<T>((res, rej) => { resolve = res; reject = rej; });
  return {promise, resolve, reject};
};

beforeEach(() => {
  usePropertyRequirementStore.getState().reset();
  jest.clearAllMocks();
  apiStates.mockResolvedValue({items: []} as never);
  apiMaster.mockResolvedValue({items: []} as never);
  apiCities.mockResolvedValue({items: []} as never);
  apiAreas.mockResolvedValue({items: []} as never);
  apiDetail.mockResolvedValue({} as never);
  apiCreate.mockResolvedValue({id: 'created-1', status: 'DRAFT'} as never);
  apiUpdate.mockResolvedValue({id: 'existing-7', status: 'DRAFT'} as never);
  apiTransition.mockResolvedValue({id: 'created-1', status: 'PUBLISHED'} as never);
  jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
});
afterEach(() => {
  if (renderer) act(() => renderer.unmount());
  jest.restoreAllMocks();
});

test('new journey resets stale data and starts without ID or accepted consent', async () => {
  usePropertyRequirementStore.getState().hydrate({
    id: 'old-id', status: 'DRAFT', localities: [], nearbyLocalityAllowed: false,
    consentAccepted: true,
  });
  await renderJourney();
  const current = usePropertyRequirementStore.getState().draft;
  for (const key of ['id', 'status', 'stateId', 'cityId', 'propertyTypeId', 'occupation', 'loanRequirement', 'loanStatus']) {
    expect(current[key as keyof typeof current]).toBeUndefined();
  }
  expect(current.preferences).toEqual({});
  expect(current.consentAccepted).toBe(false);
});

test('Location step adds and removes multiple master locality IDs in the outgoing selection', async () => {
  apiStates.mockResolvedValueOnce({items: [{id: 11, name: 'State A'}]} as never);
  apiCities.mockResolvedValueOnce({items: [{id: 21, name: 'City A'}]} as never);
  apiAreas.mockResolvedValueOnce({items: [
    {id: 31, name: 'Locality A'}, {id: 32, name: 'Locality B'},
  ]} as never);
  await renderJourney();
  await tap('State A');
  await act(async () => { await flush(); });
  await tap('City A');
  await act(async () => { await flush(); });
  await tap('Locality A');
  await tap('Locality B');
  expect(usePropertyRequirementStore.getState().draft.localityIds).toEqual([31, 32]);
  await tap('Locality A');
  expect(usePropertyRequirementStore.getState().payload().localityIds).toEqual([32]);
});

test('new first Save Draft creates once, then repeated saves update the returned ID', async () => {
  await renderJourney();
  await tap('Save Draft');
  expect(apiCreate).toHaveBeenCalledTimes(1);
  expect(usePropertyRequirementStore.getState().draft.id).toBe('created-1');
  await tap('Save Draft');
  expect(apiCreate).toHaveBeenCalledTimes(1);
  expect(apiUpdate).toHaveBeenCalledWith('created-1', expect.any(Object));
});

test('existing Draft Save uses UPDATE with the same requirement ID', async () => {
  await renderJourney();
  act(() => usePropertyRequirementStore.getState().set({id: 'existing-7'}));
  await tap('Save Draft');
  expect(apiCreate).not.toHaveBeenCalled();
  expect(apiUpdate).toHaveBeenCalledWith('existing-7', expect.any(Object));
});

test('consent is required for Publish while Save Draft remains available', async () => {
  await renderJourney();
  await goToReview();
  expect(pressable('Publish')?.props.disabled).toBe(true);
  await tap('Save Draft');
  expect(apiCreate).toHaveBeenCalledTimes(1);
  expect(apiTransition).not.toHaveBeenCalled();
});

test('Publish persists latest local values before calling Publish with the returned ID', async () => {
  await renderJourney();
  act(() => usePropertyRequirementStore.getState().set({propertyTypeId: 84, stateId: 11, cityId: 21, localityIds: [31, 32], budgetMin: '2', preferences: {bhk: '2 BHK'}}));
  await goToReview();
  await acceptConsent();
  await tap('Publish');
  expect(apiCreate).toHaveBeenCalledWith(expect.objectContaining({
    propertyTypeId: 84, stateId: 11, cityId: 21, localityIds: [31, 32],
    budgetMin: '2', preferences: {bhk: '2 BHK'}, consentAccepted: true,
  }));
  expect(apiTransition).toHaveBeenCalledWith('created-1', 'publish', {consentAccepted: true});
  expect(apiCreate.mock.invocationCallOrder[0]).toBeLessThan(apiTransition.mock.invocationCallOrder[0]);
});

test('Publish failure preserves local draft, ID and status without success navigation or reset', async () => {
  apiTransition.mockRejectedValueOnce(new Error('Publish validation failed'));
  await renderJourney();
  act(() => usePropertyRequirementStore.getState().set({budgetMin: '123', additionalRequirement: 'Keep this'}));
  await goToReview();
  await acceptConsent();
  await tap('Publish');
  expect(usePropertyRequirementStore.getState().draft).toMatchObject({
    id: 'created-1', status: 'DRAFT', budgetMin: '123', additionalRequirement: 'Keep this', consentAccepted: true,
  });
  expect(navigationMock.goBack).not.toHaveBeenCalled();
  expect(Alert.alert).toHaveBeenCalledWith('Unable to publish', 'Publish validation failed');
  expect(Alert.alert).not.toHaveBeenCalledWith('Published', expect.anything());
});

test('Publish success uses authoritative status, resets active journey and navigates back', async () => {
  apiTransition.mockResolvedValueOnce({id: 'authoritative-published-id', status: 'PUBLISHED'} as never);
  const setSpy = jest.spyOn(usePropertyRequirementStore.getState(), 'set');
  await renderJourney();
  act(() => usePropertyRequirementStore.getState().set({additionalRequirement: 'Latest text'}));
  await goToReview();
  await acceptConsent();
  await tap('Publish');
  expect(apiTransition).toHaveBeenCalledTimes(1);
  expect(setSpy).toHaveBeenCalledWith({id: 'authoritative-published-id', status: 'PUBLISHED'});
  expect(usePropertyRequirementStore.getState().draft.id).toBeUndefined();
  expect(usePropertyRequirementStore.getState().draft.consentAccepted).toBe(false);
  expect(navigationMock.goBack).toHaveBeenCalledTimes(1);
  expect(Alert.alert).toHaveBeenCalledWith('Published', 'Your property requirement has been published.');
});

test('repeated Publish presses while CREATE is pending cannot duplicate create or transition calls', async () => {
  const createRequest = deferred<{id: string; status: 'DRAFT'}>();
  const publishRequest = deferred<{id: string; status: 'PUBLISHED'}>();
  apiCreate.mockReturnValueOnce(createRequest.promise as never);
  apiTransition.mockReturnValueOnce(publishRequest.promise as never);
  await renderJourney();
  await goToReview();
  await acceptConsent();
  const button = pressable('Publish');
  if (!button?.props.onPress) throw new Error('Publish button not found');
  await act(async () => {
    button.props.onPress();
    button.props.onPress();
    await flush();
  });
  expect(apiCreate).toHaveBeenCalledTimes(1);
  expect(apiTransition).not.toHaveBeenCalled();
  await act(async () => { createRequest.resolve({id: 'created-1', status: 'DRAFT'}); await flush(); });
  expect(apiTransition).toHaveBeenCalledTimes(1);
  await act(async () => { publishRequest.resolve({id: 'created-1', status: 'PUBLISHED'}); await flush(); });
});

test('hydrated requirement is loaded by the route requirementId without resetting it as a new journey', async () => {
  apiDetail.mockResolvedValueOnce({
    id: 'route-id', status: 'DRAFT', state: {id: 1, name: 'State'}, city: {id: 2, name: 'City'},
    localities: [{id: 3, name: 'A'}, {id: 4, name: 'B'}], nearbyLocalityAllowed: true,
    propertyType: {id: 9, name: 'Flat', slug: 'flat'}, preferences: {bhk: '2 BHK'},
    consentAccepted: true,
  } as never);
  await renderJourney('route-id');
  expect(apiDetail).toHaveBeenCalledWith('route-id');
  expect(usePropertyRequirementStore.getState().draft).toMatchObject({
    id: 'route-id', stateId: 1, cityId: 2, localityIds: [3, 4], nearbyLocalityAllowed: true,
    propertyTypeId: 9, preferences: {bhk: '2 BHK'}, consentAccepted: true,
  });
});
