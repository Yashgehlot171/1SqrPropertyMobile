import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

import {colors} from '@/constants/colors';
import {spacing} from '@/constants/spacing';
import {typography} from '@/constants/typography';
import type {SpecificationStatus} from '@/types/constructionRequirement.types';

interface ComparisonStatusBadgeProps {
  status: SpecificationStatus;
}

const statusColorMap: Record<SpecificationStatus, string> = {
  Included: colors.success,
  'Not Included': colors.textSecondary,
  'Optional Upgrade': colors.warning,
  Conditional: colors.info,
};

/**
 * Status pill for the package-comparison screen (Included / Not Included /
 * Optional Upgrade / Conditional). No existing component covers this
 * four-state vocabulary, so it is added here alongside StatusChip rather
 * than overloading StatusChip's free-text label map.
 */
export function ComparisonStatusBadge({status}: ComparisonStatusBadgeProps) {
  const color = statusColorMap[status];

  return (
    <View
      style={[
        styles.container,
        {backgroundColor: `${color}14`, borderColor: `${color}32`},
      ]}>
      <Text style={[styles.label, {color}]}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  label: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semiBold,
  },
});
