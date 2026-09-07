import {create} from 'zustand';

import {showApiError} from '@/api';
import {getSavedProperties, saveProperty, unsaveProperty} from '@/services/propertyApi';

interface SavedStore {
  favouriteIds: string[];
  interestedIds: string[];
  contactedIds: string[];
  recentlyViewedIds: string[];
  // propertyIds with an in-flight toggleFavourite() call (optimistic set applied,
  // POST/DELETE not yet settled). Guards against a second tap on the same property
  // racing the first tap's network call — see toggleFavourite. Consumers may read
  // this to show a disabled/busy heart icon while a toggle is pending.
  pendingIds: Set<string>;
  // Single, real API-backed source of truth for "is property X saved" — every
  // consumer (PropertyDetailScreen's main heart icon and related-properties list,
  // PropertyListingScreen's search results, SavedPropertiesScreen's Favourite tab)
  // reads `favouriteIds` and calls this same action, so they stay in sync by
  // construction instead of each keeping (and risking diverging) its own copy.
  // Applies an optimistic update immediately, then calls the real
  // POST/DELETE /properties/:propertyId/save endpoint; rolls the optimistic update
  // back and surfaces the failure via showApiError if the call throws.
  // While a call for a given propertyId is in flight, a second call for the SAME
  // propertyId is ignored (no-op) rather than allowed to race the first — see
  // pendingIds. This is a deliberate no-op-while-pending choice over queuing: a
  // heart-tap toggle is a quick, low-stakes interaction, not a critical multi-step
  // flow, so silently ignoring an impatient double-tap (the pending call will
  // settle to the correct state a moment later) is simpler and sufficient; queuing
  // a second flip would add complexity for a UX difference nobody is likely to
  // notice in a sub-second window.
  toggleFavourite: (propertyId: string) => Promise<void>;
  // Hydrates favouriteIds from GET /me/saved-properties (sub-piece 3a's
  // getSavedProperties()). Intended to run once when a logged-in user enters the
  // Main app — see MainTabNavigator's mount effect.
  hydrateFavourites: () => Promise<void>;
  markInterested: (propertyId: string) => void;
  markContacted: (propertyId: string) => void;
  addRecentlyViewed: (propertyId: string) => void;
  removeInterested: (propertyId: string) => void;
  removeContacted: (propertyId: string) => void;
  removeRecentlyViewed: (propertyId: string) => void;
  clearRecentlyViewed: () => void;
}

export const useSavedStore = create<SavedStore>((set, get) => ({
  // Starts empty rather than mock-seeded: favouriteIds is now real, backend-derived
  // state populated by hydrateFavourites() once the user is logged in, not a local
  // mock list.
  favouriteIds: [],
  pendingIds: new Set<string>(),
  interestedIds: ['property-2'],
  contactedIds: ['property-3'],
  recentlyViewedIds: ['property-1', 'property-2', 'property-10'],
  toggleFavourite: async propertyId => {
    // Ignore a second call for the same propertyId while one is already in
    // flight, rather than letting it race the first (see interface comment).
    if (get().pendingIds.has(propertyId)) {
      return;
    }

    const wasSaved = get().favouriteIds.includes(propertyId);

    // Mark pending, then apply the optimistic update immediately, before the
    // network call resolves.
    set(state => ({
      pendingIds: new Set(state.pendingIds).add(propertyId),
      favouriteIds: wasSaved
        ? state.favouriteIds.filter(id => id !== propertyId)
        : [propertyId, ...state.favouriteIds],
    }));

    try {
      if (wasSaved) {
        await unsaveProperty(propertyId);
      } else {
        await saveProperty(propertyId);
      }
    } catch (error) {
      // Roll back to the pre-toggle state and surface the failure.
      set(state => ({
        favouriteIds: wasSaved
          ? [propertyId, ...state.favouriteIds]
          : state.favouriteIds.filter(id => id !== propertyId),
      }));
      showApiError(error);
    } finally {
      // Clear pending regardless of outcome so the id is never stuck.
      set(state => {
        const nextPending = new Set(state.pendingIds);
        nextPending.delete(propertyId);
        return {pendingIds: nextPending};
      });
    }
  },
  hydrateFavourites: async () => {
    try {
      const properties = await getSavedProperties();
      set({favouriteIds: properties.map(property => property.id)});
    } catch (error) {
      showApiError(error);
    }
  },
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
