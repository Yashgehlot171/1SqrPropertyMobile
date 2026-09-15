import React, { useEffect, useMemo, useState } from 'react';
import {
  Image,
  ImageSourcePropType,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';

import { CompactPropertyCard, EmptyState } from '@/components';
import { ROUTES } from '@/constants/routes';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { typography } from '@/constants/typography';
import { showApiError } from '@/api';
import {
  markPropertyInterested,
  recordPropertyView,
  trackPropertyCall,
  trackPropertyShare,
  trackPropertyWhatsapp,
} from '@/services/propertyApi';
import { usePropertyStore } from '@/store/propertyStore';
import { useSavedStore } from '@/store/savedStore';
import type { HomeStackParamList, SavedStackParamList } from '@/types';
import { formatCurrency } from '@/utils/formatCurrency';
import {
  callPropertyOwner,
  openWhatsAppForProperty,
  shareProperty,
} from '@/utils/propertyActions';
import { showToast } from '@/utils/toast';

type Props =
  | NativeStackScreenProps<HomeStackParamList, 'PropertyDetail'>
  | NativeStackScreenProps<SavedStackParamList, 'PropertyDetail'>;

const detailImages: ImageSourcePropType[] = [
  require('@/assets/images/homeimage3.jpg'),
  require('@/assets/images/homeimage2.jpg'),
  require('@/assets/images/home1.jpg'),
];

export function PropertyDetailScreen({ navigation, route }: Props) {
  const stackNavigation = navigation as any;
  const tabNavigation = navigation.getParent<any>();
  const properties = usePropertyStore(state => state.properties);
  const favouriteIds = useSavedStore(state => state.favouriteIds);
  const pendingIds = useSavedStore(state => state.pendingIds);
  const toggleFavourite = useSavedStore(state => state.toggleFavourite);
  const markContacted = useSavedStore(state => state.markContacted);
  const addRecentlyViewed = useSavedStore(state => state.addRecentlyViewed);
  // Local, per-screen guard for the "I'm Interested" button only. Unlike 3b's
  // toggleFavourite (a two-state toggle with an optimistic update to roll back),
  // markPropertyInterested is a one-shot, fire-and-forget lead signal with no
  // opposite direction — a double-tap's worst case is the same lead getting touched
  // twice (harmless; the backend finds-or-updates one lead per user+property rather
  // than creating a duplicate). A simple local boolean is enough to disable the
  // button while the request is in flight and avoid a duplicate toast; the shared
  // pendingIds-in-a-store machinery from savedStore (built for optimistic-then-
  // rollback toggles) would be overkill for this milder failure mode.
  const [isInterestPending, setIsInterestPending] = useState(false);

  const property = properties.find(item => item.id === route.params.propertyId);

  useEffect(() => {
    if (property) {
      addRecentlyViewed(property.id);
      // Fire-and-forget: recordPropertyView swallows its own errors internally so a
      // view-tracking failure never disrupts this screen. Not awaited so it never
      // delays rendering.
      recordPropertyView(property.id);
    }
  }, [addRecentlyViewed, property]);

  const similarProperties = useMemo(
    () =>
      properties
        .filter(
          item =>
            property &&
            item.id !== property.id &&
            item.propertyType === property.propertyType,
        )
        .slice(0, 3),
    [properties, property],
  );

  if (!property) {
    return (
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable onPress={navigation.goBack} style={styles.headerButton}>
            <Icon color={colors.textPrimary} name="chevron-back" size={22} />
          </Pressable>
          <Text style={styles.headerTitle}>Property Details</Text>
        </View>
        <EmptyState
          description="This property is not available in the local dataset."
          title="Property not found"
        />
      </SafeAreaView>
    );
  }

  const isSaved = favouriteIds.includes(property.id);
  const isSavePending = pendingIds.has(property.id);

  const navigateToGallery = () => {
    stackNavigation.navigate(ROUTES.home.propertyGallery, {
      propertyId: property.id,
    });
  };

  const saveProperty = () => {
    // Fire-and-forget: toggleFavourite (savedStore) applies its own optimistic
    // update to favouriteIds synchronously before making the network call, so
    // isSaved above already reflects the new state as soon as this function
    // returns — the toast below can fire immediately rather than waiting on the
    // network round trip. A failure is rolled back and surfaced by the store
    // itself via showApiError, independent of this toast.
    toggleFavourite(property.id);
    showToast(
      isSaved
        ? 'Property removed from favourites.'
        : 'Property saved to favourites.',
    );
  };

  const callOwner = async () => {
    markContacted(property.id);
    // Tracking call is fire-and-forget (void, not awaited) so the dialer's
    // responsiveness is never gated on this network round trip; trackPropertyCall
    // swallows its own errors, matching recordPropertyView's "must never disrupt the
    // screen" reasoning.
    void trackPropertyCall(property.id);
    await callPropertyOwner(property);
  };

  const openChat = async () => {
    markContacted(property.id);
    void trackPropertyWhatsapp(property.id);
    await openWhatsAppForProperty(property);
  };

  const shareThisProperty = () => {
    // Fired without awaiting, right when the share sheet is invoked, not after the
    // user's app choice resolves — Share.share()'s promise only resolves once the
    // user picks an app or dismisses the sheet, and its result doesn't reliably
    // report which app was chosen anyway (see propertyApi.ts's trackPropertyShare),
    // so there is nothing more accurate to wait for. "share" is used as the generic
    // channel value since the actual OS-level app choice isn't reliably knowable.
    void trackPropertyShare(property.id, 'share');
    void shareProperty(property);
  };

  // Distinct from `saveProperty`/`toggleFavourite` above (the header heart icon,
  // 3b's favourite/save toggle) — this is a separate backend action
  // (POST /properties/:id/interested) that records lead-generating interest, not a
  // favourite toggle. It has no "undo" state, so it doesn't mirror `isSaved`; a tap
  // fires the request and shows a success or failure toast.
  const markInterested = async () => {
    if (isInterestPending) {
      return;
    }
    setIsInterestPending(true);
    try {
      await markPropertyInterested(property.id);
      showToast("We've shared your interest with the owner.");
    } catch (error) {
      showApiError(error);
    } finally {
      setIsInterestPending(false);
    }
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable onPress={navigation.goBack} style={styles.headerButton}>
          <Icon color={colors.textPrimary} name="chevron-back" size={22} />
        </Pressable>
        <Text style={styles.headerTitle}>Property Details</Text>
        <Pressable
          onPress={shareThisProperty}
          style={styles.headerButton}
        >
          <Icon
            color={colors.textPrimary}
            name="share-social-outline"
            size={20}
          />
        </Pressable>
        <Pressable
          disabled={isSavePending}
          onPress={saveProperty}
          style={styles.headerButton}
        >
          <Icon
            color={isSaved ? colors.brandPurple : colors.textPrimary}
            name={isSaved ? 'heart' : 'heart-outline'}
            size={21}
          />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Pressable onPress={navigateToGallery} style={styles.gallery}>
          <Image source={detailImages[0]} style={styles.galleryImage} />
          <View style={styles.galleryButton}>
            <Icon color={colors.white} name="camera-outline" size={18} />
          </View>
          <View style={styles.galleryCount}>
            <Text style={styles.galleryCountText}>1/12</Text>
          </View>
        </Pressable>

        <View style={styles.badgeRow}>
          {property.verified ? (
            <StatusBadge label="Verified" tone="success" />
          ) : null}
          <StatusBadge label={property.ownerType} tone="primary" />
          <StatusBadge label={property.readyState} tone="warning" />
        </View>

        <View style={styles.titleSection}>
          <Text style={styles.title}>{property.title}</Text>
          <Text style={styles.location}>
            {property.location.area}, {property.location.city}
          </Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatCurrency(property.price)}</Text>
            <Text style={styles.propertyId}>Property ID: {property.id}</Text>
          </View>
        </View>

        <View style={styles.quickActions}>
          <SmallAction icon="call-outline" label="Call" onPress={callOwner} />
          <SmallAction
            icon="logo-whatsapp"
            label="WhatsApp"
            onPress={openChat}
            tone="success"
          />
          <SmallAction
            disabled={isInterestPending}
            icon="heart-outline"
            label="I'm Interested"
            onPress={markInterested}
            tone="primary"
          />
        </View>

        <View style={styles.infoGrid}>
          <InfoCard label="Area" value={`${property.areaSqFt} sq ft`} />
          <InfoCard label="BHK" value={property.bhk ?? 'N/A'} />
          <InfoCard label="Facing" value={property.facing ?? 'N/A'} />
          <InfoCard label="Property Type" value={property.propertyType} />
          <InfoCard label="Ownership" value={property.ownerType} />
          <InfoCard
            label="Registry"
            value={property.verified ? 'Ready' : 'N/A'}
          />
        </View>

        <DetailSection title="About Property">
          <Text style={styles.bodyText}>{property.description}</Text>
        </DetailSection>

        <DetailSection title="Amenities">
          <View style={styles.amenities}>
            {property.amenities.map(item => (
              <View key={item} style={styles.amenity}>
                <Icon
                  color={colors.brandPurple}
                  name="checkmark-circle"
                  size={15}
                />
                <Text style={styles.amenityText}>{item}</Text>
              </View>
            ))}
          </View>
        </DetailSection>

        <DetailSection title="Specifications">
          <SpecRow label="Listing Type" value={property.listingType} />
          <SpecRow
            label="Road Width"
            value={property.roadWidthFt ? `${property.roadWidthFt} ft` : 'N/A'}
          />
          <SpecRow label="Furnishing" value={property.furnishing ?? 'N/A'} />
          <SpecRow
            label="Construction Year"
            value={
              property.constructionYear
                ? String(property.constructionYear)
                : 'N/A'
            }
          />
          <SpecRow
            label="Floor Details"
            value={
              property.totalFloors
                ? `${property.floorNumber ?? 0}/${property.totalFloors}`
                : 'N/A'
            }
          />
          <SpecRow label="Address" value={property.location.address ?? 'N/A'} />
        </DetailSection>

        <View style={styles.ownerCard}>
          <View style={styles.ownerAvatar}>
            <Text style={styles.ownerAvatarText}>
              {property.owner.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.ownerCopy}>
            <Text style={styles.ownerName}>{property.owner.name}</Text>
            <Text style={styles.ownerRole}>{property.owner.role}</Text>
            <Text style={styles.memberText}>Member since Jan 2022</Text>
          </View>
          <Pressable onPress={callOwner} style={styles.ownerCall}>
            <Icon color={colors.white} name="call-outline" size={18} />
            <Text style={styles.ownerCallText}>Call</Text>
          </Pressable>
        </View>

        <DetailSection title="Service Actions">
          <View style={styles.serviceActions}>
            <Pressable
              onPress={() => {
                tabNavigation?.navigate(ROUTES.tabs.servicesStack, {
                  screen: ROUTES.services.loanCalculator,
                });
                showToast('Opening Loan Calculator from Services.');
              }}
              style={styles.serviceButton}
            >
              <Text style={styles.serviceButtonText}>Apply Loan</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                tabNavigation?.navigate(ROUTES.tabs.servicesStack, {
                  screen: ROUTES.services.legalServicesDashboard,
                });
                showToast('Opening Legal Services from Services.');
              }}
              style={styles.serviceButtonMuted}
            >
              <Text style={styles.serviceButtonMutedText}>Legal Check</Text>
            </Pressable>
          </View>
        </DetailSection>

        <Text style={styles.sectionTitle}>Similar Properties</Text>
        {similarProperties.length ? (
          <View style={styles.similarList}>
            {similarProperties.map(item => (
              <CompactPropertyCard
                isSaved={favouriteIds.includes(item.id)}
                isSavePending={pendingIds.has(item.id)}
                key={item.id}
                onCall={async () => {
                  markContacted(item.id);
                  // Same fire-and-forget tracking as callOwner above, applied to the
                  // similar-properties cards' own Call action.
                  void trackPropertyCall(item.id);
                  await callPropertyOwner(item);
                }}
                onPress={() =>
                  stackNavigation.navigate(ROUTES.home.propertyDetail, {
                    propertyId: item.id,
                  })
                }
                onShare={() => {
                  void trackPropertyShare(item.id, 'share');
                  void shareProperty(item);
                }}
                onToggleSave={() => toggleFavourite(item.id)}
                onWhatsApp={async () => {
                  markContacted(item.id);
                  void trackPropertyWhatsapp(item.id);
                  await openWhatsAppForProperty(item);
                }}
                property={item}
              />
            ))}
          </View>
        ) : (
          <EmptyState
            description="No similar properties were found in the local dataset."
            title="No similar properties"
          />
        )}
      </ScrollView>

      <View style={styles.stickyActions}>
        <Pressable onPress={callOwner} style={styles.stickySecondary}>
          <Icon color={colors.brandPurple} name="call-outline" size={18} />
          <Text style={styles.stickySecondaryText}>Call</Text>
        </Pressable>
        <Pressable onPress={openChat} style={styles.stickyPrimary}>
          <Icon color={colors.white} name="logo-whatsapp" size={18} />
          <Text style={styles.stickyPrimaryText}>Chat</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function StatusBadge({
  label,
  tone,
}: {
  label: string;
  tone: 'primary' | 'success' | 'warning';
}) {
  const toneStyle =
    tone === 'success'
      ? styles.badgeSuccess
      : tone === 'warning'
      ? styles.badgeWarning
      : styles.badgePrimary;
  const textStyle =
    tone === 'success'
      ? styles.badgeTextSuccess
      : tone === 'warning'
      ? styles.badgeTextWarning
      : styles.badgeTextPrimary;

  return (
    <View style={[styles.badge, toneStyle]}>
      <Text style={[styles.badgeText, textStyle]}>{label}</Text>
    </View>
  );
}

