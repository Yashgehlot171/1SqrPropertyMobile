import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';

import { CompactPropertyCard, EmptyState } from '@/components';
import { ROUTES } from '@/constants/routes';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { typography } from '@/constants/typography';
import { usePropertyStore } from '@/store/propertyStore';
import { useSavedStore } from '@/store/savedStore';
import type { SavedStackParamList } from '@/types';
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
      case 'Recently Viewed':
        return recentlyViewedIds;
      case 'Favourite':
      default:
        return favouriteIds;
    }
  }, [activeTab, contactedIds, favouriteIds, interestedIds, recentlyViewedIds]);

  const listedProperties = useMemo(
    () =>
      activeIds
        .map(id => properties.find(item => item.id === id))
        .filter((item): item is (typeof properties)[number] => Boolean(item)),
    [activeIds, properties],
  );

  const removeFromCurrentBucket = (propertyId: string) => {
    if (activeTab === 'Favourite') {
      toggleFavourite(propertyId);
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
          <SavedStat label="Saved" value={favouriteIds.length} />
          <SavedStat label="Contacted" value={contactedIds.length} />
          <SavedStat label="Recently Viewed" value={recentlyViewedIds.length} />
        </View>

        {activeTab === 'Recently Viewed' && recentlyViewedIds.length ? (
          <Pressable onPress={clearRecentlyViewed} style={styles.clearRecent}>
            <Text style={styles.clearRecentText}>Clear Recently Viewed</Text>
          </Pressable>
        ) : null}

        {listedProperties.length ? (
          <View style={styles.list}>
            {listedProperties.map(property => (
              <CompactPropertyCard
                isSaved={favouriteIds.includes(property.id)}
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
                onToggleSave={() => {
                  if (activeTab === 'Favourite') {
                    toggleFavourite(property.id);
                    showToast('Property removed from favourites.');
                    return;
                  }

                  toggleFavourite(property.id);
                  showToast('Property saved to favourites.');
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
