import React from 'react';
import {
  Image,
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { typography } from '@/constants/typography';
import type { Property } from '@/types';
import { formatCurrency } from '@/utils/formatCurrency';

const propertyImages: ImageSourcePropType[] = [
  require('@/assets/images/home1.jpg'),
  require('@/assets/images/homeimage2.jpg'),
  require('@/assets/images/homeimage3.jpg'),
];

function getPropertyImage(propertyId: string) {
  const numericId = Number(propertyId.replace(/[^0-9]/g, ''));
  return propertyImages[
    (Number.isFinite(numericId) ? numericId : 1) % propertyImages.length
  ];
}

interface CompactPropertyCardProps {
  property: Property;
  isSaved?: boolean;
  onPress?: () => void;
  onToggleSave?: () => void;
  onShare?: () => void;
  onCall?: () => void;
  onWhatsApp?: () => void;
}

export function CompactPropertyCard({
  property,
  isSaved,
  onPress,
  onToggleSave,
  onShare,
  onCall,
  onWhatsApp,
}: CompactPropertyCardProps) {
  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={styles.imageWrap}>
        <Image source={getPropertyImage(property.id)} style={styles.image} />
        <Pressable onPress={onToggleSave} style={styles.saveButton}>
          <Icon
            color={isSaved ? colors.brandPurple : colors.neutralIcon}
            name={isSaved ? 'heart' : 'heart-outline'}
            size={20}
          />
        </Pressable>
        <View style={styles.badgeRow}>
          {property.verified ? (
            <StatusPill color="success" label="Verified" />
          ) : null}
          <StatusPill color="primary" label={property.ownerType} />
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text numberOfLines={1} style={styles.title}>
            {property.title}
          </Text>
          <Pressable onPress={onShare} style={styles.moreButton}>
            <Icon
              color={colors.textSecondary}
              name="ellipsis-vertical"
              size={18}
            />
          </Pressable>
        </View>
        <Text numberOfLines={1} style={styles.location}>
          <Icon
            color={colors.textSecondary}
            name="location-outline"
            size={12}
          />{' '}
          {property.location.area}, {property.location.city}
        </Text>
        <Text style={styles.price}>{formatCurrency(property.price)}</Text>
        <Text style={styles.meta}>
          {property.areaSqFt} sq ft | {property.propertyType}
        </Text>
        <View style={styles.actions}>
          <ActionButton icon="call-outline" label="Call" onPress={onCall} />
          <ActionButton
            icon="logo-whatsapp"
            label="WhatsApp"
            onPress={onWhatsApp}
          />
        </View>
      </View>
    </Pressable>
  );
}

function StatusPill({
  label,
  color,
}: {
  label: string;
  color: 'primary' | 'success';
}) {
  const isSuccess = color === 'success';

  return (
    <View
      style={[
        styles.statusPill,
        isSuccess ? styles.statusPillSuccess : styles.statusPillPrimary,
      ]}
    >
      <Text
        style={[
          styles.statusPillText,
          isSuccess ? styles.statusTextSuccess : styles.statusTextPrimary,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

function ActionButton({
  icon,
  label,
  onPress,
}: {
  icon: string;
  label: string;
  onPress?: () => void;
}) {
  return (
    <Pressable disabled={!onPress} onPress={onPress} style={styles.action}>
      <Icon color={colors.homeGreen} name={icon} size={14} />
      <Text style={styles.actionText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.roleCardBorder,
    borderRadius: spacing.radiusLg,
    borderWidth: 1,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: colors.homeCardShadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 3,
  },
  imageWrap: {
    width: 142,
    minHeight: 156,
  },
  image: {
    height: '100%',
    width: '100%',
  },
  saveButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    height: 32,
    justifyContent: 'center',
    position: 'absolute',
    right: spacing.sm,
    top: spacing.sm,
    width: 32,
  },
  badgeRow: {
    bottom: spacing.sm,
    flexDirection: 'row',
    gap: spacing.xs,
    left: spacing.sm,
    position: 'absolute',
    right: spacing.sm,
  },
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  statusPillSuccess: {
    backgroundColor: colors.successSoft,
  },
  statusPillPrimary: {
    backgroundColor: colors.brandPurpleSoft,
  },
  statusPillText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },
  statusTextSuccess: {
    color: colors.success,
  },
  statusTextPrimary: {
    color: colors.brandPurple,
  },
  content: {
    flex: 1,
    gap: spacing.xs,
    padding: spacing.md,
  },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  title: {
    color: colors.textPrimary,
    flex: 1,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
  },
  moreButton: {
    alignItems: 'center',
    height: 28,
    justifyContent: 'center',
    width: 24,
  },
  location: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.xs,
  },
  price: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
  meta: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.xs,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  action: {
    alignItems: 'center',
    borderColor: colors.chipBorder,
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.xs,
    minHeight: 30,
    paddingHorizontal: spacing.sm,
  },
  actionText: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },
});
