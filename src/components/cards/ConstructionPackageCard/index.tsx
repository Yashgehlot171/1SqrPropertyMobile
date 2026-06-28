import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

import {AppButton} from '@/components/common/AppButton';
import {StatusChip} from '@/components/common/StatusChip';
import {colors} from '@/constants/colors';
import {spacing} from '@/constants/spacing';
import {typography} from '@/constants/typography';
import type {ConstructionPackage} from '@/types';
import {formatCurrency} from '@/utils/formatCurrency';

interface ConstructionPackageCardProps {
  item: ConstructionPackage;
  onRequestQuote?: () => void;
  onViewDetails?: () => void;
}

export function ConstructionPackageCard({
  item,
  onRequestQuote,
  onViewDetails,
}: ConstructionPackageCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.copy}>
          <Text style={styles.title}>{item.name}</Text>
          <Text style={styles.price}>
            {formatCurrency(item.costPerSqFt)} / sq ft
          </Text>
        </View>
        <StatusChip label={item.timeline} />
      </View>
      <Text style={styles.materialQuality}>{item.materialQuality}</Text>
      <View style={styles.features}>
        {item.features.map(feature => (
          <StatusChip key={feature} label={feature} />
        ))}
      </View>
      <Text style={styles.meta}>
        Labour Included: {item.labourIncluded ? 'Yes' : 'No'}
      </Text>
      <View style={styles.actions}>
        <AppButton
          label="View Details"
          onPress={onViewDetails}
          style={styles.button}
          variant="outlined"
        />
        <AppButton
          label="Request Quote"
          onPress={onRequestQuote}
          style={styles.button}
          variant="secondary"
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
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.darkPurple,
    shadowOpacity: 0.05,
    shadowRadius: 14,
    shadowOffset: {width: 0, height: 8},
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
  },
  price: {
    color: colors.primary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
  },
  materialQuality: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
  },
  features: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  meta: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  button: {
    flex: 1,
  },
});
