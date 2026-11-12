import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import {colors} from '@/constants/colors';
import {spacing} from '@/constants/spacing';
import {typography} from '@/constants/typography';

interface VerifiedBadgeProps {
  label?: string;
}

/**
 * Small "Verified" pill used on builder/plan cards. Mirrors the inline
 * verified-property badge style already used on HomeDashboardScreen's
 * property cards, extracted here as a reusable common component since this
 * feature needs it in multiple places (matching builders list, comparison
 * screen headers).
 */
export function VerifiedBadge({label = 'Verified'}: VerifiedBadgeProps) {
  return (
    <View style={styles.container}>
      <Icon color={colors.homeGreen} name="checkmark-circle" size={13} />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: colors.homeGreenSoft,
    borderRadius: 999,
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  label: {
    color: colors.homeGreen,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },
});
