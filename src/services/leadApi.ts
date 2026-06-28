import {mockLeads} from '@/data/mockLeads';
import type {Lead, LeadStatus, Remark} from '@/types';

import {generateId, simulateNetwork} from './serviceUtils';

let leads = [...mockLeads];

export async function getLeads(): Promise<Lead[]> {
  return simulateNetwork(leads);
}

export async function updateLeadStatus(
  leadId: string,
  status: LeadStatus,
): Promise<Lead | undefined> {
  let updatedLead: Lead | undefined;

  leads = leads.map(lead => {
    if (lead.id !== leadId) {
      return lead;
    }

    updatedLead = {
      ...lead,
      status,
      history: [
        ...lead.history,
        {
          id: generateId('lead-history'),
          status,
          updatedBy: 'Current User',
          updatedAt: new Date().toISOString(),
        },
      ],
    };

    return updatedLead;
  });

  return simulateNetwork(updatedLead);
}

export async function addLeadRemark(
  leadId: string,
  text: string,
): Promise<Remark | undefined> {
  let createdRemark: Remark | undefined;

  leads = leads.map(lead => {
    if (lead.id !== leadId) {
      return lead;
    }

    createdRemark = {
      id: generateId('lead-remark'),
      text,
      addedBy: 'Current User',
      date: new Date().toISOString(),
    };

    return {
      ...lead,
      lastRemark: text,
      remarks: [createdRemark, ...lead.remarks],
    };
  });

  return simulateNetwork(createdRemark);
}

// Currently using static data. Replace this with real API integration later.
