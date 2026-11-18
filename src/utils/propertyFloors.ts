export type PropertyFloorMode =
  | 'house-required'
  | 'house-optional'
  | 'unit-required'
  | 'unit-optional'
  | 'none';

const normalizeTypeName = (value: string): string =>
  value.trim().toLowerCase().replace(/[\s_-]+/g, ' ');

/**
 * Floor behaviour is derived from the property-type master name returned by the
 * API. It intentionally does not depend on database ids, which are environment
 * specific.
 */
export function getPropertyFloorMode(propertyType: string): PropertyFloorMode {
  const type = normalizeTypeName(propertyType);

  if (type === 'house' || type === 'independent house') {
    return 'house-required';
  }
  if (type === 'flat' || type === 'apartment' || type === 'flat apartment') {
    return 'unit-required';
  }
  if (type === 'commercial house') {
    return 'house-optional';
  }
  if (type === 'office') {
    return 'unit-optional';
  }

  // Plot, Residential Land, Agriculture Land, Commercial Plot and Warehouse
  // have no floor requirement in the current backend property rules.
  return 'none';
}

export const isHouseFloorMode = (mode: PropertyFloorMode): boolean =>
  mode === 'house-required' || mode === 'house-optional';

export const isUnitFloorMode = (mode: PropertyFloorMode): boolean =>
  mode === 'unit-required' || mode === 'unit-optional';

export function floorResetForPropertyTypeChange(
  previousType: string,
  nextType: string,
): {floorNumber?: undefined; totalFloors?: undefined} {
  if (normalizeTypeName(previousType) === normalizeTypeName(nextType)) {
    return {};
  }
  return {floorNumber: undefined, totalFloors: undefined};
}

export function validatePropertyFloors(
  propertyType: string,
  floorNumber?: number,
  totalFloors?: number,
): string | undefined {
  const mode = getPropertyFloorMode(propertyType);

  if (mode === 'house-required' && (!Number.isInteger(totalFloors) || totalFloors! < 1)) {
    return 'Please select number of floors';
  }

  if (mode === 'unit-required') {
    if (!Number.isInteger(floorNumber) || floorNumber! < 0) {
      return 'Please select your property floor';
    }
    if (!Number.isInteger(totalFloors) || totalFloors! < 1) {
      return 'Please select total building floors';
    }
  }

  if (isUnitFloorMode(mode)) {
    const hasEither = floorNumber !== undefined || totalFloors !== undefined;
    if (
      hasEither &&
      (!Number.isInteger(floorNumber) ||
        floorNumber! < 0 ||
        !Number.isInteger(totalFloors) ||
        totalFloors! < 1)
    ) {
      return 'Select both property floor and total building floors';
    }
    if (
      floorNumber !== undefined &&
      totalFloors !== undefined &&
      floorNumber > totalFloors
    ) {
      return 'Property floor cannot exceed total building floors';
    }
  }

  return undefined;
}

export function formatPropertyFloor(value: number): string {
  if (value === 0) return 'Ground Floor';
  const remainder100 = value % 100;
  const remainder10 = value % 10;
  const suffix =
    remainder100 >= 11 && remainder100 <= 13
      ? 'th'
      : remainder10 === 1
        ? 'st'
        : remainder10 === 2
          ? 'nd'
          : remainder10 === 3
            ? 'rd'
            : 'th';
  return `${value}${suffix} Floor`;
}

export const formatBuildingFloors = (value: number): string => `G+${value}`;

export function formatHouseFloors(value: number): string {
  return value === 1 ? 'G' : `G+${value - 1}`;
}

