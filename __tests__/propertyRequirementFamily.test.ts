import {
  getPropertyRequirementFamily,
  filterPropertyRequirementPreferences,
  PROPERTY_REQUIREMENT_PREFERENCE_KEYS,
} from '../src/utils/propertyRequirementFamily';

test.each(['flat'])('slug %s maps to FLAT', slug => {
  expect(getPropertyRequirementFamily(slug)).toBe('FLAT');
});

test.each(['house'])('slug %s maps to HOUSE', slug => {
  expect(getPropertyRequirementFamily(slug)).toBe('HOUSE');
});

test.each(['plot', 'agriculture-land', 'commercial-plot'])('%s maps to LAND', slug => {
  expect(getPropertyRequirementFamily(slug)).toBe('LAND');
});

test.each(['commercial-house', 'office', 'warehouse'])('%s maps to COMMERCIAL', slug => {
  expect(getPropertyRequirementFamily(slug)).toBe('COMMERCIAL');
});

test.each([undefined, null, '', 'independent-house', 'unknown'])('unrecognized slug %s maps to UNKNOWN', slug => {
  expect(getPropertyRequirementFamily(slug)).toBe('UNKNOWN');
});

test('family preference keys are exclusive and House uses building floors, not flat floor preference', () => {
  expect(PROPERTY_REQUIREMENT_PREFERENCE_KEYS.HOUSE).toContain('numberOfFloors');
  expect(PROPERTY_REQUIREMENT_PREFERENCE_KEYS.HOUSE).not.toContain('preferredFloor');
  expect(PROPERTY_REQUIREMENT_PREFERENCE_KEYS.LAND).not.toContain('bhk');
  expect(PROPERTY_REQUIREMENT_PREFERENCE_KEYS.LAND).not.toContain('bathrooms');
  expect(PROPERTY_REQUIREMENT_PREFERENCE_KEYS.FLAT).toContain('preferredFloor');
  expect(PROPERTY_REQUIREMENT_PREFERENCE_KEYS.COMMERCIAL).toEqual(['furnishing', 'parking', 'preferredFloor', 'condition']);
});

test('property type classification is exact slug lookup with no display-name fallback', () => {
  expect(getPropertyRequirementFamily('House')).toBe('UNKNOWN');
  expect(getPropertyRequirementFamily('commercial-shop')).toBe('UNKNOWN');
});

test('Flat to Plot clears incompatible residential preferences', () => {
  expect(filterPropertyRequirementPreferences({
    bhk: '2 BHK', bathrooms: '2', preferredFloor: 'Middle', furnishing: 'Furnished',
    parking: 'Required', lift: 'Required', condition: 'Resale', facing: 'North', corner: 'Preferred',
  }, 'LAND')).toEqual({facing: 'North', corner: 'Preferred'});
});

test('same-family type change retains compatible keys and drops unsupported stale keys', () => {
  expect(filterPropertyRequirementPreferences({bhk: '3 BHK', preferredFloor: 'Higher', numberOfFloors: 'G+2'}, 'FLAT'))
    .toEqual({bhk: '3 BHK', preferredFloor: 'Higher'});
});
