import React from 'react';
import {act, create, type ReactTestInstance, type ReactTestRenderer} from 'react-test-renderer';
import {Alert, Text} from 'react-native';
import {MyPropertyRequirementsScreen} from '../src/screens/propertyRequirement/MyPropertyRequirementsScreen';
import {PropertyRequirementDetailScreen} from '../src/screens/propertyRequirement/PropertyRequirementDetailScreen';
import {myPropertyRequirements, getPropertyRequirement, transitionPropertyRequirement, type PropertyRequirement} from '../src/services/propertyRequirementApi';
import {ROUTES} from '../src/constants/routes';

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (callback: () => void) => require('react').useEffect(callback, [callback]),
}));
jest.mock('../src/services/propertyRequirementApi', () => ({
  myPropertyRequirements: jest.fn(), getPropertyRequirement: jest.fn(), transitionPropertyRequirement: jest.fn(),
}));

const listApi = jest.mocked(myPropertyRequirements);
const detailApi = jest.mocked(getPropertyRequirement);
const transitionApi = jest.mocked(transitionPropertyRequirement);
const navigationMock = {navigate: jest.fn(), goBack: jest.fn()};
const navigation = navigationMock as unknown as React.ComponentProps<typeof PropertyRequirementDetailScreen>['navigation'];
let renderer: ReactTestRenderer;

const makeRequirement = (id: string, status: PropertyRequirement['status']): PropertyRequirement => ({
  id, status, propertyType: {id: 6, name: 'Flat', slug: 'flat'}, state: {id: 1, name: 'State'},
  city: {id: 2, name: 'City'}, localities: [], nearbyLocalityAllowed: false,
  budgetMin: null, budgetMax: null, areaMin: null, areaMax: null, areaUnit: null,
  purchaseTimeline: null, paymentPreference: null, occupation: null, loanRequirement: null,
  loanStatus: null, preferences: {}, additionalRequirement: null, consentAccepted: false,
});
const buttons = (label: string) => renderer.root.findAllByType(Text)
  .filter(item => String(item.props.children ?? '').includes(label))
  .map(item => {
    let parent = item.parent;
    while (parent && typeof parent.props.onPress !== 'function') parent = parent.parent;
    return parent;
  }).filter((item): item is ReactTestInstance => item !== null);
const renderList = async () => act(async () => {
  renderer = create(<MyPropertyRequirementsScreen
    navigation={navigation as unknown as React.ComponentProps<typeof MyPropertyRequirementsScreen>['navigation']}
    route={{key: 'list', name: 'MyPropertyRequirements'} as never}
  />);
  await Promise.resolve(); await Promise.resolve();
});
const renderDetail = async (item: PropertyRequirement) => {
  detailApi.mockResolvedValue(item);
  await act(async () => {
    renderer = create(<PropertyRequirementDetailScreen
      navigation={navigation}
      route={{key: 'detail', name: 'PropertyRequirementDetail', params: {requirementId: item.id}} as never}
    />);
    await Promise.resolve(); await Promise.resolve();
  });
};

beforeEach(() => {
  jest.clearAllMocks();
  listApi.mockResolvedValue([
    makeRequirement('draft-1', 'DRAFT'), makeRequirement('published-2', 'PUBLISHED'),
    makeRequirement('paused-3', 'PAUSED'), makeRequirement('closed-4', 'CLOSED'),
  ]);
  transitionApi.mockResolvedValue({} as never);
  jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
});
afterEach(() => { if (renderer) act(() => renderer.unmount()); jest.restoreAllMocks(); });

test('list action matrix is Draft Continue/View, Published and Paused View/Edit, Closed View only', async () => {
  await renderList();
  const allText = renderer.root.findAllByType(Text).map(item => String(item.props.children ?? ''));
  expect(allText.filter(value => value === 'Continue')).toHaveLength(1);
  expect(allText.filter(value => value === 'Edit')).toHaveLength(2);
  expect(allText.filter(value => value === 'View')).toHaveLength(4);

  const continueButton = buttons('Continue')[0];
  act(() => continueButton?.props.onPress());
  expect(navigationMock.navigate).toHaveBeenCalledWith(ROUTES.home.propertyRequirementJourney, {requirementId: 'draft-1'});
  const editButtons = buttons('Edit');
  act(() => editButtons[0]?.props.onPress());
  expect(navigationMock.navigate).toHaveBeenLastCalledWith(ROUTES.home.propertyRequirementJourney, {requirementId: 'published-2'});
  act(() => editButtons[1]?.props.onPress());
  expect(navigationMock.navigate).toHaveBeenLastCalledWith(ROUTES.home.propertyRequirementJourney, {requirementId: 'paused-3'});
  const viewButtons = buttons('View');
  act(() => viewButtons[3]?.props.onPress());
  expect(navigationMock.navigate).toHaveBeenLastCalledWith(ROUTES.home.propertyRequirementDetail, {requirementId: 'closed-4'});
});

test('Closed detail is view-only with no Edit, Continue or Resume actions', async () => {
  await renderDetail(makeRequirement('closed-9', 'CLOSED'));
  const allText = renderer.root.findAllByType(Text).map(item => String(item.props.children ?? ''));
  expect(allText).toContain('CLOSED');
  expect(allText).not.toContain('Edit');
  expect(allText).not.toContain('Continue Editing');
  expect(allText).not.toContain('Resume Requirement');
  expect(buttons('Close Requirement')).toHaveLength(0);
});

test('Detail Edit navigation passes the loaded requirement ID', async () => {
  await renderDetail(makeRequirement('edit-detail-22', 'PUBLISHED'));
  const edit = buttons('Edit')[0];
  expect(edit).toBeDefined();
  act(() => edit?.props.onPress());
  expect(navigationMock.navigate).toHaveBeenCalledWith(ROUTES.home.propertyRequirementJourney, {requirementId: 'edit-detail-22'});
});

test.each([
  ['published-10', 'PUBLISHED', 'Pause Requirement', 'pause'],
  ['paused-11', 'PAUSED', 'Resume Requirement', 'resume'],
] as const)('%s lifecycle action calls %s only after explicit confirmation', async (id, status, label, action) => {
  await renderDetail(makeRequirement(id, status));
  act(() => buttons(label)[0].props.onPress());
  expect(transitionApi).not.toHaveBeenCalled();
  const alertArgs = jest.mocked(Alert.alert).mock.calls.at(-1);
  const confirm = alertArgs?.[2]?.find(button => button.text === 'Confirm');
  expect(confirm).toBeDefined();
  await act(async () => { confirm?.onPress?.(); await Promise.resolve(); await Promise.resolve(); });
  expect(transitionApi).toHaveBeenCalledWith(id, action);
});

test('close action maps to close API and failed lifecycle call does not fake status success', async () => {
  transitionApi.mockRejectedValueOnce(new Error('Close failed'));
  await renderDetail(makeRequirement('pub-12', 'PUBLISHED'));
  act(() => buttons('Close Requirement')[0].props.onPress());
  const alertArgs = jest.mocked(Alert.alert).mock.calls.at(-1);
  const confirm = alertArgs?.[2]?.find(button => button.text === 'Confirm');
  await act(async () => { confirm?.onPress?.(); await Promise.resolve(); await Promise.resolve(); });
  expect(transitionApi).toHaveBeenCalledWith('pub-12', 'close');
  expect(renderer.root.findAllByType(Text).some(item => item.props.children === 'PUBLISHED')).toBe(true);
  expect(renderer.root.findAllByType(Text).some(item => item.props.children === 'Close failed')).toBe(true);
});
