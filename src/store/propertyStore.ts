import {create} from 'zustand';

import {primaryProfile} from '@/data/mockUsers';
import {getPropertyById} from '@/services/propertyApi';
import {generateId} from '@/services/serviceUtils';
import {useAuthStore} from '@/store/authStore';
import type {
  LocationInfo,
  Property,
  PropertyDraftState,
  PropertyFilterState,
  PropertyLifecycleStatus,
  PropertyMedia,
  UploadedDocument,
  UserSummary,
} from '@/types';

import {mockProperties} from '@/data/mockProperties';

function getCurrentOwner(): UserSummary {
  const currentUser = useAuthStore.getState().user ?? primaryProfile;

  return {
    id: currentUser.id,
    name: currentUser.name,
    mobile: currentUser.mobile,
    email: currentUser.email,
    role: currentUser.role,
    city: currentUser.city,
    avatar: currentUser.avatar,
  };
}

function createDefaultDraft(): PropertyDraftState {
  const owner = getCurrentOwner();

  return {
    title: '',
    description: '',
    price: 0,
    areaSqFt: 0,
    propertyType: 'Plot',
    category: 'All',
    listingType: 'Sell',
    bhk: '',
    facing: '',
    roadWidthFt: undefined,
    furnishing: '',
    constructionYear: undefined,
    floorNumber: undefined,
    totalFloors: undefined,
    readyState: 'Resale',
    status: 'Draft',
    amenities: [],
    verified: false,
    ownerType: owner.role === 'broker' ? 'Broker' : 'Owner',
    owner,
    location: {
      city: owner.city,
      state: 'Uttar Pradesh',
      district: '',
      area: '',
      address: '',
      pincode: '',
    },
    media: [],
    documents: [],
    featured: false,
  };
}

function toDraft(property: Property): PropertyDraftState {
  return {
    ...property,
    tempId: property.id,
  };
}

