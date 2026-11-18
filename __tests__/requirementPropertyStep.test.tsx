import React from 'react';
import {act, create, type ReactTestInstance} from 'react-test-renderer';
import {Text} from 'react-native';
import type {MasterRecord} from '../src/services/masterApi';
import {RequirementPropertyStep} from '../src/screens/propertyRequirement/steps/RequirementPropertyStep';
import {usePropertyRequirementStore} from '../src/store/propertyRequirementStore';

const type = (id: number, name: string, slug: string): MasterRecord => ({
  id, name, slug, type: 'property-types', code: null, description: null, parentId: null,
  sortOrder: id, status: 'active', metadata: {}, createdAt: '', updatedAt: '',
});
const types = [type(41, 'Flat', 'flat'), type(58, 'Plot', 'plot')];
let renderer: ReturnType<typeof create>;

const buttonFor = (label: string) => {
  const text = renderer.root.findAllByType(Text).find(item => item.props.children === label);
  let parent: ReactTestInstance | null = text?.parent ?? null;
  while (parent && typeof parent.props.onPress !== 'function') parent = parent.parent;
  return parent;
};

beforeEach(() => {
  usePropertyRequirementStore.getState().reset();
});
afterEach(() => {
  if (renderer) act(() => renderer.unmount());
});

test('master type selection saves the selected ID and clears Flat preferences when changing to Plot', () => {
  act(() => usePropertyRequirementStore.getState().set({
    propertyTypeId: 41,
    preferences: {
      bhk: '2 BHK', bathrooms: '2', preferredFloor: 'Middle', furnishing: 'Furnished',
      parking: 'Required', lift: 'Required', condition: 'Resale', facing: 'North',
    },
  }));
  act(() => { renderer = create(<RequirementPropertyStep types={types} />); });
  const plotOption = buttonFor('Plot');
  expect(plotOption).not.toBeNull();
  act(() => plotOption?.props.onPress());
  const {draft} = usePropertyRequirementStore.getState();
  expect(draft.propertyTypeId).toBe(58);
  expect(draft.propertyTypeId).not.toBe('Plot');
  expect(draft.preferences).toEqual({facing: 'North'});
  expect(usePropertyRequirementStore.getState().payload().propertyTypeId).toBe(58);
});

test('reselecting the current type does not discard saved preferences', () => {
  act(() => usePropertyRequirementStore.getState().set({propertyTypeId: 41, preferences: {bhk: '3 BHK', preferredFloor: 'Ground'}}));
  act(() => { renderer = create(<RequirementPropertyStep types={types} />); });
  act(() => buttonFor('Flat')?.props.onPress());
  expect(usePropertyRequirementStore.getState().draft.preferences).toEqual({bhk: '3 BHK', preferredFloor: 'Ground'});
});
