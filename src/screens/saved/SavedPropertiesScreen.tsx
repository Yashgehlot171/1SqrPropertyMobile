import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';

import { showApiError } from '@/api';
import { CompactPropertyCard, EmptyState } from '@/components';
import { ROUTES } from '@/constants/routes';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { typography } from '@/constants/typography';
import { getRecentProperties, getSavedProperties } from '@/services/propertyApi';
import { usePropertyStore } from '@/store/propertyStore';
import { useSavedStore } from '@/store/savedStore';
import type { Property, SavedStackParamList } from '@/types';
import {
  callPropertyOwner,
  openWhatsAppForProperty,
  shareProperty,
} from '@/utils/propertyActions';
import { showToast } from '@/utils/toast';

type Props = NativeStackScreenProps<SavedStackParamList, 'SavedProperties'>;

type SavedTab = 'Favourite' | 'Interested' | 'Contacted' | 'Recently Viewed';

const tabs: SavedTab[] = [
  'Favourite',
  'Interested',
  'Contacted',
  'Recently Viewed',
];

const tabLabels: Record<SavedTab, string> = {
  Favourite: 'Favourite',
  Interested: 'Interested',
  Contacted: 'Contacted',
  'Recently Viewed': 'Viewed',
};

export function SavedPropertiesScreen({ navigation }: Props) {
  const stackNavigation = navigation as any;
  const tabNavigation = navigation.getParent<any>();
  const [activeTab, setActiveTab] = useState<SavedTab>('Favourite');
  const properties = usePropertyStore(state => state.properties);
  const {
    favouriteIds,
    interestedIds,
    contactedIds,
    recentlyViewedIds,
    toggleFavourite,
    markInterested,
    markContacted,
    removeInterested,
    removeContacted,
    removeRecentlyViewed,
    clearRecentlyViewed,
  } = useSavedStore();

  const activeIds = useMemo(() => {
    switch (activeTab) {
      case 'Interested':
        return interestedIds;
      case 'Contacted':
        return contactedIds;
      default:
        return [];
    }
  }, [activeTab, contactedIds, interestedIds]);

  // 'Favourite' and 'Recently Viewed' are backed by GET /me/saved-properties and
  // GET /me/recent-properties (real data). 'Interested'/'Contacted' have no backend
  // list endpoint at all, so they keep reading from useSavedStore's local
  // interestedIds/contactedIds against the mock propertyStore, unchanged.
  const [favouriteProperties, setFavouriteProperties] = useState<Property[]>([]);
  const [isFavouriteLoading, setIsFavouriteLoading] = useState(true);
  const [favouriteError, setFavouriteError] = useState<string | null>(null);

  const [recentProperties, setRecentProperties] = useState<Property[]>([]);
  const [isRecentLoading, setIsRecentLoading] = useState(true);
  const [recentError, setRecentError] = useState<string | null>(null);

  const loadFavourites = useCallback(async () => {
    setIsFavouriteLoading(true);
    setFavouriteError(null);
    try {
      setFavouriteProperties(await getSavedProperties());
    } catch (error) {
      showApiError(error);
      setFavouriteError('Unable to load favourites right now.');
    } finally {
      setIsFavouriteLoading(false);
    }
  }, []);

  const loadRecentlyViewed = useCallback(async () => {
    setIsRecentLoading(true);
    setRecentError(null);
    try {
      setRecentProperties(await getRecentProperties());
    } catch (error) {
      showApiError(error);
      setRecentError('Unable to load recently viewed properties right now.');
    } finally {
      setIsRecentLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFavourites();
    loadRecentlyViewed();
  }, [loadFavourites, loadRecentlyViewed]);

  const isRealDataTab = activeTab === 'Favourite' || activeTab === 'Recently Viewed';
  const isActiveTabLoading =
    (activeTab === 'Favourite' && isFavouriteLoading) ||
    (activeTab === 'Recently Viewed' && isRecentLoading);
  const activeTabError =
    activeTab === 'Favourite'
      ? favouriteError
      : activeTab === 'Recently Viewed'
        ? recentError
        : null;
  const retryActiveTab =
    activeTab === 'Favourite' ? loadFavourites : loadRecentlyViewed;

  const listedProperties = useMemo(() => {
    if (activeTab === 'Favourite') {
      return favouriteProperties;
    }
    if (activeTab === 'Recently Viewed') {
      return recentProperties;
    }
    return activeIds
      .map(id => properties.find(item => item.id === id))
      .filter((item): item is (typeof properties)[number] => Boolean(item));
  }, [activeIds, activeTab, favouriteProperties, properties, recentProperties]);

  // isSaved source of truth: on the 'Favourite' tab every card came from the real
  // GET /me/saved-properties fetch by definition, so it's always true there
  // (unless/until the store's real favouriteIds — kept in sync by the same
  // toggleFavourite this screen and every other consumer share — says otherwise
  // after a remove).
  //
  // On every OTHER tab, `onToggleSave` below goes through the same real,
  // API-backed `toggleFavourite` (savedStore), so `favouriteIds` is the correct
  // thing to read there too — it is the single source of truth for "is this
  // property saved" across the whole app now, not a per-tab mock array.
  const isPropertySaved = useCallback(
    (property: Property) => favouriteIds.includes(property.id),
    [favouriteIds],
  );

  const removeFromCurrentBucket = async (propertyId: string) => {
    if (activeTab === 'Favourite') {
      // Routes through the same real, store-backed toggle every other consumer
      // uses (savedStore.toggleFavourite -> real DELETE /properties/:propertyId/
      // save), rather than only trimming the locally-displayed list. toggleFavourite
      // applies its own optimistic update to favouriteIds and rolls it back (plus
      // surfaces the failure via showApiError) if the call fails, so this only
      // mirrors that outcome into the locally-fetched favouriteProperties list —
      // and only once the toggle is confirmed to have actually removed it (i.e.
      // not rolled back), keeping favouriteIds and favouriteProperties consistent.
      await toggleFavourite(propertyId);
      if (!useSavedStore.getState().favouriteIds.includes(propertyId)) {
        setFavouriteProperties(current =>
          current.filter(item => item.id !== propertyId),
        );
      }
      return;
    }
    if (activeTab === 'Interested') {
      removeInterested(propertyId);
      return;
    }
    if (activeTab === 'Contacted') {
      removeContacted(propertyId);
      return;
    }
    removeRecentlyViewed(propertyId);
    setRecentProperties(current => current.filter(item => item.id !== propertyId));
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable style={styles.headerButton}>
          <Icon color={colors.textPrimary} name="chevron-back" size={22} />
        </Pressable>
        <Text style={styles.headerTitle}>Saved Properties</Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.tabRow}>
            {tabs.map(tab => (
              <Pressable
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={[
                  styles.tabChip,
                  activeTab === tab ? styles.tabChipSelected : null,
                ]}
              >
                <Text
                  style={[
                    styles.tabLabel,
                    activeTab === tab ? styles.tabLabelSelected : null,
                  ]}
                >
                  {tabLabels[tab]}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        <View style={styles.statsRow}>
          <SavedStat label="Saved" value={favouriteProperties.length} />
          <SavedStat label="Contacted" value={contactedIds.length} />
          <SavedStat label="Recently Viewed" value={recentlyViewedIds.length} />
        </View>

        {activeTab === 'Recently Viewed' && recentProperties.length ? (
          <Pressable
            onPress={() => {
              clearRecentlyViewed();
              setRecentProperties([]);
            }}
            style={styles.clearRecent}
          >
            <Text style={styles.clearRecentText}>Clear Recently Viewed</Text>
          </Pressable>
        ) : null}

        {isRealDataTab && isActiveTabLoading && !listedProperties.length ? (
          <View style={styles.centerState}>
            <ActivityIndicator color={colors.brandPurple} size="large" />
            <Text style={styles.centerStateText}>Loading...</Text>
          </View>
        ) : isRealDataTab && activeTabError && !listedProperties.length ? (
          <View style={styles.centerState}>
            <Text style={styles.centerStateText}>{activeTabError}</Text>
            <Pressable onPress={retryActiveTab} style={styles.retryButton}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </Pressable>
          </View>
        ) : listedProperties.length ? (
          <View style={styles.list}>
            {listedProperties.map(property => (
              <CompactPropertyCard
                isSaved={isPropertySaved(property)}
                key={property.id}
                onCall={async () => {
                  markContacted(property.id);
                  await callPropertyOwner(property);
                }}
                onPress={() =>
                  stackNavigation.navigate(ROUTES.home.propertyDetail, {
                    propertyId: property.id,
                  })
                }
                onShare={() => shareProperty(property)}
                // Goes through the same real, store-backed toggleFavourite every other
                // consumer (PropertyDetailScreen, PropertyListingScreen) uses — it
                // applies its own optimistic update to favouriteIds and calls the real
                // POST/DELETE /properties/:propertyId/save, rolling back and surfacing
                // the failure via showApiError if it fails. This screen fires it and
                // shows an immediate optimistic toast, same as the other consumers.
                onToggleSave={() => {
                  const wasSaved = isPropertySaved(property);
                  toggleFavourite(property.id);
                  showToast(
                    wasSaved
                      ? 'Property removed from favourites.'
                      : 'Property saved to favourites.',
                  );
                }}
                onWhatsApp={async () => {
                  markContacted(property.id);
                  markInterested(property.id);
                  await openWhatsAppForProperty(property);
                }}
                property={property}
              />
            ))}
            <Pressable
              onPress={() => removeFromCurrentBucket(listedProperties[0].id)}
              style={styles.manageButton}
            >
              <Text style={styles.manageButtonText}>
                Remove First {tabLabels[activeTab]}
              </Text>
            </Pressable>
          </View>
        ) : (
          <EmptyState
            actionLabel={
              activeTab === 'Favourite' ? 'Browse Properties' : undefined
            }
            description={`No properties are available under ${activeTab.toLowerCase()}.`}
            onAction={() =>
              tabNavigation?.navigate(ROUTES.tabs.homeStack, {
                screen: ROUTES.home.propertyListing,
              })
            }
            title={`${activeTab} is empty`}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function SavedStat({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  centerState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    gap: spacing.md,
  },
  centerStateText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: spacing.radiusMd,
    backgroundColor: colors.brandPurple,
  },
  retryButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerButton: {
    alignItems: 'center',
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  headerTitle: {
    color: colors.textPrimary,
    flex: 1,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
  content: {
    paddingBottom: spacing.xxxl,
    paddingHorizontal: spacing.lg,
  },
  tabRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingBottom: spacing.lg,
  },
  tabChip: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.chipBorder,
    borderRadius: 999,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 36,
    paddingHorizontal: spacing.lg,
  },
  tabChipSelected: {
    backgroundColor: colors.brandPurple,
    borderColor: colors.brandPurple,
  },
  tabLabel: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },
  tabLabelSelected: {
    color: colors.white,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.roleCardBorder,
    borderRadius: spacing.radiusMd,
    borderWidth: 1,
    flex: 1,
    minHeight: 88,
    justifyContent: 'center',
  },
  statValue: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
  },
  statLabel: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.xs,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  clearRecent: {
    alignItems: 'center',
    borderColor: colors.brandPurple,
    borderRadius: spacing.radiusMd,
    borderWidth: 1,
    justifyContent: 'center',
    marginBottom: spacing.lg,
    minHeight: 42,
  },
  clearRecentText: {
    color: colors.brandPurple,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
  },
  list: {
    gap: spacing.lg,
  },
  manageButton: {
    alignItems: 'center',
    borderColor: colors.chipBorder,
    borderRadius: spacing.radiusMd,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 42,
  },
  manageButtonText: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
  },
});
