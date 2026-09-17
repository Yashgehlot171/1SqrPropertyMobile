import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';

import {showApiError} from '@/api';
import {
  AppHeader,
  ConfirmationModal,
  EmptyState,
  ScreenContainer,
} from '@/components';
import {PROPERTY_STATUSES} from '@/constants/appConstants';
import {colors, statusColors} from '@/constants/colors';
import {ROUTES} from '@/constants/routes';
import {spacing} from '@/constants/spacing';
import {typography} from '@/constants/typography';
import {
  deleteProperty,
  getMyProperties,
  updateProperty,
} from '@/services/propertyApi';
import {usePropertyStore} from '@/store/propertyStore';
import type {
  AddPropertyStackParamList,
  Property,
  PropertyLifecycleStatus,
} from '@/types';
import {formatCurrency} from '@/utils/formatCurrency';
import {shareProperty} from '@/utils/propertyActions';
import {showToast} from '@/utils/toast';

type Props = NativeStackScreenProps<AddPropertyStackParamList, 'MyProperties'>;

// Sole fallback for a property with no uploaded images at all (not a hash-based
// placeholder anymore — every property used to render one of 3 fixed images
// regardless of its real media, same bug already fixed in CompactPropertyCard).
const fallbackImage = require('@/assets/images/home1.jpg');

function getPropertyImage(property: Property): ImageSourcePropType {
  // Prefer the backend-flagged primary/cover image; fall back to the first
  // available image (array order is not guaranteed to match "primary" intent),
  // and only fall back to the placeholder when no usable image exists at all.
  const primaryImage = property.media.find(
    item => item.type === 'image' && item.isPrimary && item.uri,
  );
  const fallbackFirstImage = property.media.find(
    item => item.type === 'image' && item.uri,
  );
  const resolvedImage = primaryImage ?? fallbackFirstImage;
  const result = resolvedImage ? {uri: resolvedImage.uri} : fallbackImage;
  return result;
}

