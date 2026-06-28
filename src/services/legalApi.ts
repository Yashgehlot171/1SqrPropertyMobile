import {mockLegalRequests, mockLegalTeams} from '@/data/mockLegal';
import type {LegalRequest, LegalTeam} from '@/types';

import {generateId, simulateNetwork} from './serviceUtils';

let requests = [...mockLegalRequests];

export async function getLegalTeams(): Promise<LegalTeam[]> {
  return simulateNetwork(mockLegalTeams);
}

export async function getLegalRequests(): Promise<LegalRequest[]> {
  return simulateNetwork(requests);
}

export async function addLegalRequest(
  payload: Omit<LegalRequest, 'id' | 'createdAt'>,
): Promise<LegalRequest> {
  const created: LegalRequest = {
    ...payload,
    id: generateId('legal'),
    createdAt: new Date().toISOString(),
  };
  requests = [created, ...requests];
  return simulateNetwork(created);
}

export async function updateLegalRequest(
  requestId: string,
  updates: Partial<LegalRequest>,
): Promise<LegalRequest | undefined> {
  let updatedRequest: LegalRequest | undefined;

  requests = requests.map(item => {
    if (item.id !== requestId) {
      return item;
    }

    updatedRequest = {...item, ...updates};
    return updatedRequest;
  });

  return simulateNetwork(updatedRequest);
}

export async function deleteLegalRequest(requestId: string): Promise<boolean> {
  requests = requests.filter(item => item.id !== requestId);
  return simulateNetwork(true);
}

// Currently using static data. Replace this with real API integration later.
