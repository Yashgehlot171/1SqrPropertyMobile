import {create} from 'zustand';

import {
  mockConstructionPackages,
  mockConstructionQuotes,
  mockConstructionRequests,
  mockContractors,
  mockMaterialBrands,
  mockSuppliers,
} from '@/data/mockConstruction';
import {generateId} from '@/services/serviceUtils';
import type {
  ConstructionPackage,
  ConstructionQuote,
  ConstructionRequest,
  DirectoryEntry,
  MaterialBrand,
} from '@/types';

interface ConstructionStore {
  packages: ConstructionPackage[];
  suppliers: DirectoryEntry[];
  contractors: DirectoryEntry[];
  materials: MaterialBrand[];
  quotes: ConstructionQuote[];
  requests: ConstructionRequest[];
  savedMaterialIds: string[];
  shortlistedSupplierIds: string[];
  shortlistedContractorIds: string[];
  saveQuote: (
    quote: Omit<ConstructionQuote, 'id' | 'createdAt'>,
  ) => ConstructionQuote;
  deleteQuote: (quoteId: string) => void;
  addRequest: (
    request: Omit<ConstructionRequest, 'id' | 'history' | 'remarks'>,
  ) => ConstructionRequest;
  deleteRequest: (requestId: string) => void;
  toggleSavedMaterial: (materialId: string) => void;
  toggleSupplierShortlist: (supplierId: string) => void;
  toggleContractorShortlist: (contractorId: string) => void;
}

export const useConstructionStore = create<ConstructionStore>(set => ({
  packages: mockConstructionPackages,
  suppliers: mockSuppliers,
  contractors: mockContractors,
  materials: mockMaterialBrands,
  quotes: mockConstructionQuotes,
  requests: mockConstructionRequests,
  savedMaterialIds: [],
  shortlistedSupplierIds: [],
  shortlistedContractorIds: [],
  saveQuote: quote => {
    const created: ConstructionQuote = {
      ...quote,
      id: generateId('quote'),
      createdAt: new Date().toISOString(),
    };

    set(state => ({
      quotes: [created, ...state.quotes],
    }));

    return created;
  },
  deleteQuote: quoteId =>
    set(state => ({
      quotes: state.quotes.filter(item => item.id !== quoteId),
      requests: state.requests.filter(item => item.quoteId !== quoteId),
    })),
  addRequest: request => {
    const created: ConstructionRequest = {
      ...request,
      id: generateId('construction-request'),
      remarks: [],
      history: [
        {
          id: generateId('construction-request-history'),
          status: 'Submitted',
          updatedBy: request.customerName,
          updatedAt: new Date().toISOString(),
        },
      ],
    };

    set(state => ({
      requests: [created, ...state.requests],
    }));

    return created;
  },
  deleteRequest: requestId =>
    set(state => ({
      requests: state.requests.filter(item => item.id !== requestId),
    })),
  toggleSavedMaterial: materialId =>
    set(state => ({
      savedMaterialIds: state.savedMaterialIds.includes(materialId)
        ? state.savedMaterialIds.filter(id => id !== materialId)
        : [materialId, ...state.savedMaterialIds],
    })),
  toggleSupplierShortlist: supplierId =>
    set(state => ({
      shortlistedSupplierIds: state.shortlistedSupplierIds.includes(supplierId)
        ? state.shortlistedSupplierIds.filter(id => id !== supplierId)
        : [supplierId, ...state.shortlistedSupplierIds],
    })),
  toggleContractorShortlist: contractorId =>
    set(state => ({
      shortlistedContractorIds: state.shortlistedContractorIds.includes(
        contractorId,
      )
        ? state.shortlistedContractorIds.filter(id => id !== contractorId)
        : [contractorId, ...state.shortlistedContractorIds],
    })),
}));
