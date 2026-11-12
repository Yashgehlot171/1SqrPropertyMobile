import {create} from 'zustand';
import * as api from '@/services/supportApi';
import {useAuthStore} from './authStore';
import type {SupportTicket, SupportTicketStatus, UploadedDocument} from '@/types';

interface SupportStore {
  tickets: SupportTicket[];
  categories: {id: number; name: string}[];
  loading: boolean;
  error: string | null;
  load: () => Promise<void>;
  addTicket: (payload: Omit<SupportTicket, 'id' | 'createdAt'>) => Promise<SupportTicket>;
  updateTicket: (id: string, payload: Partial<SupportTicket>) => Promise<void>;
  deleteTicket: (id: string) => Promise<void>;
  updateTicketStatus: (id: string, status: SupportTicketStatus, remark?: string) => Promise<void>;
  addRemark: (id: string, text: string) => Promise<void>;
  editRemark: (id: string, remarkId: string, text: string) => Promise<void>;
  deleteRemark: (id: string, remarkId: string) => Promise<void>;
  addDocument: (id: string, document: UploadedDocument) => Promise<void>;
  removeDocument: (id: string, documentId: string) => Promise<void>;
}
let epoch = 0;
const unsupported = async () => { throw new Error('This action is not available.'); };
export const useSupportStore = create<SupportStore>((set, get) => {
  const replace = (item: SupportTicket) => set(state => ({tickets: state.tickets.some(row => row.id === item.id)
    ? state.tickets.map(row => row.id === item.id ? item : row) : [item, ...state.tickets]}));
  const commit = async <T,>(work: () => Promise<T>, apply: (value: T) => void): Promise<T> => {
    const started = epoch;
    const value = await work();
    if (started !== epoch) { throw new Error('Your session changed. Please try again.'); }
    apply(value);
    return value;
  };
  return {
    tickets: [], categories: [], loading: false, error: null,
    load: async () => {
      if (get().loading) { return; }
      const started = epoch;
      set({loading: true, error: null});
      try {
        const [items, options] = await Promise.all([api.getSupportTickets(), api.getSupportCategories()]);
        if (started === epoch) { set({tickets: items, categories: options, loading: false}); }
      } catch (error) {
        if (started === epoch) { set({loading: false, error: error instanceof Error ? error.message : 'Unable to load data.'}); }
        throw error;
      }
    },
    addTicket: payload => commit(() => api.addSupportTicket(payload), replace),
    updateTicket: async (id, payload) => { await commit(() => api.updateSupportTicket(id, payload), replace); },
    deleteTicket: async id => { await commit(() => api.deleteSupportTicket(id), () => set(state => ({tickets: state.tickets.filter(row => row.id !== id)}))); },
    updateTicketStatus: async (id, status, remark) => { await commit(() => api.updateSupportStatus(id, status, remark), replace); },
    addRemark: async (id, text) => { await commit(() => api.addSupportRemark(id, text), replace); },
    editRemark: unsupported, deleteRemark: unsupported,
    addDocument: async (id, document) => {
      const item = get().tickets.find(row => row.id === id);
      if (!item) { throw new Error('Request no longer available.'); }
      await get().updateTicket(id, {documents: [...item.documents, document]});
    },
    removeDocument: async (id, documentId) => {
      const item = get().tickets.find(row => row.id === id);
      if (!item) { throw new Error('Request no longer available.'); }
      await get().updateTicket(id, {documents: item.documents.filter(doc => doc.id !== documentId)});
    },
  };
});
useAuthStore.subscribe((state, previous) => {
  if (state.user?.id !== previous.user?.id || state.isLoggedIn !== previous.isLoggedIn) {
    epoch += 1;
    useSupportStore.setState({tickets: [], categories: [], loading: false, error: null});
  }
});
