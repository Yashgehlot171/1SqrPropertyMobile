import {create} from 'zustand';
import * as api from '@/services/constructionApi';
import {useAuthStore} from './authStore';
import {generateId} from '@/services/serviceUtils';
import type {
  ConstructionPackage,
  ConstructionQuote,
  ConstructionRequest,
  DirectoryEntry,
  MaterialBrand,
} from '@/types';

interface ConstructionStore {
  loading: boolean; error: string | null; load: () => Promise<void>;
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
  ) => Promise<ConstructionRequest>;
  deleteRequest: (requestId: string) => void;
  toggleSavedMaterial: (materialId: string) => void;
  toggleSupplierShortlist: (supplierId: string) => void;
  toggleContractorShortlist: (contractorId: string) => void;
}

export const useConstructionStore = create<ConstructionStore>((set, get) => ({
  packages: [], suppliers: [], contractors: [], materials: [], quotes: [], requests: [],
  loading: false, error: null,
  load: async () => {
    if (get().loading) { return; }
    const userId = useAuthStore.getState().user?.id;
    set({loading: true, error: null});
    try {
      const [packages, suppliers, contractors, requests] = await Promise.all([api.getConstructionPackages(), api.getSuppliers(), api.getContractors(), api.getConstructionRequests()]);
      if (userId !== useAuthStore.getState().user?.id) { return; }
      set(state => ({packages, suppliers, contractors, requests: requests.map(item => ({...item, quoteId: state.requests.find(old => old.id === item.id)?.quoteId})), loading: false}));
    } catch (error) { set({loading: false, error: error instanceof Error ? error.message : 'Unable to load construction services.'}); throw error; }
  },
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

    })),
  addRequest: async request => {
    const userId = useAuthStore.getState().user?.id;
    const quote = get().quotes.find(item => item.id === request.quoteId);
    if (!quote) { throw new Error('Calculate an estimate before requesting a quotation.'); }
    const existing = get().requests.find(item => item.quoteId === quote.id);
    if (existing) { return existing; }
    const selected = get().packages.find(item => (item.quality ?? item.name) === quote.quality);
    const created = await api.addConstructionRequest(request, quote, selected?.id);
    if (userId !== useAuthStore.getState().user?.id) { throw new Error('Session changed.'); }
    set(state => ({requests: [created, ...state.requests]}));
    return created;
  },
  deleteRequest: () => { throw new Error('Construction requests cannot be deleted from the app. Contact support.'); },
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

useAuthStore.subscribe((state, previous) => {
  if (state.user?.id !== previous.user?.id || state.isLoggedIn !== previous.isLoggedIn) {
    useConstructionStore.setState({packages: [], suppliers: [], contractors: [], materials: [], quotes: [], requests: [], loading: false, error: null, savedMaterialIds: [], shortlistedSupplierIds: [], shortlistedContractorIds: []});
  }
});
