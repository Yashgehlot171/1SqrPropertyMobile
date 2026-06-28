import {create} from 'zustand';

interface SavedStore {
  favouriteIds: string[];
  interestedIds: string[];
  contactedIds: string[];
  recentlyViewedIds: string[];
  toggleFavourite: (propertyId: string) => void;
  markInterested: (propertyId: string) => void;
  markContacted: (propertyId: string) => void;
  addRecentlyViewed: (propertyId: string) => void;
  removeInterested: (propertyId: string) => void;
  removeContacted: (propertyId: string) => void;
  removeRecentlyViewed: (propertyId: string) => void;
  clearRecentlyViewed: () => void;
}

export const useSavedStore = create<SavedStore>(set => ({
  favouriteIds: ['property-1', 'property-7'],
  interestedIds: ['property-2'],
  contactedIds: ['property-3'],
  recentlyViewedIds: ['property-1', 'property-2', 'property-10'],
  toggleFavourite: propertyId =>
    set(state => ({
      favouriteIds: state.favouriteIds.includes(propertyId)
        ? state.favouriteIds.filter(id => id !== propertyId)
        : [propertyId, ...state.favouriteIds],
    })),
  markInterested: propertyId =>
    set(state => ({
      interestedIds: state.interestedIds.includes(propertyId)
        ? state.interestedIds
        : [propertyId, ...state.interestedIds],
    })),
  markContacted: propertyId =>
    set(state => ({
      contactedIds: state.contactedIds.includes(propertyId)
        ? state.contactedIds
        : [propertyId, ...state.contactedIds],
    })),
  addRecentlyViewed: propertyId =>
    set(state => ({
      recentlyViewedIds: [propertyId, ...state.recentlyViewedIds.filter(id => id !== propertyId)].slice(
        0,
        10,
      ),
    })),
  removeInterested: propertyId =>
    set(state => ({
      interestedIds: state.interestedIds.filter(id => id !== propertyId),
    })),
  removeContacted: propertyId =>
    set(state => ({
      contactedIds: state.contactedIds.filter(id => id !== propertyId),
    })),
  removeRecentlyViewed: propertyId =>
    set(state => ({
      recentlyViewedIds: state.recentlyViewedIds.filter(id => id !== propertyId),
    })),
  clearRecentlyViewed: () => set({recentlyViewedIds: []}),
}));
