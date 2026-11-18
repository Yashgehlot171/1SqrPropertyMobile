import {
  floorResetForPropertyTypeChange,
  formatHouseFloors,
  getPropertyFloorMode,
  validatePropertyFloors,
} from '../src/utils/propertyFloors';

describe('property floor behaviour', () => {
  it('derives behaviour from master names without ids', () => {
    expect(getPropertyFloorMode('House')).toBe('house-required');
    expect(getPropertyFloorMode('Independent House')).toBe('house-required');
    expect(getPropertyFloorMode('Flat')).toBe('unit-required');
    expect(getPropertyFloorMode('Apartment')).toBe('unit-required');
    expect(getPropertyFloorMode('Commercial House')).toBe('house-optional');
    expect(getPropertyFloorMode('Office')).toBe('unit-optional');
    expect(getPropertyFloorMode('Plot')).toBe('none');
    expect(getPropertyFloorMode('Agriculture Land')).toBe('none');
    expect(getPropertyFloorMode('Commercial Plot')).toBe('none');
    expect(getPropertyFloorMode('Warehouse')).toBe('none');
  });

  it('maps house storey counts to the requested labels', () => {
    expect(formatHouseFloors(1)).toBe('G');
    expect(formatHouseFloors(3)).toBe('G+2');
  });

  it('accepts valid flat floors including Ground and rejects an impossible floor', () => {
    expect(validatePropertyFloors('Flat', 0, 8)).toBeUndefined();
    expect(validatePropertyFloors('Flat', 3, 8)).toBeUndefined();
    expect(validatePropertyFloors('Flat', 9, 8)).toBe(
      'Property floor cannot exceed total building floors',
    );
  });

  it('requires a house storey selection and no floors for land', () => {
    expect(validatePropertyFloors('House', undefined, 1)).toBeUndefined();
    expect(validatePropertyFloors('House', undefined, 3)).toBeUndefined();
    expect(validatePropertyFloors('House')).toBe('Please select number of floors');
    expect(validatePropertyFloors('Plot')).toBeUndefined();
  });

  it('clears both values whenever the property type changes', () => {
    expect(floorResetForPropertyTypeChange('Flat', 'House')).toEqual({
      floorNumber: undefined,
      totalFloors: undefined,
    });
    expect(floorResetForPropertyTypeChange('House', 'Plot')).toEqual({
      floorNumber: undefined,
      totalFloors: undefined,
    });
    expect(floorResetForPropertyTypeChange('Flat', 'Flat')).toEqual({});
  });
});
