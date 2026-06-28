import {mockLoanBanks, mockLoanRequests} from '@/data/mockLoans';
import type {LoanBank, LoanRequest} from '@/types';

import {generateId, simulateNetwork} from './serviceUtils';

let requests = [...mockLoanRequests];

export async function getLoanBanks(): Promise<LoanBank[]> {
  return simulateNetwork(mockLoanBanks);
}

export async function getLoanRequests(): Promise<LoanRequest[]> {
  return simulateNetwork(requests);
}

export async function addLoanRequest(
  payload: Omit<LoanRequest, 'id' | 'createdAt'>,
): Promise<LoanRequest> {
  const created: LoanRequest = {
    ...payload,
    id: generateId('loan'),
    createdAt: new Date().toISOString(),
  };
  requests = [created, ...requests];
  return simulateNetwork(created);
}

export async function updateLoanRequest(
  requestId: string,
  updates: Partial<LoanRequest>,
): Promise<LoanRequest | undefined> {
  let updatedRequest: LoanRequest | undefined;

  requests = requests.map(item => {
    if (item.id !== requestId) {
      return item;
    }

    updatedRequest = {...item, ...updates};
    return updatedRequest;
  });

  return simulateNetwork(updatedRequest);
}

export async function deleteLoanRequest(requestId: string): Promise<boolean> {
  requests = requests.filter(item => item.id !== requestId);
  return simulateNetwork(true);
}

// Currently using static data. Replace this with real API integration later.
