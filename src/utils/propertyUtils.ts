import type {Property, PropertyFilterState} from '@/types';
import {formatCurrency} from '@/utils/formatCurrency';

export function filterProperties(
  properties: Property[],
  filters: Partial<PropertyFilterState>,
  category?: string,
): Property[] {
  return properties.filter(property => {
    const query = filters.search?.trim().toLowerCase();
    const matchesQuery = query
      ? property.title.toLowerCase().includes(query) ||
        property.location.city.toLowerCase().includes(query) ||
        (property.location.area ?? '').toLowerCase().includes(query)
      : true;
    const matchesCategory = category
      ? category === 'All'
        ? true
        : category === 'Owner'
          ? property.ownerType === 'Owner'
          : category === 'Verified'
            ? property.verified
            : category === 'Ready To Move'
              ? property.readyState === 'Ready To Move'
              : category === 'New Launches'
                ? property.readyState === 'New Launch' ||
                  property.category === 'New Launches'
                : property.category === category
      : true;
    const matchesMinPrice = filters.minPrice ? property.price >= filters.minPrice : true;
    const matchesMaxPrice = filters.maxPrice ? property.price <= filters.maxPrice : true;
    const matchesMinArea = filters.minArea ? property.areaSqFt >= filters.minArea : true;
    const matchesMaxArea = filters.maxArea ? property.areaSqFt <= filters.maxArea : true;
    const matchesType = filters.propertyType
      ? property.propertyType === filters.propertyType
      : true;
    const matchesBhk = filters.bhk ? property.bhk === filters.bhk : true;
    const matchesFacing = filters.facing ? property.facing === filters.facing : true;
    const matchesCity = filters.city ? property.location.city === filters.city : true;
    const matchesReady = filters.readyToMoveOnly
      ? property.readyState === 'Ready To Move'
      : true;
    const matchesVerified = filters.verifiedOnly ? property.verified : true;
    const matchesOwner = filters.ownerOnly ? property.ownerType === 'Owner' : true;

    return (
      matchesQuery &&
      matchesCategory &&
      matchesMinPrice &&
      matchesMaxPrice &&
      matchesMinArea &&
      matchesMaxArea &&
      matchesType &&
      matchesBhk &&
      matchesFacing &&
      matchesCity &&
      matchesReady &&
      matchesVerified &&
      matchesOwner
    );
  });
}

export function buildPropertyShareMessage(property: Property): string {
  return [
    `Check out this property on UrbanKart: ${property.title}`,
    `${property.location.area}, ${property.location.city}`,
    `${formatCurrency(property.price)} | ${property.areaSqFt} sq ft | ${property.propertyType}`,
    `Listed by ${property.ownerType}: ${property.owner.name} (${property.owner.mobile})`,
  ].join('\n');
}

export function getPropertyPlaceholderLabel(property: Property): string {
  return property.propertyType
    .split(' ')
    .map(word => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}
