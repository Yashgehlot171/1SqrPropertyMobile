import {
  emptyRequirement,
  usePropertyRequirementStore,
} from '../src/store/propertyRequirementStore';

const property = {
  id: 'requirement-42',
  status: 'DRAFT' as const,
  propertyType: {id: 81, name: 'Flat', slug: 'flat'},
  state: {id: 11, name: 'State'},
  city: {id: 21, name: 'City'},
  localities: [{id: 31, name: 'Area A'}, {id: 32, name: 'Area B'}],
  nearbyLocalityAllowed: true,
  budgetMin: '2500000.00',
  budgetMax: '4000000.00',
  areaMin: '800.00',
  areaMax: '1200.00',
  areaUnit: 'sq ft',
  purchaseTimeline: 'WITHIN_3_MONTHS',
  targetPurchaseDate: '2027-01-15',
  paymentPreference: 'HOME_LOAN' as const,
  occupation: 'SALARIED',
  loanRequirement: '1500000.00',
  loanStatus: 'PRE_APPROVED',
  preferences: {bhk: '2 BHK', bathrooms: '2', preferredFloor: 'Middle'},
  additionalRequirement: 'Near transit',
  consentAccepted: true,
};

beforeEach(() => usePropertyRequirementStore.getState().reset());

test('new journey reset clears ID, status, location, type, preferences, loan values and consent', () => {
  const store = usePropertyRequirementStore.getState();
  store.hydrate(property);
  store.reset();
  expect(usePropertyRequirementStore.getState().draft).toEqual(emptyRequirement());
  expect(usePropertyRequirementStore.getState().draft.id).toBeUndefined();
  expect(usePropertyRequirementStore.getState().draft.status).toBeUndefined();
  expect(usePropertyRequirementStore.getState().draft.consentAccepted).toBe(false);
});

test('new draft starts without an ID and with consent unchecked', () => {
  expect(usePropertyRequirementStore.getState().draft.id).toBeUndefined();
  expect(usePropertyRequirementStore.getState().draft.consentAccepted).toBe(false);
});

test('changing State clears the dependent City and all selected Localities', () => {
  const store = usePropertyRequirementStore.getState();
  store.set({stateId: 1, cityId: 2, localityIds: [3, 4]});
  store.setState(5);
  expect(usePropertyRequirementStore.getState().draft).toMatchObject({stateId: 5, cityId: undefined, localityIds: []});
});

test('changing City clears selected Localities', () => {
  const store = usePropertyRequirementStore.getState();
  store.set({stateId: 1, localityIds: [3, 4]});
  store.setCity(2);
  expect(usePropertyRequirementStore.getState().draft).toMatchObject({cityId: 2, localityIds: []});
});

test('multiple locality IDs are preserved by the store and outgoing payload', () => {
  usePropertyRequirementStore.getState().set({localityIds: [31, 32]});
  const state = usePropertyRequirementStore.getState();
  expect(state.draft.localityIds).toEqual([31, 32]);
  expect(state.payload().localityIds).toEqual([31, 32]);
});

test('Property Type relation is persisted as propertyTypeId, not its display name or slug', () => {
  usePropertyRequirementStore.getState().set({propertyTypeId: 81});
  const payload = usePropertyRequirementStore.getState().payload();
  expect(payload.propertyTypeId).toBe(81);
  expect(payload).not.toHaveProperty('propertyType');
  expect(payload).not.toHaveProperty('propertyTypeSlug');
});

test('loan payment retains occupation, loan amount and loan status in the payload', () => {
  const store = usePropertyRequirementStore.getState();
  store.setPayment('HOME_LOAN');
  store.set({occupation: 'SALARIED', loanRequirement: '1500000', loanStatus: 'PRE_APPROVED'});
  expect(store.payload()).toMatchObject({
    paymentPreference: 'HOME_LOAN', occupation: 'SALARIED',
    loanRequirement: '1500000', loanStatus: 'PRE_APPROVED',
  });
});