export function MyPropertiesScreen({navigation}: Props) {
  const initializeDraft = usePropertyStore(state => state.initializeDraft);
  const [activeStatus, setActiveStatus] =
    useState<PropertyLifecycleStatus>('Active');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null,
  );
  const [expandedPropertyId, setExpandedPropertyId] = useState<string | null>(
    null,
  );
  const [myProperties, setMyProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // GET /me/properties already scopes results to the current user server-side (see
  // property.service.ts's myProperties()), so no client-side owner filter is needed
  // here anymore — only the activeStatus tab filter (which has no server-side
  // equivalent on this endpoint) is applied on top.
  const loadMyProperties = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const items = await getMyProperties();
      setMyProperties(items);
    } catch (error) {
      showApiError(error);
      setLoadError('Unable to load your properties right now.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMyProperties();
  }, [loadMyProperties]);

  const filteredProperties = useMemo(
    () => myProperties.filter(item => item.status === activeStatus),
    [activeStatus, myProperties],
  );

  // Sub-piece 2's real deleteProperty/updateProperty replace the previous
  // local-only removeProperty/changePropertyStatus Zustand mutations. Note: the live
  // backend currently returns 403 for both actions because of a still-pending
  // server-side permission-seeding fix (separate backend work, not yet applied to the
  // live database) — that is expected today, so failures surface a toast via
  // showApiError (which reads the backend's own error message) instead of crashing.
  const handleDelete = useCallback(async (property: Property) => {
    try {
      await deleteProperty(property.id);
      setMyProperties(current => current.filter(item => item.id !== property.id));
      showToast('Property deleted.');
    } catch (error) {
      showApiError(error);
    }
  }, []);

  const handleStatusChange = useCallback(
    async (property: Property, status: PropertyLifecycleStatus) => {
      try {
        const updated = await updateProperty(property.id, {status});
        if (updated) {
          setMyProperties(current =>
            current.map(item => (item.id === property.id ? updated : item)),
          );
        }
        showToast(`Status changed to ${status}.`);
      } catch (error) {
        showApiError(error);
      }
    },
    [],
  );

  if (isLoading && !myProperties.length) {
    return (
      <ScreenContainer>
        <AppHeader title="My Properties" onBackPress={navigation.goBack} />
        <View style={styles.centerState}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={styles.centerStateText}>Loading your properties...</Text>
        </View>
      </ScreenContainer>
    );
  }

  if (loadError && !myProperties.length) {
    return (
      <ScreenContainer>
        <AppHeader title="My Properties" onBackPress={navigation.goBack} />
        <View style={styles.centerState}>
          <Text style={styles.centerStateText}>{loadError}</Text>
          <Pressable onPress={loadMyProperties} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <AppHeader
        title="My Properties"
        onBackPress={navigation.goBack}
        rightLabel="Add New"
        onRightPress={() => {
          initializeDraft();
          navigation.navigate(ROUTES.addProperty.addPropertyBasic);
        }}
      />
      <View style={styles.tabRow}>
        {PROPERTY_STATUSES.map(status => (
          <Pressable
            key={status}
            onPress={() => setActiveStatus(status)}
            style={[
              styles.tabChip,
              activeStatus === status && styles.tabChipSelected,
            ]}>
            <Text
              style={[
                styles.tabText,
                activeStatus === status && styles.tabTextSelected,
              ]}>
              {status}
            </Text>
          </Pressable>
        ))}
      </View>

      {filteredProperties.length ? (
        filteredProperties.map(property => (
          <MyPropertyCard
            key={property.id}
            expanded={expandedPropertyId === property.id}
            imageSource={getPropertyImage(property)}
            onDelete={() => setSelectedProperty(property)}
            onEdit={() => {
              // Pass the already-fetched real property straight through so the
              // store doesn't need to (and previously incorrectly tried to) look
              // it up in the local mock array, which would never contain a real
              // backend id and silently produced a blank draft.
              initializeDraft(property.id, property);
              navigation.navigate(ROUTES.addProperty.addPropertyBasic, {
                propertyId: property.id,
              });
            }}
            onMore={() =>
              setExpandedPropertyId(current =>
                current === property.id ? null : property.id,
              )
            }
            onPromote={async () => {
              await shareProperty(property);
            }}
            onStatusChange={status => {
              handleStatusChange(property, status);
            }}
            onView={() =>
              navigation.navigate(ROUTES.addProperty.propertyPreview, {
                propertyId: property.id,
              })
            }
            property={property}
          />
        ))
      ) : (
        <EmptyState
          actionLabel="Create Property"
          description={`No ${activeStatus.toLowerCase()} properties are available for this user.`}
          onAction={() => {
            initializeDraft();
            navigation.navigate(ROUTES.addProperty.addPropertyBasic);
          }}
          title={`${activeStatus} list is empty`}
        />
      )}

      <ConfirmationModal
        confirmLabel="Delete"
        message={
          selectedProperty
            ? `Delete ${selectedProperty.title}?`
            : 'Delete property?'
        }
        onCancel={() => setSelectedProperty(null)}
        onConfirm={() => {
          if (selectedProperty) {
            handleDelete(selectedProperty);
          }
          setSelectedProperty(null);
        }}
        title="Delete Property"
        visible={Boolean(selectedProperty)}
      />
    </ScreenContainer>
  );
}

