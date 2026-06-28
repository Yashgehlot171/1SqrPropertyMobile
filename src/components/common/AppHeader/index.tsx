import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import {colors} from '@/constants/colors';
import {spacing} from '@/constants/spacing';
import {typography} from '@/constants/typography';

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  onBackPress?: () => void;
  rightLabel?: string;
  onRightPress?: () => void;
}

export function AppHeader({
  title,
  subtitle,
  onBackPress,
  rightLabel,
  onRightPress,
}: AppHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.leftGroup}>
        {onBackPress ? (
          <Pressable onPress={onBackPress} style={styles.iconButton}>
            <Icon color={colors.textPrimary} name="chevron-back" size={22} />
          </Pressable>
        ) : null}
        <View style={styles.titleGroup}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      </View>
      {rightLabel ? (
        <Pressable onPress={onRightPress} style={styles.rightPill}>
          <Text style={styles.rightLabel}>{rightLabel}</Text>
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
    minHeight: 52,
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.transparent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  titleGroup: {
    flex: 1,
  },
  title: {
    fontSize: typography.fontSize.lg,
    lineHeight: typography.lineHeight.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    marginTop: 2,
  },
  rightLabel: {
    color: colors.white,
    fontWeight: typography.fontWeight.semiBold,
    fontSize: typography.fontSize.xs,
  },
  rightPill: {
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
});
