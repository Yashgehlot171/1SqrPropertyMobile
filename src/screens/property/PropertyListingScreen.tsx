import { useRemoteLoad } from '@/hooks/useRemoteFlow';
import { RemoteStatus } from '@/components/common/RemoteStatus';
import React, { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';

import {
  CompactPropertyCard,
  EmptyState,
  KeyboardAwareScrollView,
} from '@/components';
import { ROUTES } from '@/constants/routes';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { typography } from '@/constants/typography';
import { usePropertyStore } from '@/store/propertyStore';
import { useSavedStore } from '@/store/savedStore';
import type { HomeStackParamList } from '@/types';
import {
  callPropertyOwner,
  openWhatsAppForProperty,
  shareProperty,
} from '@/utils/propertyActions';
import { filterProperties } from '@/utils/propertyUtils';
import { showToast } from '@/utils/toast';

type Props = NativeStackScreenProps<HomeStackParamList, 'PropertyListing'>;

export function PropertyListingScreen({ navigation, route }: Props) {
  const [query, setQuery] = useState(route.params?.query ?? '');
  const [sortOrder, setSortOrder] = useState<'default' | 'priceLow' | 'priceHigh'>('default');
  const loadRemote = usePropertyStore(state => state.load);
  const remoteLoading = usePropertyStore(state => state.loading);
  const remoteError = usePropertyStore(state => state.error);
  useRemoteLoad(loadRemote);
  const properties = usePropertyStore(state => state.properties);
  const filters = usePropertyStore(state => state.filters);
  const setFilters = usePropertyStore(state => state.setFilters);
  const favouriteIds = useSavedStore(state => state.favouriteIds);
  const toggleFavourite = useSavedStore(state => state.toggleFavourite);
  const markContacted = useSavedStore(state => state.markContacted);
  const category = route.params?.category;

  const appliedFilters = useMemo(
    () => ({
      ...filters,
      search: query,
    }),
    [filters, query],
  );

  const filteredProperties = useMemo(
    () =>
      filterProperties(
        properties.filter(item => item.status === 'Active'),
        appliedFilters,
        category,
      ),
    [appliedFilters, category, properties],
  );

  const visibleProperties = useMemo(() => {
    if (sortOrder === 'default') return filteredProperties;
    return [...filteredProperties].sort((left, right) =>
      sortOrder === 'priceLow' ? left.price - right.price : right.price - left.price,
    );
  }, [filteredProperties, sortOrder]);

  const activeFilterChips = useMemo(() => {
    const chips: string[] = [];
    if (category && category !== 'All') {
      chips.push(category);
    }
    if (filters.propertyType) {
      chips.push(filters.propertyType);
    }
    if (filters.city) {
      chips.push(filters.city);
    }
    if (filters.verifiedOnly) {
      chips.push('Verified');
    }
    if (filters.ownerOnly) {
      chips.push('Owner');
    }
    if (filters.readyToMoveOnly) {
      chips.push('Ready To Move');
    }

    return chips;
  }, [category, filters]);

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <RemoteStatus
        loading={remoteLoading}
        error={remoteError}
        retry={() => {
          void loadRemote().catch(() => {});
        }}
      />
      <View style={styles.header}>
        <Pressable onPress={navigation.goBack} style={styles.headerButton}>
          <Icon color={colors.textPrimary} name="chevron-back" size={22} />
        </Pressable>
        <Text style={styles.headerTitle}>Search Results</Text>
        <Pressable
          onPress={() => navigation.navigate(ROUTES.home.propertyFilter)}
          style={styles.headerButton}
        >
          <Icon color={colors.textPrimary} name="options-outline" size={21} />
        </Pressable>
      </View>

      <KeyboardAwareScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.searchBox}>
          <Icon color={colors.textSecondary} name="search-outline" size={18} />
          <TextInput
            onChangeText={setQuery}
            placeholder="Search city, locality or property"
            placeholderTextColor={colors.textSecondary}
            style={styles.searchInput}
            value={query}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filterRow}>
            <Pressable
              onPress={() => navigation.navigate(ROUTES.home.propertyFilter)}
              style={styles.filterChip}
            >
              <Icon
                color={colors.textPrimary}
                name="options-outline"
                size={15}
              />
              <Text style={styles.filterText}>Filters</Text>
            </Pressable>
            <FilterChip
              label={sortOrder === 'priceLow' ? 'Price: Low to High' : sortOrder === 'priceHigh' ? 'Price: High to Low' : 'Sort'}
              selected={sortOrder !== 'default'}
              onPress={() => setSortOrder(current => current === 'default' ? 'priceLow' : current === 'priceLow' ? 'priceHigh' : 'default')}
            />
            <FilterChip label="Verified" selected={Boolean(filters.verifiedOnly)} onPress={() => setFilters({...filters, search: query, verifiedOnly: !filters.verifiedOnly})} />
            <FilterChip label="Owner" selected={Boolean(filters.ownerOnly)} onPress={() => setFilters({...filters, search: query, ownerOnly: !filters.ownerOnly})} />
            <FilterChip label="Ready" selected={Boolean(filters.readyToMoveOnly)} onPress={() => setFilters({...filters, search: query, readyToMoveOnly: !filters.readyToMoveOnly})} />
            {activeFilterChips.filter(chip => !['Verified', 'Owner', 'Ready To Move'].includes(chip)).map(chip => <View key={chip} style={styles.activeTag}><Text style={styles.activeTagText}>{chip}</Text></View>)}
          </View>
        </ScrollView>

        <Text style={styles.resultCount}>
          {visibleProperties.length} {visibleProperties.length === 1 ? 'Property' : 'Properties'} found
        </Text>

        {visibleProperties.length ? (
          <View style={styles.list}>
            {visibleProperties.map(property => (
              <CompactPropertyCard
                isSaved={favouriteIds.includes(property.id)}
                key={property.id}
                onCall={async () => {
                  markContacted(property.id);
                  await callPropertyOwner(property);
                }}
                onPress={() =>
                  navigation.navigate(ROUTES.home.propertyDetail, {
                    propertyId: property.id,
                  })
                }
                onShare={() => {
                  shareProperty(property);
                }}
                onToggleSave={async () => {
                  // Fire-and-forget, matching PropertyDetailScreen's convention:
                  // toggleFavourite (savedStore) applies its optimistic update to
                  // favouriteIds synchronously first, so the pre-toggle
                  // favouriteIds check below still reflects the state as of this
                  // tap. A failure is rolled back and surfaced by the store via
                  // showApiError, independent of this toast.
                  const wasSaved = favouriteIds.includes(property.id);
                  if (!(await toggleFavourite(property.id))) {
                    return;
                  }
                  showToast(
                    wasSaved
                      ? 'Property removed from favourites.'
                      : 'Property saved to favourites.',
                  );
                }}
                onWhatsApp={async () => {
                  markContacted(property.id);
                  await openWhatsAppForProperty(property);
                }}
                property={property}
              />
            ))}
          </View>
        ) : (
          <EmptyState
            actionLabel="Reset Filters"
            description="Try broadening the search or clearing filters."
            onAction={() =>
              setFilters({
                search: query,
              })
            }
            title="No properties found"
          />
        )}
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

