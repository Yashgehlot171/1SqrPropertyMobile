import React, {useMemo, useState} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';

import {
  AppHeader,
  EmptyState,
  MaterialCard,
  ScreenContainer,
  SearchBar,
} from '@/components';
import {colors} from '@/constants/colors';
import {ROUTES} from '@/constants/routes';
import {spacing} from '@/constants/spacing';
import {typography} from '@/constants/typography';
import {useConstructionStore} from '@/store/constructionStore';
import type {ServicesStackParamList} from '@/types';
import {showToast} from '@/utils/toast';

type Props = NativeStackScreenProps<
  ServicesStackParamList,
  'MaterialInformation'
>;

export function MaterialInformationScreen({navigation}: Props) {
  const materials = useConstructionStore(state => state.materials);
  const savedMaterialIds = useConstructionStore(state => state.savedMaterialIds);
  const toggleSavedMaterial = useConstructionStore(
    state => state.toggleSavedMaterial,
  );
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');

  const categories = useMemo(
    () => ['All', ...new Set(materials.map(item => item.category))],
    [materials],
  );

  const filteredMaterials = useMemo(
    () =>
      materials.filter(item => {
        const matchesCategory =
          category === 'All' || item.category === category;
        const searchValue = query.trim().toLowerCase();
        const matchesQuery =
          !searchValue ||
          item.category.toLowerCase().includes(searchValue) ||
          item.brand.toLowerCase().includes(searchValue) ||
          item.specification.toLowerCase().includes(searchValue);

        return matchesCategory && matchesQuery;
      }),
    [category, materials, query],
  );

  return (
    <ScreenContainer>
      <AppHeader
        title="Material Information"
        subtitle="Static brands, specs and pricing ranges"
        onBackPress={navigation.goBack}
      />
      <SearchBar
        onChangeText={setQuery}
        placeholder="Search materials, brands or specification"
        value={query}
      />
      <View style={styles.chips}>
        {categories.map(item => (
          <Pressable
            key={item}
            onPress={() => setCategory(item)}
            style={[
              styles.chip,
              category === item && styles.chipSelected,
            ]}>
            <Text
              style={[
                styles.chipText,
                category === item && styles.chipTextSelected,
              ]}>
              {item}
            </Text>
          </Pressable>
        ))}
      </View>
      {filteredMaterials.length ? (
        filteredMaterials.map(item => (
          <MaterialCard
            isSaved={savedMaterialIds.includes(item.id)}
            item={item}
            key={item.id}
            onFindSuppliers={() => {
              showToast(`Opening Supplier Directory for ${item.category}.`);
              navigation.navigate(ROUTES.services.supplierDirectory);
            }}
            onToggleSave={() => {
              const isSaved = savedMaterialIds.includes(item.id);
              toggleSavedMaterial(item.id);
              showToast(
                isSaved
                  ? 'Material removed from saved list.'
                  : 'Material saved locally.',
              );
            }}
          />
        ))
      ) : (
        <EmptyState
          description="Try another category or search term."
          title="No materials found"
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    color: colors.textPrimary,
    fontWeight: typography.fontWeight.medium,
  },
  chipTextSelected: {
    color: colors.white,
  },
});
