import {create} from 'zustand';

import {mockLoanBanks, mockLoanRequests} from '@/data/mockLoans';
import {generateId} from '@/services/serviceUtils';
import type {LoanBank, LoanRequest, LoanStatus, UploadedDocument} from '@/types';

interface LoanStore {
  banks: LoanBank[];
  requests: LoanRequest[];
  addRequest: (payload: Omit<LoanRequest, 'id' | 'createdAt'>) => LoanRequest;
  updateRequest: (requestId: string, updates: Partial<LoanRequest>) => void;
  deleteRequest: (requestId: string) => void;
  updateRequestStatus: (requestId: string, status: LoanStatus) => void;
  addRemark: (requestId: string, text: string, addedBy?: string) => void;
  editRemark: (requestId: string, remarkId: string, text: string) => void;
  deleteRemark: (requestId: string, remarkId: string) => void;
  addDocument: (
    requestId: string,
    document: Omit<UploadedDocument, 'id' | 'uploadedAt' | 'status'>,
  ) => void;
  removeDocument: (requestId: string, documentId: string) => void;
}

export const useLoanStore = create<LoanStore>(set => ({
  banks: mockLoanBanks,
  requests: mockLoanRequests,
  addRequest: payload => {
    const created: LoanRequest = {
      ...payload,
      id: generateId('loan'),
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
                  id: generateId('loan-history'),
                  status,
                  updatedBy: 'Finance Team',
                  updatedAt: new Date().toISOString(),
                },
                ...item.history,
              ],
            }
          : item,
      ),
    })),
  addRemark: (requestId, text, addedBy = 'Finance Team') =>
    set(state => ({
      requests: state.requests.map(item =>
        item.id === requestId
          ? {
              ...item,
              remarks: [
                {
                  id: generateId('loan-remark'),
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

        const remarks = item.remarks.map(remark =>
          remark.id === remarkId
            ? {
                ...remark,
                text,
                date: new Date().toISOString(),
              }
            : remark,
        );

        return {
          ...item,
          remarks,
        };
      }),
    })),
  deleteRemark: (requestId, remarkId) =>
    set(state => ({
      requests: state.requests.map(item => {
        if (item.id !== requestId) {
          return item;
        }

        return {
          ...item,
          remarks: item.remarks.filter(remark => remark.id !== remarkId),
        };
      }),
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
                  id: generateId('loan-document'),
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
