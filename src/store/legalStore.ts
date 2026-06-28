import {create} from 'zustand';

import {mockLegalRequests, mockLegalTeams} from '@/data/mockLegal';
import {generateId} from '@/services/serviceUtils';
import type {
  LegalRequest,
  LegalStatus,
  LegalTeam,
  UploadedDocument,
} from '@/types';

interface LegalStore {
  teams: LegalTeam[];
  requests: LegalRequest[];
  addRequest: (payload: Omit<LegalRequest, 'id' | 'createdAt'>) => LegalRequest;
  updateRequest: (requestId: string, updates: Partial<LegalRequest>) => void;
  deleteRequest: (requestId: string) => void;
  updateRequestStatus: (requestId: string, status: LegalStatus) => void;
  addRemark: (requestId: string, text: string, addedBy?: string) => void;
  editRemark: (requestId: string, remarkId: string, text: string) => void;
  deleteRemark: (requestId: string, remarkId: string) => void;
  addDocument: (
    requestId: string,
    document: Omit<UploadedDocument, 'id' | 'uploadedAt' | 'status'>,
  ) => void;
  removeDocument: (requestId: string, documentId: string) => void;
}

export const useLegalStore = create<LegalStore>(set => ({
  teams: mockLegalTeams,
  requests: mockLegalRequests,
  addRequest: payload => {
    const created: LegalRequest = {
      ...payload,
      id: generateId('legal'),
      createdAt: new Date().toISOString(),
    };

    set(state => ({
      requests: [created, ...state.requests],
    }));

    return created;
  },
  updateRequest: (requestId, updates) =>
    set(state => ({
      requests: state.requests.map(item =>
        item.id === requestId ? {...item, ...updates} : item,
      ),
    })),
  deleteRequest: requestId =>
    set(state => ({
      requests: state.requests.filter(item => item.id !== requestId),
    })),
  updateRequestStatus: (requestId, status) =>
    set(state => ({
      requests: state.requests.map(item =>
        item.id === requestId
          ? {
              ...item,
              status,
              history: [
                {
                  id: generateId('legal-history'),
                  status,
                  updatedBy: 'Legal Team',
                  updatedAt: new Date().toISOString(),
                },
                ...item.history,
              ],
            }
          : item,
      ),
    })),
  addRemark: (requestId, text, addedBy = 'Legal Team') =>
    set(state => ({
      requests: state.requests.map(item =>
        item.id === requestId
          ? {
              ...item,
              remarks: [
                {
                  id: generateId('legal-remark'),
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
  editRemark: (requestId, remarkId, text) =>
    set(state => ({
      requests: state.requests.map(item => {
        if (item.id !== requestId) {
          return item;
        }

        return {
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
        };
      }),
    })),
  deleteRemark: (requestId, remarkId) =>
    set(state => ({
      requests: state.requests.map(item =>
        item.id === requestId
          ? {
              ...item,
              remarks: item.remarks.filter(remark => remark.id !== remarkId),
            }
          : item,
      ),
    })),
  addDocument: (requestId, document) =>
    set(state => ({
      requests: state.requests.map(item =>
        item.id === requestId
          ? {
              ...item,
              documents: [
                {
                  ...document,
                  id: generateId('legal-document'),
                  uploadedAt: new Date().toISOString(),
                  status: 'uploaded',
                },
                ...item.documents,
              ],
            }
          : item,
      ),
    })),
  removeDocument: (requestId, documentId) =>
    set(state => ({
      requests: state.requests.map(item =>
        item.id === requestId
          ? {
              ...item,
              documents: item.documents.filter(doc => doc.id !== documentId),
            }
          : item,
      ),
    })),
}));
