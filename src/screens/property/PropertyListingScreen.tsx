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

import { CompactPropertyCard, EmptyState } from '@/components';
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
    () => filterProperties(properties, appliedFilters, category),
    [appliedFilters, category, properties],
  );

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
      <View style={styles.header}>
        <Pressable onPress={navigation.goBack} style={styles.headerButton}>
          <Icon color={colors.textPrimary} name="chevron-back" size={22} />
        </Pressable>
        <Text style={styles.headerTitle}>Search Results</Text>
        <Pressable style={styles.headerButton}>
          <Icon color={colors.textPrimary} name="search-outline" size={21} />
        </Pressable>
        <Pressable
          onPress={() => navigation.navigate(ROUTES.home.propertyFilter)}
          style={styles.headerButton}
        >
          <Icon color={colors.textPrimary} name="options-outline" size={21} />
        </Pressable>
      </View>

      <ScrollView
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
            <FilterChip label="Sort" />
            {activeFilterChips.length ? (
              activeFilterChips.map(chip => (
                <FilterChip key={chip} label={chip} />
              ))
            ) : (
              <>
                <FilterChip label="Verified" />
                <FilterChip label="Owner" />
              </>
            )}
          </View>
        </ScrollView>

        <Text style={styles.resultCount}>
          {filteredProperties.length}+ Properties found
        </Text>

        {filteredProperties.length ? (
          <View style={styles.list}>
            {filteredProperties.map(property => (
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
                onToggleSave={() => {
                  toggleFavourite(property.id);
                  showToast(
                    favouriteIds.includes(property.id)
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
      </ScrollView>
    </SafeAreaView>
  );
}

function FilterChip({ label }: { label: string }) {
  return (
    <View style={styles.filterChip}>
      <Text style={styles.filterText}>{label}</Text>
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