test.each(['SELF_FUNDED', 'NOT_DECIDED'] as const)('%s clears previously entered loan fields', payment => {
  const store = usePropertyRequirementStore.getState();
  store.setPayment('PART_LOAN');
  store.set({occupation: 'OTHER', loanRequirement: '125000', loanStatus: 'APPROVED'});
  store.setPayment(payment);
  expect(usePropertyRequirementStore.getState().payload()).toMatchObject({paymentPreference: payment});
  expect(usePropertyRequirementStore.getState().draft).toMatchObject({
    occupation: undefined, loanRequirement: undefined, loanStatus: undefined,
  });
});

test('Draft hydration restores ID, status, state, city, multiple localities and nearby preference', () => {
  usePropertyRequirementStore.getState().hydrate(property);
  expect(usePropertyRequirementStore.getState().draft).toMatchObject({
    id: 'requirement-42', status: 'DRAFT', stateId: 11, cityId: 21,
    localityIds: [31, 32], nearbyLocalityAllowed: true,
  });
});

test('Draft hydration restores Property Type ID and preferences without invoking user-change clearing', () => {
  usePropertyRequirementStore.getState().hydrate(property);
  expect(usePropertyRequirementStore.getState().draft).toMatchObject({
    propertyTypeId: 81,
    preferences: {bhk: '2 BHK', bathrooms: '2', preferredFloor: 'Middle'},
  });
});

test('Draft hydration restores budget, timeline, area and target date', () => {
  usePropertyRequirementStore.getState().hydrate(property);
  expect(usePropertyRequirementStore.getState().draft).toMatchObject({
    budgetMin: '2500000.00', budgetMax: '4000000.00',
    areaMin: '800.00', areaMax: '1200.00', areaUnit: 'sq ft',
    purchaseTimeline: 'WITHIN_3_MONTHS', targetPurchaseDate: '2027-01-15',
  });
});

test('Draft hydration restores payment, loan details and additional requirement', () => {
  usePropertyRequirementStore.getState().hydrate(property);
  expect(usePropertyRequirementStore.getState().draft).toMatchObject({
    paymentPreference: 'HOME_LOAN', occupation: 'SALARIED',
    loanRequirement: '1500000.00', loanStatus: 'PRE_APPROVED',
    additionalRequirement: 'Near transit',
  });
});

test('hydration preserves persisted consent and reset prevents consent leaking to a new journey', () => {
  const store = usePropertyRequirementStore.getState();
  store.hydrate(property);
  expect(usePropertyRequirementStore.getState().draft.consentAccepted).toBe(true);
  store.reset();
  expect(usePropertyRequirementStore.getState().draft.consentAccepted).toBe(false);
});

test('clearing hydrated additional text produces an empty outgoing value', () => {
  const store = usePropertyRequirementStore.getState();
  store.hydrate(property);
  store.set({additionalRequirement: ''});
  expect(usePropertyRequirementStore.getState().payload().additionalRequirement).toBe('');
  expect(usePropertyRequirementStore.getState().payload().additionalRequirement).not.toBe('Near transit');
});

test('payload carries relation IDs and one preferences object without contact or monetization fields', () => {
  usePropertyRequirementStore.getState().set({
    stateId: 11, cityId: 21, propertyTypeId: 81, localityIds: [31, 32],
    preferences: {bhk: '2 BHK'},
  });
  const payload = usePropertyRequirementStore.getState().payload();
  expect(payload).toMatchObject({stateId: 11, cityId: 21, propertyTypeId: 81, localityIds: [31, 32], preferences: {bhk: '2 BHK'}});
  expect(payload).not.toHaveProperty('flatPreferences');
  expect(payload).not.toHaveProperty('housePreferences');
  for (const key of ['phone', 'whatsapp', 'email', 'leadPrice', 'leadSlots', 'brokerId', 'contactUnlockState']) {
    expect(payload).not.toHaveProperty(key);
  }
  expect(payload).not.toHaveProperty('id');
  expect(payload).not.toHaveProperty('status');
});
