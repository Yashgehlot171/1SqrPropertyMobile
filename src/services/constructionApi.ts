import {
  mockConstructionPackages,
  mockConstructionQuotes,
  mockConstructionRequests,
  mockContractors,
  mockMaterialBrands,
  mockSuppliers,
} from '@/data/mockConstruction';
import type {
  ConstructionQuote,
  ConstructionRequest,
  DirectoryEntry,
  MaterialBrand,
} from '@/types';

import {generateId, simulateNetwork} from './serviceUtils';

let savedQuotes = [...mockConstructionQuotes];
let requests = [...mockConstructionRequests];

export async function getConstructionPackages() {
  return simulateNetwork(mockConstructionPackages);
}

export async function getSuppliers(): Promise<DirectoryEntry[]> {
  return simulateNetwork(mockSuppliers);
}

export async function getContractors(): Promise<DirectoryEntry[]> {
  return simulateNetwork(mockContractors);
}

export async function getMaterialBrands(): Promise<MaterialBrand[]> {
  return simulateNetwork(mockMaterialBrands);
}

export async function saveConstructionQuote(
  quote: Omit<ConstructionQuote, 'id' | 'createdAt'>,
): Promise<ConstructionQuote> {
  const created: ConstructionQuote = {
    ...quote,
    id: generateId('quote'),
    createdAt: new Date().toISOString(),
  };
  savedQuotes = [created, ...savedQuotes];
  return simulateNetwork(created);
}

export async function deleteConstructionQuote(quoteId: string): Promise<boolean> {
  savedQuotes = savedQuotes.filter(item => item.id !== quoteId);
  return simulateNetwork(true);
}

export async function getConstructionRequests(): Promise<ConstructionRequest[]> {
  return simulateNetwork(requests);
}

export async function addConstructionRequest(
  payload: ConstructionRequest,
): Promise<ConstructionRequest> {
  const created = {...payload, id: generateId('construction-request')};
  requests = [created, ...requests];
  return simulateNetwork(created);
}

// Currently using static data. Replace this with real API integration later.
