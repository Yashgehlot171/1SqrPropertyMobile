import {create} from 'zustand';

import {mockLeads} from '@/data/mockLeads';
import {generateId} from '@/services/serviceUtils';
import type {Lead, LeadStatus} from '@/types';

function latestRemarkText(lead: Lead): string | undefined {
  return lead.remarks[0]?.text ?? lead.lastRemark;
}

interface LeadStore {
  leads: Lead[];
  setLeads: (leads: Lead[]) => void;
  removeLead: (leadId: string) => void;
  updateLeadStatus: (leadId: string, status: LeadStatus) => void;
  updateFollowUpDate: (leadId: string, followUpDate: string) => void;
  addRemark: (leadId: string, text: string, addedBy?: string) => void;
  editRemark: (leadId: string, remarkId: string, text: string) => void;
  deleteRemark: (leadId: string, remarkId: string) => void;
}

export const useLeadStore = create<LeadStore>(set => ({
  leads: mockLeads,
  setLeads: leads => set({leads}),
  removeLead: leadId =>
    set(state => ({
      leads: state.leads.filter(lead => lead.id !== leadId),
    })),
  updateLeadStatus: (leadId, status) =>
    set(state => ({
      leads: state.leads.map(lead =>
        lead.id === leadId
          ? {
              ...lead,
              status,
              history: [
                {
                  id: generateId('lead-history'),
                  status,
                  updatedBy: 'Current User',
                  updatedAt: new Date().toISOString(),
                },
                ...lead.history,
              ],
            }
          : lead,
      ),
    })),
  updateFollowUpDate: (leadId, followUpDate) =>
    set(state => ({
      leads: state.leads.map(lead =>
        lead.id === leadId
          ? {
              ...lead,
              followUpDate,
            }
          : lead,
      ),
    })),
  addRemark: (leadId, text, addedBy = 'Current User') =>
    set(state => ({
      leads: state.leads.map(lead =>
        lead.id === leadId
          ? {
              ...lead,
              lastRemark: text,
              remarks: [
                {
                  id: generateId('lead-remark'),
                  text,
                  addedBy,
                  date: new Date().toISOString(),
                },
                ...lead.remarks,
              ],
            }
          : lead,
      ),
    })),
  editRemark: (leadId, remarkId, text) =>
    set(state => ({
      leads: state.leads.map(lead => {
        if (lead.id !== leadId) {
          return lead;
        }

        const remarks = lead.remarks.map(remark =>
          remark.id === remarkId
            ? {
                ...remark,
                text,
                date: new Date().toISOString(),
              }
            : remark,
        );

        return {
          ...lead,
          remarks,
          lastRemark: latestRemarkText({...lead, remarks}),
        };
      }),
    })),
  deleteRemark: (leadId, remarkId) =>
    set(state => ({
      leads: state.leads.map(lead => {
        if (lead.id !== leadId) {
          return lead;
        }

        const remarks = lead.remarks.filter(remark => remark.id !== remarkId);

        return {
          ...lead,
          remarks,
          lastRemark: latestRemarkText({...lead, remarks}),
        };
      }),
    })),
}));
