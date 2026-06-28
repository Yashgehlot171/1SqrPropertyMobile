import {create} from 'zustand';

import {mockSupportTickets} from '@/data/mockSupport';
import {generateId} from '@/services/serviceUtils';
import type {
  SupportTicket,
  SupportTicketStatus,
  UploadedDocument,
} from '@/types';

interface SupportStore {
  tickets: SupportTicket[];
  addTicket: (payload: Omit<SupportTicket, 'id' | 'createdAt'>) => SupportTicket;
  updateTicket: (ticketId: string, updates: Partial<SupportTicket>) => void;
  deleteTicket: (ticketId: string) => void;
  updateTicketStatus: (
    ticketId: string,
    status: SupportTicketStatus,
  ) => void;
  addRemark: (ticketId: string, text: string, addedBy?: string) => void;
  editRemark: (ticketId: string, remarkId: string, text: string) => void;
  deleteRemark: (ticketId: string, remarkId: string) => void;
  addDocument: (
    ticketId: string,
    document: Omit<UploadedDocument, 'id' | 'uploadedAt' | 'status'>,
  ) => void;
  removeDocument: (ticketId: string, documentId: string) => void;
}

export const useSupportStore = create<SupportStore>(set => ({
  tickets: mockSupportTickets,
  addTicket: payload => {
    const created: SupportTicket = {
      ...payload,
      id: generateId('ticket'),
      createdAt: new Date().toISOString(),
    };

    set(state => ({
      tickets: [created, ...state.tickets],
    }));

    return created;
  },
  updateTicket: (ticketId, updates) =>
    set(state => ({
      tickets: state.tickets.map(item =>
        item.id === ticketId ? {...item, ...updates} : item,
      ),
    })),
  deleteTicket: ticketId =>
    set(state => ({
      tickets: state.tickets.filter(item => item.id !== ticketId),
    })),
  updateTicketStatus: (ticketId, status) =>
    set(state => ({
      tickets: state.tickets.map(item =>
        item.id === ticketId
          ? {
              ...item,
              status,
              history: [
                {
                  id: generateId('support-history'),
                  status,
                  updatedBy: 'Support Team',
                  updatedAt: new Date().toISOString(),
                },
                ...item.history,
              ],
            }
          : item,
      ),
    })),
  addRemark: (ticketId, text, addedBy = 'Support Team') =>
    set(state => ({
      tickets: state.tickets.map(item =>
        item.id === ticketId
          ? {
              ...item,
              remarks: [
                {
                  id: generateId('support-remark'),
                  text,
                  addedBy,
                  date: new Date().toISOString(),
                },
                ...item.remarks,
              ],
            }
          : item,
      ),
    })),
  editRemark: (ticketId, remarkId, text) =>
    set(state => ({
      tickets: state.tickets.map(item =>
        item.id === ticketId
          ? {
              ...item,
              remarks: item.remarks.map(remark =>
                remark.id === remarkId
                  ? {
                      ...remark,
                      text,
                      date: new Date().toISOString(),
                    }
                  : remark,
              ),
            }
          : item,
      ),
    })),
  deleteRemark: (ticketId, remarkId) =>
    set(state => ({
      tickets: state.tickets.map(item =>
        item.id === ticketId
          ? {
              ...item,
              remarks: item.remarks.filter(remark => remark.id !== remarkId),
            }
          : item,
      ),
    })),
  addDocument: (ticketId, document) =>
    set(state => ({
      tickets: state.tickets.map(item =>
        item.id === ticketId
          ? {
              ...item,
              documents: [
                {
                  ...document,
                  id: generateId('support-document'),
                  uploadedAt: new Date().toISOString(),
                  status: 'uploaded',
                },
                ...item.documents,
              ],
            }
          : item,
      ),
    })),
  removeDocument: (ticketId, documentId) =>
    set(state => ({
      tickets: state.tickets.map(item =>
        item.id === ticketId
          ? {
              ...item,
              documents: item.documents.filter(doc => doc.id !== documentId),
            }
          : item,
      ),
    })),
}));