function MyPropertyCard({
  property,
  imageSource,
  expanded,
  onEdit,
  onView,
  onPromote,
  onMore,
  onDelete,
  onStatusChange,
}: {
  property: Property;
  imageSource: ImageSourcePropType;
  expanded: boolean;
  onEdit: () => void;
  onView: () => void;
  onPromote: () => void;
  onMore: () => void;
  onDelete: () => void;
  onStatusChange: (status: PropertyLifecycleStatus) => void;
}) {
  return (
    <View style={styles.propertyCard}>
      <Pressable onPress={onView} style={styles.propertyMain}>
        <View style={styles.imageWrap}>
          <Image source={imageSource} style={styles.propertyImage} />
          <View style={styles.statusBadge}>
            <Text style={styles.statusBadgeText}>{property.status}</Text>
          </View>
        </View>
        <View style={styles.propertyContent}>
          <View style={styles.titleRow}>
            <Text numberOfLines={2} style={styles.propertyTitle}>
              {property.title}
            </Text>
            {property.verified ? (
              <Icon color={colors.success} name="shield-checkmark" size={16} />
            ) : null}
          </View>
          <View style={styles.locationRow}>
            <Icon
              color={colors.textSecondary}
              name="location-outline"
              size={12}
            />
            <Text numberOfLines={1} style={styles.locationText}>
              {property.location.area}, {property.location.city}
            </Text>
          </View>
          <Text style={styles.price}>{formatCurrency(property.price)}</Text>
          <Text style={styles.meta}>
            {property.areaSqFt} sq ft | {property.propertyType}
          </Text>
        </View>
      </Pressable>

      {/* Views/Leads/Calls metrics removed: they were a fake numericId-based
          formula, not real data — the /me/properties list endpoint doesn't
          return per-property stats yet. Don't re-add a similar formula. */}
      <View style={styles.cardActions}>
        <Action icon="create-outline" label="Edit" onPress={onEdit} />
        <Action icon="megaphone-outline" label="Promote" onPress={onPromote} />
        <Action icon="ellipsis-vertical" label="More" onPress={onMore} />
      </View>

      {expanded ? (
        <View style={styles.managePanel}>
          <View style={styles.manageActions}>
            <Action icon="eye-outline" label="View" onPress={onView} />
            <Action icon="trash-outline" label="Delete" onPress={onDelete} />
          </View>
          <Text style={styles.manageLabel}>Change Status</Text>
          <View style={styles.statusRow}>
            {PROPERTY_STATUSES.map(status => (
              <Pressable
                key={status}
                onPress={() => onStatusChange(status)}
                style={[
                  styles.statusChip,
                  property.status === status && styles.statusChipSelected,
                ]}>
                <Text
                  style={[
                    styles.statusChipText,
                    property.status === status && styles.statusChipTextSelected,
                  ]}>
                  {status}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );
}

function Action({
  icon,
  label,
  onPress,
}: {
  icon: string;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.action}>
      <Icon color={colors.textPrimary} name={icon} size={16} />
      <Text style={styles.actionText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  centerState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    gap: spacing.md,
  },
  centerStateText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: spacing.radiusMd,
    backgroundColor: colors.primary,
  },
  retryButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
  },
  tabRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: -spacing.md,
  },
  tabChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabText: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },
  tabTextSelected: {
    color: colors.white,
  },
  propertyCard: {
    backgroundColor: colors.white,
    borderRadius: spacing.radiusLg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.divider,
    shadowColor: colors.primary,
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: {width: 0, height: 8},
    elevation: 2,
  },
  propertyMain: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.md,
  },
  imageWrap: {
    width: 112,
    height: 116,
    borderRadius: spacing.radiusMd,
    overflow: 'hidden',
    backgroundColor: colors.mapSurface,
  },
  propertyImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  statusBadge: {
    position: 'absolute',
    left: spacing.sm,
    bottom: spacing.sm,
    borderRadius: 999,
    backgroundColor: colors.successSoft,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: statusColors.active,
  },
  statusBadgeText: {
    color: statusColors.active,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },
  propertyContent: {
    flex: 1,
    gap: spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  propertyTitle: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.sm,
    fontWeight: typography.fontWeight.bold,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  locationText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: typography.fontSize.xs,
  },
  price: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    marginTop: spacing.xs,
  },
  meta: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.xs,
  },
  cardActions: {
    flexDirection: 'row',
    minHeight: 46,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  action: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  actionText: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semiBold,
  },
  managePanel: {
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    padding: spacing.md,
    gap: spacing.md,
    backgroundColor: colors.surfaceSoft,
  },
  manageActions: {
    flexDirection: 'row',
  },
  manageLabel: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semiBold,
  },
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  statusChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  statusChipText: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },
  statusChipTextSelected: {
    color: colors.white,
  },
});
