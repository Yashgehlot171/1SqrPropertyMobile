import React from 'react';
import {Image, ImageSourcePropType, Pressable, StyleSheet, Text, View} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import {StatusChip} from '@/components/common/StatusChip';
import {colors} from '@/constants/colors';
import {spacing} from '@/constants/spacing';
import {typography} from '@/constants/typography';
import type {Property} from '@/types';
import {formatCurrency} from '@/utils/formatCurrency';
import {getPropertyPlaceholderLabel} from '@/utils/propertyUtils';

const propertyImages: ImageSourcePropType[] = [
  require('@/assets/images/home1.jpg'),
  require('@/assets/images/homeimage2.jpg'),
  require('@/assets/images/homeimage3.jpg'),
];

function getPropertyImage(propertyId: string) {
  const numericId = Number(propertyId.replace(/[^0-9]/g, ''));
  return propertyImages[(Number.isFinite(numericId) ? numericId : 1) % propertyImages.length];
}

interface PropertyCardProps {
  property: Property;
  onPress?: () => void;
  isSaved?: boolean;
  onToggleSave?: () => void;
  onShare?: () => void;
  onCall?: () => void;
  onWhatsApp?: () => void;
}

export function PropertyCard({
  property,
  onPress,
  isSaved,
  onToggleSave,
  onShare,
  onCall,
  onWhatsApp,
}: PropertyCardProps) {
  return (
    <View style={styles.card}>
      <Pressable onPress={onPress}>
        <View style={styles.imagePlaceholder}>
          <Image source={getPropertyImage(property.id)} style={styles.image} />
          <View style={styles.imageScrim} />
          <Pressable onPress={onToggleSave} style={styles.saveButton}>
            <Icon
              color={isSaved ? colors.primary : colors.textPrimary}
              name={isSaved ? 'heart' : 'heart-outline'}
              size={18}
            />
          </Pressable>
          <Text style={styles.placeholderLabel}>
            {getPropertyPlaceholderLabel(property)}
          </Text>
          <View style={styles.imageBadgeRow}>
            <StatusChip label={property.ownerType} />
            <StatusChip label={property.readyState} />
          </View>
        </View>
      </Pressable>
      <View style={styles.content}>
        <View style={styles.topRow}>
          <StatusChip label={property.status} />
          {property.verified ? <StatusChip label="Verified" /> : null}
        </View>
        <Text style={styles.title}>{property.title}</Text>
        <Text style={styles.meta}>
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
          <ActionButton
            icon="share-social-outline"
            label="Share"
            onPress={onShare}
          />
        </View>
      </View>
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
    <Pressable disabled={!onPress} onPress={onPress} style={styles.actionButton}>
      <Icon color={colors.secondary} name={icon} size={16} />
      <Text style={styles.actionLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: spacing.radiusXl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.darkPurple,
    shadowOpacity: 0.07,
    shadowRadius: 18,
    shadowOffset: {width: 0, height: 10},
    elevation: 3,
  },
  imagePlaceholder: {
    height: 160,
    backgroundColor: colors.primary,
    padding: spacing.lg,
    justifyContent: 'space-between',
    position: 'relative',
  },
  image: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
  },
  imageScrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.imageScrim,
  },
  saveButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderLabel: {
    color: colors.white,
    fontSize: 30,
    fontWeight: typography.fontWeight.bold,
    textShadowColor: colors.overlay,
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 8,
  },
  imageBadgeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  content: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  topRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
  },
  meta: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
  },
  price: {
    color: colors.primary,
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    backgroundColor: colors.purpleLight,
  },
  actionLabel: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },
});
