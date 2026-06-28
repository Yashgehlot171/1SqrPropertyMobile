import {mockProperties} from '@/data/mockProperties';
import type {AddPropertyPayload, Property, PropertyFilterState} from '@/types';

import {generateId, simulateNetwork} from './serviceUtils';

let properties = [...mockProperties];

function applyFilters(list: Property[], filters?: Partial<PropertyFilterState>) {
  if (!filters) {
    return list;
  }

  return list.filter(item => {
    const queryMatch = filters.search
      ? item.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.location.city.toLowerCase().includes(filters.search.toLowerCase())
      : true;
    const minPriceMatch = filters.minPrice ? item.price >= filters.minPrice : true;
    const maxPriceMatch = filters.maxPrice ? item.price <= filters.maxPrice : true;
    const verifiedMatch = filters.verifiedOnly ? item.verified : true;
    const ownerMatch = filters.ownerOnly ? item.ownerType === 'Owner' : true;
    const cityMatch = filters.city ? item.location.city === filters.city : true;
    const typeMatch = filters.propertyType
      ? item.propertyType === filters.propertyType
      : true;

    return (
      queryMatch &&
      minPriceMatch &&
      maxPriceMatch &&
      verifiedMatch &&
      ownerMatch &&
      cityMatch &&
      typeMatch
    );
  });
}

export async function getProperties(
  filters?: Partial<PropertyFilterState>,
): Promise<Property[]> {
  return simulateNetwork(applyFilters(properties, filters));
}

export async function getPropertyById(id: string): Promise<Property | undefined> {
  return simulateNetwork(properties.find(item => item.id === id));
}

export async function addProperty(payload: AddPropertyPayload): Promise<Property> {
  const property: Property = {
    ...payload,
    id: generateId('property'),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  properties = [property, ...properties];
  return simulateNetwork(property);
}

export async function updateProperty(
  propertyId: string,
  updates: Partial<Property>,
): Promise<Property | undefined> {
  let updatedProperty: Property | undefined;

  properties = properties.map(item => {
    if (item.id !== propertyId) {
      return item;
    }

    updatedProperty = {
      ...item,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    return updatedProperty;
  });

  return simulateNetwork(updatedProperty);
}

export async function deleteProperty(propertyId: string): Promise<boolean> {
  properties = properties.filter(item => item.id !== propertyId);
  return simulateNetwork(true);
}

// Currently using static data. Replace this with real API integration later.
