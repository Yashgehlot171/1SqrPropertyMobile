import {create} from 'zustand';
import * as api from '@/services/loanApi';
import {useAuthStore} from './authStore';
import type {LoanRequest, LoanStatus, UploadedDocument, LoanBank} from '@/types';

interface LoanStore {
  requests: LoanRequest[];
  banks: LoanBank[];
  loading: boolean;
  error: string | null;
  load: () => Promise<void>;
  addRequest: (payload: Omit<LoanRequest, 'id' | 'createdAt'>) => Promise<LoanRequest>;
  updateRequest: (id: string, payload: Partial<LoanRequest>) => Promise<void>;
  deleteRequest: (id: string) => Promise<void>;
  updateRequestStatus: (id: string, status: LoanStatus, remark?: string) => Promise<void>;
  addRemark: (id: string, text: string) => Promise<void>;
  editRemark: (id: string, remarkId: string, text: string) => Promise<void>;
  deleteRemark: (id: string, remarkId: string) => Promise<void>;
  addDocument: (id: string, document: UploadedDocument) => Promise<void>;
  removeDocument: (id: string, documentId: string) => Promise<void>;
}
let epoch = 0;
const unsupported = async () => { throw new Error('This action is not available.'); };
export const useLoanStore = create<LoanStore>((set, get) => {
  const replace = (item: LoanRequest) => set(state => ({requests: state.requests.some(row => row.id === item.id)
    ? state.requests.map(row => row.id === item.id ? item : row) : [item, ...state.requests]}));
  const commit = async <T,>(work: () => Promise<T>, apply: (value: T) => void): Promise<T> => {
    const started = epoch;
    const value = await work();
    if (started !== epoch) { throw new Error('Your session changed. Please try again.'); }
    apply(value);
    return value;
  };
  return {
    requests: [], banks: [], loading: false, error: null,
    load: async () => {
      if (get().loading) { return; }
      const started = epoch;
      set({loading: true, error: null});
      try {
        const [items, options] = await Promise.all([api.getLoanRequests(), api.getLoanBanks()]);
        if (started === epoch) { set({requests: items, banks: options, loading: false}); }
      } catch (error) {
        if (started === epoch) { set({loading: false, error: error instanceof Error ? error.message : 'Unable to load data.'}); }
        throw error;
      }
    },
    addRequest: payload => commit(() => api.addLoanRequest(payload), replace),
    updateRequest: async (id, payload) => { await commit(() => api.updateLoanRequest(id, payload), replace); },
    deleteRequest: async id => { await commit(() => api.deleteLoanRequest(id), () => set(state => ({requests: state.requests.filter(row => row.id !== id)}))); },
    updateRequestStatus: unsupported,
    addRemark: async (id, text) => { await commit(() => api.addLoanRemark(id, text), replace); },
    editRemark: unsupported, deleteRemark: unsupported,
    addDocument: async (id, document) => {
      const item = get().requests.find(row => row.id === id);
      if (!item) { throw new Error('Request no longer available.'); }
      await get().updateRequest(id, {documents: [...item.documents, document]});
    },
    removeDocument: async (id, documentId) => {
      const item = get().requests.find(row => row.id === id);
      if (!item) { throw new Error('Request no longer available.'); }
      await get().updateRequest(id, {documents: item.documents.filter(doc => doc.id !== documentId)});
    },
  };
});
useAuthStore.subscribe((state, previous) => {
  if (state.user?.id !== previous.user?.id || state.isLoggedIn !== previous.isLoggedIn) {
    epoch += 1;
    useLoanStore.setState({requests: [], banks: [], loading: false, error: null});
  }
});
