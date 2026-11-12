import {create} from 'zustand';
import * as api from '@/services/legalApi';
import {useAuthStore} from './authStore';
import type {LegalRequest, LegalStatus, UploadedDocument, LegalTeam} from '@/types';

interface LegalStore {
  requests: LegalRequest[];
  teams: LegalTeam[];
  loading: boolean;
  error: string | null;
  load: () => Promise<void>;
  addRequest: (payload: Omit<LegalRequest, 'id' | 'createdAt'>) => Promise<LegalRequest>;
  updateRequest: (id: string, payload: Partial<LegalRequest>) => Promise<void>;
  deleteRequest: (id: string) => Promise<void>;
  updateRequestStatus: (id: string, status: LegalStatus, remark?: string) => Promise<void>;
  addRemark: (id: string, text: string) => Promise<void>;
  editRemark: (id: string, remarkId: string, text: string) => Promise<void>;
  deleteRemark: (id: string, remarkId: string) => Promise<void>;
  addDocument: (id: string, document: UploadedDocument) => Promise<void>;
  removeDocument: (id: string, documentId: string) => Promise<void>;
}
let epoch = 0;
const unsupported = async () => { throw new Error('This action is not available.'); };
export const useLegalStore = create<LegalStore>((set, get) => {
  const replace = (item: LegalRequest) => set(state => ({requests: state.requests.some(row => row.id === item.id)
    ? state.requests.map(row => row.id === item.id ? item : row) : [item, ...state.requests]}));
  const commit = async <T,>(work: () => Promise<T>, apply: (value: T) => void): Promise<T> => {
    const started = epoch;
    const value = await work();
    if (started !== epoch) { throw new Error('Your session changed. Please try again.'); }
    apply(value);
    return value;
  };
  return {
    requests: [], teams: [], loading: false, error: null,
    load: async () => {
      if (get().loading) { return; }
      const started = epoch;
      set({loading: true, error: null});
      try {
        const [items, options] = await Promise.all([api.getLegalRequests(), api.getLegalTeams()]);
        if (started === epoch) { set({requests: items, teams: options, loading: false}); }
      } catch (error) {
        if (started === epoch) { set({loading: false, error: error instanceof Error ? error.message : 'Unable to load data.'}); }
        throw error;
      }
    },
    addRequest: payload => commit(() => api.addLegalRequest(payload), replace),
    updateRequest: async (id, payload) => { await commit(() => api.updateLegalRequest(id, payload), replace); },
    deleteRequest: async id => { await commit(() => api.deleteLegalRequest(id), () => set(state => ({requests: state.requests.filter(row => row.id !== id)}))); },
    updateRequestStatus: unsupported,
    addRemark: async (id, text) => { await commit(() => api.addLegalRemark(id, text), replace); },
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
    useLegalStore.setState({requests: [], teams: [], loading: false, error: null});
  }
});
