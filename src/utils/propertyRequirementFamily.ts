export type PropertyRequirementFamily =
  | 'FLAT'
  | 'HOUSE'
  | 'LAND'
  | 'COMMERCIAL'
  | 'UNKNOWN';

/** Classify only explicitly supported PropertyType master slugs. */
export function getPropertyRequirementFamily(
  slug?: string | null,
): PropertyRequirementFamily {
  switch (slug) {
    case 'flat':
      return 'FLAT';
    case 'house':
      return 'HOUSE';
    case 'plot':
    case 'agriculture-land':
    case 'commercial-plot':
      return 'LAND';
    case 'commercial-house':
    case 'office':
    case 'warehouse':
      return 'COMMERCIAL';
    default:
      return 'UNKNOWN';
  }
}

export const PROPERTY_REQUIREMENT_PREFERENCE_KEYS: Record<
  PropertyRequirementFamily,
  readonly string[]
> = {
  FLAT: [
    'bhk',
    'bathrooms',
    'preferredFloor',
    'furnishing',
    'parking',
    'lift',
    'condition',
  ],
  HOUSE: [
    'bhk',
    'bathrooms',
    'numberOfFloors',
    'furnishing',
    'parking',
    'condition',
  ],
  LAND: ['facing', 'corner'],
  COMMERCIAL: ['furnishing', 'parking', 'preferredFloor', 'condition'],
  UNKNOWN: [],
};

export function filterPropertyRequirementPreferences(
  preferences: Record<string, unknown>,
  family: PropertyRequirementFamily,
): Record<string, unknown> {
  const allowedKeys = PROPERTY_REQUIREMENT_PREFERENCE_KEYS[family];
  return Object.fromEntries(
    Object.entries(preferences).filter(([key]) => allowedKeys.includes(key)),
  );
}