function FilterChip({label, selected = false, onPress}: {label: string; selected?: boolean; onPress: () => void}) {
  return (
    <Pressable accessibilityRole="button" accessibilityState={{selected}} onPress={onPress} style={[styles.filterChip, selected && styles.filterChipSelected]}>
      <Text style={[styles.filterText, selected && styles.filterTextSelected]}>{label}</Text>
    </Pressable>
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
    gap: spacing.xs,
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
  searchBox: {
    alignItems: 'center',
    backgroundColor: colors.fieldBackground,
    borderColor: colors.chipBorder,
    borderRadius: spacing.radiusMd,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 48,
    paddingHorizontal: spacing.md,
  },
  searchInput: {
    color: colors.textPrimary,
    flex: 1,
    fontSize: typography.fontSize.sm,
    minWidth: 0,
    paddingHorizontal: spacing.sm,
    paddingVertical: 0,
  },
  filterRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
  },
  filterChip: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.chipBorder,
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
    minHeight: 34,
    paddingHorizontal: spacing.md,
  },
  filterText: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },
  filterChipSelected: {backgroundColor: colors.primarySoft, borderColor: colors.primary},
  filterTextSelected: {color: colors.primary},
  activeTag: {alignItems: 'center', justifyContent: 'center', minHeight: 34, paddingHorizontal: spacing.md, borderRadius: spacing.radiusPill, backgroundColor: colors.brandPurpleSubtle},
  activeTagText: {color: colors.primary, fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.semiBold},
  resultCount: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    marginBottom: spacing.md,
  },
  list: {
    gap: spacing.lg,
  },
});
