import {mockSupportTickets} from '@/data/mockSupport';
import type {SupportTicket} from '@/types';

import {generateId, simulateNetwork} from './serviceUtils';

let tickets = [...mockSupportTickets];

export async function getSupportTickets(): Promise<SupportTicket[]> {
  return simulateNetwork(tickets);
}

export async function addSupportTicket(
  payload: Omit<SupportTicket, 'id' | 'createdAt'>,
): Promise<SupportTicket> {
  const created: SupportTicket = {
    ...payload,
    id: generateId('ticket'),
    createdAt: new Date().toISOString(),
  };
  tickets = [created, ...tickets];
  return simulateNetwork(created);
}

export async function updateSupportTicket(
  ticketId: string,
  updates: Partial<SupportTicket>,
): Promise<SupportTicket | undefined> {
  let updatedTicket: SupportTicket | undefined;

  tickets = tickets.map(item => {
    if (item.id !== ticketId) {
      return item;
    }

    updatedTicket = {...item, ...updates};
    return updatedTicket;
  });

  return simulateNetwork(updatedTicket);
}

export async function deleteSupportTicket(ticketId: string): Promise<boolean> {
  tickets = tickets.filter(item => item.id !== ticketId);
  return simulateNetwork(true);
}

// Currently using static data. Replace this with real API integration later.