function SmallAction({
  disabled,
  icon,
  label,
  onPress,
  tone = 'default',
}: {
  disabled?: boolean;
  icon: string;
  label: string;
  onPress: () => void;
  tone?: 'default' | 'primary' | 'success';
}) {
  const isPrimary = tone === 'primary';
  const isSuccess = tone === 'success';

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.smallAction,
        isPrimary ? styles.smallActionPrimary : null,
        isSuccess ? styles.smallActionSuccess : null,
        disabled ? styles.smallActionDisabled : null,
      ]}
    >
      <Icon
        color={
          isPrimary
            ? colors.white
            : isSuccess
            ? colors.homeGreen
            : colors.textPrimary
        }
        name={icon}
        size={15}
      />
      <Text
        style={[
          styles.smallActionText,
          isPrimary ? styles.smallActionTextPrimary : null,
          isSuccess ? styles.smallActionTextSuccess : null,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoCard}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text numberOfLines={2} style={styles.infoValue}>
        {value}
      </Text>
    </View>
  );
}

function DetailSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.detailSection}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.specRow}>
      <Text style={styles.specLabel}>{label}</Text>
      <Text style={styles.specValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerButton: {
    alignItems: 'center',
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  headerTitle: {
    color: colors.textPrimary,
    flex: 1,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
  content: {
    paddingBottom: 112,
  },
  gallery: {
    height: 220,
    marginHorizontal: spacing.lg,
  },
  galleryImage: {
    borderRadius: spacing.radiusLg,
    height: '100%',
    width: '100%',
  },
  galleryButton: {
    alignItems: 'center',
    backgroundColor: colors.overlayStrong,
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    position: 'absolute',
    right: spacing.md,
    top: spacing.md,
    width: 36,
  },
  galleryCount: {
    backgroundColor: colors.overlayStrong,
    borderRadius: 999,
    bottom: spacing.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    position: 'absolute',
    right: spacing.md,
  },
  galleryCountText: {
    color: colors.white,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  badgePrimary: {
    backgroundColor: colors.brandPurpleSoft,
  },
  badgeSuccess: {
    backgroundColor: colors.successSoft,
  },
  badgeWarning: {
    backgroundColor: colors.warningSoft,
  },
  badgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },
  badgeTextPrimary: {
    color: colors.brandPurple,
  },
  badgeTextSuccess: {
    color: colors.success,
  },
  badgeTextWarning: {
    color: colors.amber,
  },
  titleSection: {
    gap: spacing.xs,
    padding: spacing.lg,
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
  location: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
  },
  priceRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  price: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
  },
  propertyId: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.xs,
  },
  quickActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  smallAction: {
    alignItems: 'center',
    borderColor: colors.chipBorder,
    borderRadius: 999,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
    minHeight: 38,
  },
  smallActionPrimary: {
    backgroundColor: colors.brandPurple,
    borderColor: colors.brandPurple,
  },
  smallActionSuccess: {
    borderColor: colors.homeGreenSoft,
  },
  smallActionDisabled: {
    opacity: 0.5,
  },
  smallActionText: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },
  smallActionTextPrimary: {
    color: colors.white,
  },
  smallActionTextSuccess: {
    color: colors.homeGreen,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  infoCard: {
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.roleCardBorder,
    borderRadius: spacing.radiusMd,
    borderWidth: 1,
    minHeight: 72,
    padding: spacing.sm,
    width: '31.7%',
  },
  infoLabel: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.xs,
    textAlign: 'center',
  },
  infoValue: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  detailSection: {
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
  },
  bodyText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.sm,
  },
  amenities: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  amenity: {
    alignItems: 'center',
    backgroundColor: colors.brandPurpleSubtle,
    borderRadius: 999,
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  amenityText: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },
  specRow: {
    alignItems: 'center',
    borderBottomColor: colors.divider,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  specLabel: {
    color: colors.textSecondary,
    flex: 1,
    fontSize: typography.fontSize.sm,
  },
  specValue: {
    color: colors.textPrimary,
    flex: 1,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
    textAlign: 'right',
  },
  ownerCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.roleCardBorder,
    borderRadius: spacing.radiusLg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    padding: spacing.md,
    shadowColor: colors.homeCardShadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 3,
  },
  ownerAvatar: {
    alignItems: 'center',
    backgroundColor: colors.brandPurpleSoft,
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  ownerAvatarText: {
    color: colors.brandPurple,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
  ownerCopy: {
    flex: 1,
  },
  ownerName: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
  },
  ownerRole: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.xs,
    marginTop: spacing.xs,
  },
  memberText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.xs,
    marginTop: spacing.xs,
  },
  ownerCall: {
    alignItems: 'center',
    backgroundColor: colors.brandPurple,
    borderRadius: spacing.radiusMd,
    flexDirection: 'row',
    gap: spacing.xs,
    minHeight: 40,
    paddingHorizontal: spacing.md,
  },
  ownerCallText: {
    color: colors.white,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },
  serviceActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  serviceButton: {
    alignItems: 'center',
    backgroundColor: colors.brandPurple,
    borderRadius: spacing.radiusMd,
    flex: 1,
    justifyContent: 'center',
    minHeight: 44,
  },
  serviceButtonMuted: {
    alignItems: 'center',
    backgroundColor: colors.brandPurpleSoft,
    borderRadius: spacing.radiusMd,
    flex: 1,
    justifyContent: 'center',
    minHeight: 44,
  },
  serviceButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
  },
  serviceButtonMutedText: {
    color: colors.brandPurple,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
  },
  similarList: {
    gap: spacing.lg,
    padding: spacing.lg,
    paddingTop: spacing.md,
  },
  stickyActions: {
    backgroundColor: colors.surface,
    borderTopColor: colors.divider,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
  },
  stickySecondary: {
    alignItems: 'center',
    borderColor: colors.brandPurple,
    borderRadius: spacing.radiusLg,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    minHeight: 52,
  },
  stickyPrimary: {
    alignItems: 'center',
    backgroundColor: colors.brandPurple,
    borderRadius: spacing.radiusLg,
    flex: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    minHeight: 52,
  },
  stickySecondaryText: {
    color: colors.brandPurple,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
  },
  stickyPrimaryText: {
    color: colors.white,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
  },
});
