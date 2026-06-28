import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

import {colors} from '@/constants/colors';
import {spacing} from '@/constants/spacing';
import {typography} from '@/constants/typography';

interface PlaceholderBlockProps {
  title: string;
  description: string;
}

export function PlaceholderBlock({
  title,
  description,
}: PlaceholderBlockProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: spacing.radiusLg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
  },
  description: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
  },
});
