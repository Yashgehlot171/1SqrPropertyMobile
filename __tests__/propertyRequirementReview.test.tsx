import React from 'react';
import {act, create} from 'react-test-renderer';
import {Text} from 'react-native';
import type {MasterRecord} from '../src/services/masterApi';
import type {RequirementDraft} from '../src/store/propertyRequirementStore';
import {RequirementReviewStep} from '../src/screens/propertyRequirement/steps/RequirementReviewStep';

const master = (id: number, name: string, slug?: string): MasterRecord => ({
  id, name, slug, type: 'property-types', code: null, description: null, parentId: null,
  sortOrder: id, status: 'active', metadata: {}, createdAt: '', updatedAt: '',
});
const draft = (overrides: Partial<RequirementDraft> = {}): RequirementDraft => ({
  id: 'internal-id', stateId: 1, cityId: 2, localityIds: [3, 4], propertyTypeId: 10,
  nearbyLocalityAllowed: true, budgetMin: '2500000.00', budgetMax: '4000000.00',
  areaMin: '800', areaMax: '1200', areaUnit: 'sq ft', purchaseTimeline: 'WITHIN_3_MONTHS',
  paymentPreference: 'HOME_LOAN', occupation: 'SELF_EMPLOYED', loanRequirement: '1500000',
  loanStatus: 'PRE_APPROVED', preferences: {}, consentAccepted: false, ...overrides,
});
const labelsAndValues = (renderer: ReturnType<typeof create>) => renderer.root.findAllByType(Text)
  .map(node => node.props.children)
  .flatMap(child => Array.isArray(child) ? child : [child])
  .filter((child): child is string => typeof child === 'string');

function renderReview(requirementDraft: RequirementDraft, propertyType = master(10, 'Apartment', 'flat')) {
  let renderer!: ReturnType<typeof create>;
  act(() => {
    renderer = create(<RequirementReviewStep
      draft={requirementDraft}
      states={[master(1, 'Maharashtra')]}
      cities={[master(2, 'Pune')]}
      areas={[master(3, 'Kothrud'), master(4, 'Baner')]}
      types={[propertyType]}
      onEdit={jest.fn()}
    />);
  });
  return renderer;
}

test('Review displays readable location, type, area, budget, timeline, payment and loan labels', () => {
  const renderer = renderReview(draft({preferences: {bhk: '2 BHK'}}));
  const values = labelsAndValues(renderer);
  for (const expected of [
    'Maharashtra', 'Pune', 'Kothrud, Baner', 'Apartment', 'Yes', '2 BHK',
    '₹25,00,000', '₹40,00,000', '1–3 Months', 'Home Loan',
    'Self-Employed / Business', 'Pre-Approved', '₹15,00,000',
  ]) expect(values).toContain(expected);
  expect(values).not.toContain('flat');
  expect(values).not.toContain('10');
  expect(values).not.toContain('HOME_LOAN');
});

test('Review formats known timeline values and shows Flat-only preference labels', () => {
  const renderer = renderReview(draft({
    purchaseTimeline: 'IMMEDIATELY', paymentPreference: 'SELF_FUNDED',
    preferences: {bhk: '3 BHK', preferredFloor: 'Ground', numberOfFloors: 'G+2', facing: 'North'},
  }));
  const values = labelsAndValues(renderer);
  expect(values).toContain('Immediately');
  expect(values).toContain('Preferred Floor');
  expect(values).toContain('Ground');
  expect(values).not.toContain('Number of Floors');
  expect(values).not.toContain('Facing');
  expect(values).not.toContain('SELF_FUNDED');
  expect(values).not.toContain('Occupation');
});

test('HOUSE Review labels floors as Number of Floors and omits Flat Preferred Floor and Lift', () => {
  const renderer = renderReview(draft({
    preferences: {numberOfFloors: 'G+2', preferredFloor: 'Higher', lift: 'Required'},
  }), master(10, 'House', 'house'));
  const values = labelsAndValues(renderer);
  expect(values).toContain('Number of Floors');
  expect(values).toContain('G+2');
  expect(values).not.toContain('Preferred Floor');
  expect(values).not.toContain('Lift');
});

test('LAND Review only includes facing and corner values from preferences', () => {
  const renderer = renderReview(draft({
    preferences: {facing: 'North', corner: 'Corner preferred', bhk: '4 BHK', bathrooms: '4'},
  }), master(10, 'Plot', 'plot'));
  const values = labelsAndValues(renderer);
  expect(values).toContain('Facing');
  expect(values).toContain('North');
  expect(values).toContain('Corner Property');
  expect(values).toContain('Corner preferred');
  expect(values).not.toContain('BHK');
  expect(values).not.toContain('Bathrooms');
});

test('COMMERCIAL Review renders only supported commercial preferences', () => {
  let renderer!: ReturnType<typeof create>;
  act(() => {
    renderer = create(<RequirementReviewStep draft={draft({
      preferences: {furnishing: 'Furnished', parking: 'Required', preferredFloor: 'Higher', condition: 'Resale', bhk: '2 BHK'},
    })} states={[]} cities={[]} areas={[]} types={[master(10, 'Office', 'office')]} onEdit={jest.fn()} />);
  });
  const values = labelsAndValues(renderer);
  for (const value of ['Furnishing', 'Parking', 'Preferred Floor', 'Property Condition']) expect(values).toContain(value);
  expect(values).not.toContain('BHK');
});

test('UNKNOWN property family does not dump arbitrary preferences or raw identifiers', () => {
  let renderer!: ReturnType<typeof create>;
  act(() => {
    renderer = create(<RequirementReviewStep draft={draft({preferences: {internalCode: 'secret', bhk: '2 BHK'}})}
      states={[]} cities={[]} areas={[]} types={[master(10, 'Other type', 'custom-type')]} onEdit={jest.fn()} />);
  });
  const values = labelsAndValues(renderer);
  expect(values).toContain('Other type');
  expect(values).not.toContain('secret');
  expect(values).not.toContain('2 BHK');
});
