import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';

import {colors} from '@/constants/colors';
import {spacing} from '@/constants/spacing';
import {typography} from '@/constants/typography';

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function SectionHeader({
  title,
  actionLabel,
  onAction,
}: SectionHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {actionLabel ? (
        <Pressable onPress={onAction}>
          <Text style={styles.action}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
  },
  action: {
    color: colors.primary,
    fontWeight: typography.fontWeight.semiBold,
    fontSize: typography.fontSize.sm,
  },
});