function finalizeProperty(
  payload: PropertyDraftState,
  existing?: Property,
  status?: PropertyLifecycleStatus,
): Property {
  const now = new Date().toISOString();
  const owner = getCurrentOwner();

  return {
    ...payload,
    id: existing?.id ?? payload.tempId ?? generateId('property'),
    status: status ?? payload.status,
    owner,
    ownerType: owner.role === 'broker' ? 'Broker' : 'Owner',
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
}

interface PropertyStore {
  properties: Property[];
  filters: Partial<PropertyFilterState>;
  editorDraft: PropertyDraftState | null;
  editorPropertyId?: string;
  setProperties: (properties: Property[]) => void;
  setFilters: (filters: Partial<PropertyFilterState>) => void;
  upsertProperty: (property: Property) => void;
  removeProperty: (propertyId: string) => void;
  changePropertyStatus: (
    propertyId: string,
    status: PropertyLifecycleStatus,
  ) => void;
  initializeDraft: (propertyId?: string, property?: Property) => void;
  setEditorProperty: (property: Property) => void;
  updateDraft: (updates: Partial<PropertyDraftState>) => void;
  updateDraftLocation: (location: Partial<LocationInfo>) => void;
  clearDraft: () => void;
  saveDraft: () => Property | undefined;
  submitDraft: () => Property | undefined;
  addDraftDocument: (document: UploadedDocument) => void;
  removeDraftDocument: (documentId: string) => void;
  addDraftMedia: (media: PropertyMedia) => void;
  addDraftMediaBatch: (media: PropertyMedia[]) => void;
  removeDraftMedia: (mediaId: string) => void;
}

export const usePropertyStore = create<PropertyStore>((set, get) => ({
  properties: mockProperties,
  filters: {},
  editorDraft: null,
  editorPropertyId: undefined,
  setProperties: properties => set({properties}),
  setFilters: filters => set({filters}),
  upsertProperty: property =>
    set(state => ({
      properties: state.properties.some(item => item.id === property.id)
        ? state.properties.map(item => (item.id === property.id ? property : item))
        : [property, ...state.properties],
    })),
  removeProperty: propertyId =>
    set(state => ({
      properties: state.properties.filter(item => item.id !== propertyId),
      editorPropertyId:
        state.editorPropertyId === propertyId ? undefined : state.editorPropertyId,
      editorDraft:
        state.editorPropertyId === propertyId ? null : state.editorDraft,
    })),
  changePropertyStatus: (propertyId, status) =>
    set(state => ({
      properties: state.properties.map(item =>
        item.id === propertyId
          ? {...item, status, updatedAt: new Date().toISOString()}
          : item,
      ),
    })),
  // `property`, when supplied, is a real backend property already fetched by the
  // caller (e.g. MyPropertiesScreen's edit entry point, which lists via
  // getMyProperties() and hands the exact row the user tapped) — it is used
  // directly, synchronously, with no re-fetch.
  //
  // Without it, `propertyId` is first looked up against the in-memory mock
  // `properties` array (back-compat for any caller still working off mock data).
  // A real backend property id will never match there, so — rather than the old
  // behavior of silently falling back to a blank draft — it is fetched for real
  // via getPropertyById and applied once it resolves. `editorPropertyId` is set
  // immediately (before the fetch resolves) so a superseded/duplicate call can be
  // detected and ignored, and so dependent screens' `!== editorPropertyId` guard
  // doesn't re-trigger this on every render while the fetch is in flight.
  initializeDraft: (propertyId, property) => {
    if (!propertyId) {
      set({editorDraft: createDefaultDraft(), editorPropertyId: undefined});
      return;
    }

    if (property) {
      set({editorDraft: toDraft(property), editorPropertyId: property.id});
      return;
    }

    const local = get().properties.find(item => item.id === propertyId);
    if (local) {
      set({editorDraft: toDraft(local), editorPropertyId: local.id});
      return;
    }

    set({editorPropertyId: propertyId});
    getPropertyById(propertyId)
      .then(remote => {
        if (get().editorPropertyId !== propertyId) {
          return;
        }
        if (remote) {
          set({editorDraft: toDraft(remote), editorPropertyId: remote.id});
        } else {
          set({editorDraft: createDefaultDraft(), editorPropertyId: undefined});
        }
      })
      .catch(error => {
        console.warn('initializeDraft: failed to load property', error);
        if (get().editorPropertyId === propertyId) {
          set({editorDraft: createDefaultDraft(), editorPropertyId: undefined});
        }
      });
  },
  // Used after a real addProperty()/updateProperty() call succeeds, to point the
  // in-progress editor at the real backend id it now has (a brand-new draft has
  // none until the first successful save) without disturbing the rest of the
  // draft's in-progress form state.
  setEditorProperty: property =>
    set({editorDraft: toDraft(property), editorPropertyId: property.id}),
  updateDraft: updates =>
    set(state => ({
      editorDraft: state.editorDraft
        ? {
            ...state.editorDraft,
            ...updates,
            location: updates.location
              ? {
                  ...state.editorDraft.location,
                  ...updates.location,
                }
              : state.editorDraft.location,
          }
        : state.editorDraft,
    })),
  updateDraftLocation: location =>
    set(state => ({
      editorDraft: state.editorDraft
        ? {
            ...state.editorDraft,
            location: {
              ...state.editorDraft.location,
              ...location,
            },
          }
        : state.editorDraft,
    })),
  clearDraft: () => set({editorDraft: null, editorPropertyId: undefined}),
  saveDraft: () => {
    const {editorDraft, editorPropertyId, properties} = get();
    if (!editorDraft) {
      return undefined;
    }

    const existing = editorPropertyId
      ? properties.find(item => item.id === editorPropertyId)
      : undefined;
    const property = finalizeProperty(
      {
        ...editorDraft,
        status: 'Draft',
      },
      existing,
      'Draft',
    );

    get().upsertProperty(property);
    set({
      editorPropertyId: property.id,
      editorDraft: {
        ...editorDraft,
        tempId: property.id,
        status: 'Draft',
      },
    });

    return property;
  },
  submitDraft: () => {
    const {editorDraft, editorPropertyId, properties} = get();
    if (!editorDraft) {
      return undefined;
    }

    const existing = editorPropertyId
      ? properties.find(item => item.id === editorPropertyId)
      : undefined;
    const nextStatus: PropertyLifecycleStatus =
      existing && existing.status !== 'Draft' ? existing.status : 'Active';
    const property = finalizeProperty(
      {
        ...editorDraft,
        status: nextStatus,
      },
      existing,
      nextStatus,
    );

    get().upsertProperty(property);
    set({editorDraft: null, editorPropertyId: undefined});

    return property;
  },
  addDraftDocument: document =>
    set(state => ({
      editorDraft: state.editorDraft
        ? {
            ...state.editorDraft,
            documents: [document, ...state.editorDraft.documents],
          }
        : state.editorDraft,
    })),
  removeDraftDocument: documentId =>
    set(state => ({
      editorDraft: state.editorDraft
        ? {
            ...state.editorDraft,
            documents: state.editorDraft.documents.filter(
              item => item.id !== documentId,
            ),
          }
        : state.editorDraft,
    })),
  addDraftMedia: media =>
    set(state => ({
      editorDraft: state.editorDraft
        ? {
            ...state.editorDraft,
            media: [media, ...state.editorDraft.media],
          }
        : state.editorDraft,
    })),
  addDraftMediaBatch: media =>
    set(state => ({
      editorDraft: state.editorDraft
        ? {
            ...state.editorDraft,
            media: [...state.editorDraft.media, ...media],
          }
        : state.editorDraft,
    })),
  removeDraftMedia: mediaId =>
    set(state => ({
      editorDraft: state.editorDraft
        ? {
            ...state.editorDraft,
            media: state.editorDraft.media.filter(item => item.id !== mediaId),
          }
        : state.editorDraft,
    })),
}));
