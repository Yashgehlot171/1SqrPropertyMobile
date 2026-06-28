import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import {colors} from '@/constants/colors';
import {spacing} from '@/constants/spacing';
import {typography} from '@/constants/typography';

interface BannerCardProps {
  title: string;
  description: string;
  ctaLabel: string;
  icon: string;
  onPress?: () => void;
}

export function BannerCard({
  title,
  description,
  ctaLabel,
  icon,
  onPress,
}: BannerCardProps) {
  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
        <Text style={styles.cta}>{ctaLabel}</Text>
      </View>
      <View style={styles.iconWrap}>
        <Icon color={colors.accent} name={icon} size={28} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.primary,
    borderRadius: spacing.radiusLg,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.lg,
    shadowColor: colors.primary,
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: {width: 0, height: 8},
    elevation: 4,
    marginTop: spacing.sm,
  },
  copy: {
    flex: 1,
    gap: spacing.sm,
  },
  title: {
    color: colors.white,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
  description: {
    color: colors.textOnPrimaryMuted,
    fontSize: typography.fontSize.sm,
  },
  cta: {
    color: colors.white,
    fontWeight: typography.fontWeight.semiBold,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
