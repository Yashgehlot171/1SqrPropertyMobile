import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

import {AppButton} from '@/components/common/AppButton';
import {StatusChip} from '@/components/common/StatusChip';
import {colors} from '@/constants/colors';
import {spacing} from '@/constants/spacing';
import {typography} from '@/constants/typography';
import type {MaterialBrand} from '@/types';

interface MaterialCardProps {
  item: MaterialBrand;
  isSaved?: boolean;
  onFindSuppliers?: () => void;
  onToggleSave?: () => void;
}

export function MaterialCard({
  item,
  isSaved,
  onFindSuppliers,
  onToggleSave,
}: MaterialCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.copy}>
          <Text style={styles.category}>{item.category}</Text>
          <Text style={styles.brand}>{item.brand}</Text>
        </View>
        <StatusChip label={`${item.rating}/5`} />
      </View>
      <Text style={styles.specification}>{item.specification}</Text>
      <Text style={styles.price}>{item.priceRange}</Text>
      <View style={styles.actions}>
        <AppButton
          label={isSaved ? 'Saved' : 'Save Material'}
          onPress={onToggleSave}
          style={styles.button}
          variant={isSaved ? 'secondary' : 'outlined'}
        />
        <AppButton
          label="Find Suppliers"
          onPress={onFindSuppliers}
          style={styles.button}
          variant="outlined"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: spacing.radiusXl,
    padding: spacing.xl,
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
  },
  category: {
    color: colors.secondary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
  },
  brand: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
  specification: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.sm,
  },
  price: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  button: {
    flex: 1,
  },
});
