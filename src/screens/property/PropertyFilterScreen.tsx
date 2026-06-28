import React, { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';

import {
  BHK_OPTIONS,
  FACING_OPTIONS,
  PROPERTY_TYPES,
} from '@/constants/appConstants';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { typography } from '@/constants/typography';
import { usePropertyStore } from '@/store/propertyStore';
import type {
  HomeStackParamList,
  PropertyFilterState,
  PropertyType,
} from '@/types';

type Props = NativeStackScreenProps<HomeStackParamList, 'PropertyFilter'>;

const propertyTypeIcons: Record<PropertyType, string> = {
  Plot: 'business-outline',
  House: 'home-outline',
  Flat: 'business-outline',
  'Agriculture Land': 'leaf-outline',
  'Commercial Plot': 'storefront-outline',
  'Commercial House': 'home-outline',
  Shop: 'bag-handle-outline',
  Office: 'briefcase-outline',
  Warehouse: 'cube-outline',
};

export function PropertyFilterScreen({ navigation }: Props) {
  const properties = usePropertyStore(state => state.properties);
  const currentFilters = usePropertyStore(state => state.filters);
  const setFilters = usePropertyStore(state => state.setFilters);
  const [draftFilters, setDraftFilters] =
    useState<Partial<PropertyFilterState>>(currentFilters);

  const cities = useMemo(
    () => Array.from(new Set(properties.map(item => item.location.city))),
    [properties],
  );

  const toggleFilter = <T extends string>(
    key: keyof PropertyFilterState,
    value: T,
  ) => {
    setDraftFilters(state => ({
      ...state,
      [key]: state[key] === value ? undefined : value,
    }));
  };

  const setToggle = (key: 'readyToMoveOnly' | 'verifiedOnly' | 'ownerOnly') => {
    setDraftFilters(state => ({
      ...state,
      [key]: !state[key],
    }));
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable onPress={navigation.goBack} style={styles.headerButton}>
          <Icon color={colors.textPrimary} name="chevron-back" size={22} />
        </Pressable>
        <Text style={styles.headerTitle}>Filters</Text>
        <Pressable
          onPress={() =>
            setDraftFilters({
              search: currentFilters.search,
            })
          }
          style={styles.clearButton}
        >
          <Text style={styles.clearText}>Clear All</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <FilterSection title="Location">
          <View style={styles.selectorField}>
            <Icon
              color={colors.textPrimary}
              name="location-outline"
              size={18}
            />
            <Text style={styles.selectorText}>
              {draftFilters.city ?? cities[0] ?? 'Select location'}
            </Text>
            <Icon color={colors.textSecondary} name="chevron-down" size={16} />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.inlineChips}>
              {cities.map(city => (
                <Chip
                  isSelected={draftFilters.city === city}
                  key={city}
                  label={city}
                  onPress={() => toggleFilter('city', city)}
                />
              ))}
            </View>
          </ScrollView>
        </FilterSection>

        <FilterSection title="Property Type">
          <View style={styles.typeGrid}>
            {PROPERTY_TYPES.map(type => (
              <PropertyTypeCard
                icon={propertyTypeIcons[type]}
                isSelected={draftFilters.propertyType === type}
                key={type}
                label={type}
                onPress={() => toggleFilter('propertyType', type)}
              />
            ))}
          </View>
        </FilterSection>

        <FilterSection title="Budget Range">
          <View style={styles.rangeTrack}>
            <View style={styles.rangeFill} />
            <View style={[styles.rangeThumb, styles.rangeThumbStart]} />
            <View style={[styles.rangeThumb, styles.rangeThumbEnd]} />
          </View>
          <View style={styles.rangeValues}>
            <Text style={styles.rangeValue}>
              {draftFilters.minPrice
                ? `₹${draftFilters.minPrice.toLocaleString('en-IN')}`
                : '₹10,00,000'}
            </Text>
            <Text style={styles.rangeValue}>
              {draftFilters.maxPrice
                ? `₹${draftFilters.maxPrice.toLocaleString('en-IN')}`
                : '₹20,00,000'}
            </Text>
          </View>
          <View style={styles.inputRow}>
            <NumericField
              onChangeText={value =>
                setDraftFilters(state => ({
                  ...state,
                  minPrice: value ? Number(value) : undefined,
                }))
              }
              placeholder="Min Price"
              value={draftFilters.minPrice ? String(draftFilters.minPrice) : ''}
            />
            <NumericField
              onChangeText={value =>
                setDraftFilters(state => ({
                  ...state,
                  maxPrice: value ? Number(value) : undefined,
                }))
              }
              placeholder="Max Price"
              value={draftFilters.maxPrice ? String(draftFilters.maxPrice) : ''}
            />
          </View>
        </FilterSection>

        <FilterSection title="Property Size">
          <View style={styles.inputRow}>
            <NumericField
              onChangeText={value =>
                setDraftFilters(state => ({
                  ...state,
                  minArea: value ? Number(value) : undefined,
                }))
              }
              placeholder="Min Size"
              value={draftFilters.minArea ? String(draftFilters.minArea) : ''}
            />
            <NumericField
              onChangeText={value =>
                setDraftFilters(state => ({
                  ...state,
                  maxArea: value ? Number(value) : undefined,
                }))
              }
              placeholder="Max Size"
              value={draftFilters.maxArea ? String(draftFilters.maxArea) : ''}
            />
            <Text style={styles.unitText}>sq ft</Text>
          </View>
        </FilterSection>

        <FilterSection title="Listing Type">
          <View style={styles.segmentRow}>
            <Chip
              isSelected={
                !draftFilters.ownerOnly && !draftFilters.readyToMoveOnly
              }
              label="All"
              onPress={() =>
                setDraftFilters(state => ({
                  ...state,
                  ownerOnly: undefined,
                  readyToMoveOnly: undefined,
                }))
              }
            />
            <Chip
              isSelected={Boolean(draftFilters.ownerOnly)}
              label="Owner"
              onPress={() => setToggle('ownerOnly')}
            />
            <Chip
              isSelected={Boolean(draftFilters.readyToMoveOnly)}
              label="Ready"
              onPress={() => setToggle('readyToMoveOnly')}
            />
          </View>
        </FilterSection>

        <FilterSection title="BHK Type">
          <View style={styles.inlineChips}>
            {BHK_OPTIONS.map(option => (
              <Chip
                isSelected={draftFilters.bhk === option}
                key={option}
                label={option}
                onPress={() => toggleFilter('bhk', option)}
              />
            ))}
          </View>
        </FilterSection>

        <FilterSection title="Facing">
          <View style={styles.inlineChips}>
            {FACING_OPTIONS.map(option => (
              <Chip
                isSelected={draftFilters.facing === option}
                key={option}
                label={option}
                onPress={() => toggleFilter('facing', option)}
              />
            ))}
          </View>
        </FilterSection>

        <FilterSection title="Other Filters">
          <ToggleRow
            isSelected={Boolean(draftFilters.verifiedOnly)}
            label="Verified Properties"
            onPress={() => setToggle('verifiedOnly')}
          />
          <ToggleRow
            isSelected={Boolean(draftFilters.ownerOnly)}
            label="Owner Properties"
            onPress={() => setToggle('ownerOnly')}
          />
        </FilterSection>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          onPress={() => {
            setFilters({
              ...draftFilters,
              search: currentFilters.search,
            });
            navigation.goBack();
          }}
          style={styles.applyButton}
        >
          <Text style={styles.applyText}>Show Properties</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function FilterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function NumericField({
  placeholder,
  value,
  onChangeText,
}: {
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
}) {
  return (
    <TextInput
      keyboardType="number-pad"
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.textSecondary}
      style={styles.numericInput}
      value={value}
    />
  );
}

function PropertyTypeCard({
  icon,
  label,
  isSelected,
  onPress,
}: {
  icon: string;
  label: string;
  isSelected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.typeCard, isSelected ? styles.typeCardSelected : null]}
    >
      <Icon
        color={isSelected ? colors.brandPurple : colors.textPrimary}
        name={icon}
        size={22}
      />
      <Text
        numberOfLines={1}
        style={[styles.typeText, isSelected ? styles.typeTextSelected : null]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function Chip({
  label,
  isSelected,
  onPress,
}: {
  label: string;
  isSelected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, isSelected ? styles.chipSelected : null]}
    >
      <Text
        style={[styles.chipLabel, isSelected ? styles.chipLabelSelected : null]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function ToggleRow({
  label,
  isSelected,
  onPress,
}: {
  label: string;
  isSelected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.toggleRow}>
      <Text style={styles.toggleLabel}>{label}</Text>
      <Switch
        onValueChange={onPress}
        thumbColor={colors.surface}
        trackColor={{
          false: colors.bottomSheetHandle,
          true: colors.brandPurple,
        }}
        value={isSelected}
      />
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
    justifyContent: 'space-between',
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
    marginLeft: spacing.xs,
  },
  clearButton: {
    padding: spacing.sm,
  },
  clearText: {
    color: colors.brandPurple,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
  },
  content: {
    paddingBottom: spacing.xxxl,
    paddingHorizontal: spacing.lg,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.sm,
  },
  selectorField: {
    alignItems: 'center',
    backgroundColor: colors.fieldBackground,
    borderColor: colors.chipBorder,
    borderRadius: spacing.radiusMd,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 48,
    paddingHorizontal: spacing.md,
  },
  selectorText: {
    color: colors.textPrimary,
    flex: 1,
    fontSize: typography.fontSize.sm,
  },
  inlineChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingTop: spacing.sm,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  typeCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.chipBorder,
    borderRadius: spacing.radiusLg,
    borderWidth: 1,
    gap: spacing.sm,
    minHeight: 86,
    padding: spacing.md,
    width: '30.5%',
  },
  typeCardSelected: {
    backgroundColor: colors.brandPurpleSubtle,
    borderColor: colors.brandPurple,
  },
  typeText: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },
  typeTextSelected: {
    color: colors.brandPurple,
    fontWeight: typography.fontWeight.bold,
  },
  rangeTrack: {
    backgroundColor: colors.brandPurpleSoft,
    borderRadius: 999,
    height: 6,
    marginBottom: spacing.md,
    marginTop: spacing.lg,
  },
  rangeFill: {
    backgroundColor: colors.brandPurple,
    borderRadius: 999,
    height: 6,
    marginLeft: '18%',
    width: '72%',
  },
  rangeThumb: {
    backgroundColor: colors.brandPurple,
    borderRadius: 11,
    height: 22,
    position: 'absolute',
    top: -8,
    width: 22,
  },
  rangeThumbStart: {
    left: '17%',
  },
  rangeThumbEnd: {
    right: 0,
  },
  rangeValues: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  rangeValue: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },
  inputRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  numericInput: {
    backgroundColor: colors.surface,
    borderColor: colors.chipBorder,
    borderRadius: spacing.radiusMd,
    borderWidth: 1,
    color: colors.textPrimary,
    flex: 1,
    fontSize: typography.fontSize.sm,
    minHeight: 46,
    paddingHorizontal: spacing.md,
    paddingVertical: 0,
  },
  unitText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },
  segmentRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  chip: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.chipBorder,
    borderRadius: 999,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 36,
    minWidth: 92,
    paddingHorizontal: spacing.lg,
  },
  chipSelected: {
    backgroundColor: colors.brandPurpleSubtle,
    borderColor: colors.brandPurple,
  },
  chipLabel: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },
  chipLabelSelected: {
    color: colors.brandPurple,
    fontWeight: typography.fontWeight.bold,
  },
  toggleRow: {
    alignItems: 'center',
    borderBottomColor: colors.divider,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 48,
  },
  toggleLabel: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  footer: {
    backgroundColor: colors.surface,
    borderTopColor: colors.divider,
    borderTopWidth: 1,
    padding: spacing.lg,
  },
  applyButton: {
    alignItems: 'center',
    backgroundColor: colors.brandPurple,
    borderRadius: spacing.radiusLg,
    justifyContent: 'center',
    minHeight: 52,
  },
  applyText: {
    color: colors.white,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
  },
});
