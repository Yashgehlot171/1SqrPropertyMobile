import React, { useMemo, useState } from 'react';
import {
  Image,
  ImageBackground,
  ImageSourcePropType,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';

import { BannerCard } from '@/components';
import { PROPERTY_CATEGORIES, PROPERTY_TYPES } from '@/constants/appConstants';
import { colors } from '@/constants/colors';
import { ROUTES } from '@/constants/routes';
import { spacing } from '@/constants/spacing';
import { typography } from '@/constants/typography';
import { useAuthStore } from '@/store/authStore';
import { usePropertyStore } from '@/store/propertyStore';
import { useSavedStore } from '@/store/savedStore';
import type { HomeStackParamList, Property, PropertyType } from '@/types';
import { formatCurrency } from '@/utils/formatCurrency';
import {
  callPropertyOwner,
  openWhatsAppForProperty,
  shareProperty,
} from '@/utils/propertyActions';
import { filterProperties } from '@/utils/propertyUtils';
import { showToast } from '@/utils/toast';

type Props = NativeStackScreenProps<HomeStackParamList, 'HomeDashboard'>;

const categoryIcons: Record<PropertyType, string> = {
  Plot: 'business-outline',
  House: 'home-outline',
  Flat: 'business-outline',
  'Agriculture Land': 'leaf-outline',
  'Commercial Plot': 'storefront-outline',
  'Commercial House': 'home-outline',
  Shop: 'bag-handle-outline',
  Office: 'briefcase-outline',
  Warehouse: 'cube-outline',
};

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

export function HomeDashboardScreen({ navigation }: Props) {
  const tabNavigation = navigation.getParent<any>();
  const [query, setQuery] = useState('');
  const properties = usePropertyStore(state => state.properties);
  const setFilters = usePropertyStore(state => state.setFilters);
  const toggleFavourite = useSavedStore(state => state.toggleFavourite);
  const markContacted = useSavedStore(state => state.markContacted);
  const favouriteIds = useSavedStore(state => state.favouriteIds);
  const user = useAuthStore(state => state.user);
  const { width } = useWindowDimensions();

  const propertyCardWidth = Math.min(width * 0.56, 224);

  const featured = useMemo(
    () =>
      filterProperties(properties, { search: query }).filter(
        item => item.featured,
      ),
    [properties, query],
  );
  const latest = useMemo(
    () => filterProperties(properties, { search: query }).slice(0, 5),
    [properties, query],
  );

  const renderPropertyCard = (property: Property) => (
    <HomePropertyCard
      isSaved={favouriteIds.includes(property.id)}
      key={property.id}
      onCall={async () => {
        markContacted(property.id);
        await callPropertyOwner(property);
      }}
      onPress={() =>
        navigation.navigate(ROUTES.home.propertyDetail, {
          propertyId: property.id,
        })
      }
      onShare={() => {
        shareProperty(property);
      }}
      onToggleSave={() => {
        toggleFavourite(property.id);
        showToast(
          favouriteIds.includes(property.id)
            ? 'Property removed from favourites.'
            : 'Property saved to favourites.',
        );
      }}
      onWhatsApp={async () => {
        markContacted(property.id);
        await openWhatsAppForProperty(property);
      }}
      property={property}
      width={propertyCardWidth}
    />
  );

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable style={styles.locationButton}>
            <Icon color={colors.brandPurple} name="location" size={18} />
            {/* `||` (not `??`) so a real but empty city string ("") also
              falls back — city is always a string on UserProfile, so the
              only case `||` changes vs `??` here is empty-string, which
              should fall back too. */}
            <Text style={styles.locationText}>{user?.city || 'Lucknow'}</Text>
            <Icon color={colors.textPrimary} name="chevron-down" size={14} />
          </Pressable>
          <View style={styles.headerActions}>
            <Pressable
              accessibilityRole="button"
              onPress={() => navigation.navigate(ROUTES.home.notifications)}
              style={styles.iconButton}
            >
              <Icon color={colors.textPrimary} name="notifications" size={20} />
              <View style={styles.notificationDot} />
            </Pressable>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {(user?.name ?? 'User').charAt(0).toUpperCase()}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.greeting}>
          <Text style={styles.greetingText}>Hello, {user?.name ?? 'User'}</Text>
          <Text style={styles.roleText}>
            {(user?.role ?? 'buyer').charAt(0).toUpperCase() +
              (user?.role ?? 'buyer').slice(1)}
          </Text>
        </View>

        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Icon color={colors.textSecondary} name="search" size={18} />
            <TextInput
              onChangeText={setQuery}
              placeholder="Search city, locality or property"
              placeholderTextColor={colors.textSecondary}
              style={styles.searchInput}
              value={query}
            />
          </View>
          <Pressable
            onPress={() => navigation.navigate(ROUTES.home.propertyFilter)}
            style={styles.filterButton}
          >
            <Icon color={colors.textPrimary} name="options-outline" size={20} />
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.filterContent}
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          {PROPERTY_CATEGORIES.map(category => (
            <Pressable
              key={category}
              onPress={() =>
                navigation.navigate(ROUTES.home.propertyListing, {
                  category,
                  query,
                })
              }
              style={[
                styles.filterChip,
                category === 'All' ? styles.filterChipActive : null,
              ]}
            >
              <Text
                style={[
                  styles.filterChipText,
                  category === 'All' ? styles.filterChipTextActive : null,
                ]}
              >
                {category}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <ImageBackground
          imageStyle={styles.bannerImage}
          resizeMode="cover"
          source={require('@/assets/images/home1.jpg')}
          style={styles.heroBanner}
        >
          <View style={styles.bannerScrim} />
          <View style={styles.bannerCopy}>
            <Text style={styles.bannerTitle}>
              Find verified property near you
            </Text>
            <Text style={styles.bannerSubtitle}>
              Buy, sell or construction-deveopment trusted properties in your
              city
            </Text>
            <Pressable
              onPress={() =>
                navigation.navigate(ROUTES.home.propertyListing, { query })
              }
              style={styles.exploreButton}
            >
              <Text style={styles.exploreText}>Explore Now</Text>
            </Pressable>
          </View>
        </ImageBackground>

        <SectionTitle
          actionLabel="View All"
          onAction={() =>
            navigation.navigate(ROUTES.home.propertyListing, { query })
          }
          title="Browse by Category"
        />
        <ScrollView
          contentContainerStyle={styles.categoryContent}
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          {PROPERTY_TYPES.map(type => (
            <HomeCategory
              icon={categoryIcons[type]}
              key={type}
              onPress={() => {
                setFilters({
                  search: query,
                  propertyType: type,
                });
                navigation.navigate(ROUTES.home.propertyListing, {
                  query,
                });
              }}
              title={type}
            />
          ))}
        </ScrollView>

        <SectionTitle
          actionLabel="View All"
          onAction={() =>
            navigation.navigate(ROUTES.home.propertyListing, { query })
          }
          title="Featured Properties"
        />
        {featured.length ? (
          <ScrollView
            contentContainerStyle={styles.propertyContent}
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            {featured.map(renderPropertyCard)}
          </ScrollView>
        ) : (
          <Text style={styles.emptyCopy}>
            No featured properties match your search.
          </Text>
        )}

        <SectionTitle
          actionLabel="See More"
          onAction={() =>
            navigation.navigate(ROUTES.home.propertyListing, { query })
          }
          title="Latest Properties"
        />
        <ScrollView
          contentContainerStyle={styles.propertyContent}
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          {latest.map(renderPropertyCard)}
        </ScrollView>

        <BannerCard
          ctaLabel="Open Services"
          description="Estimate costs and request a final quote from the services hub."
          icon="construct-outline"
          onPress={() =>
            tabNavigation?.navigate(ROUTES.tabs.servicesStack, {
              screen: ROUTES.services.constructionDashboard,
            })
          }
          title="Construction Services"
        />
        <BannerCard
          ctaLabel="Request Verification"
          description="Raise a legal verification request directly from the services module."
          icon="shield-checkmark-outline"
          onPress={() =>
            tabNavigation?.navigate(ROUTES.tabs.servicesStack, {
              screen: ROUTES.services.legalServicesDashboard,
            })
          }
          title="Legal Verification"
        />
        <BannerCard
          ctaLabel="Calculate EMI"
          description="Check affordability and continue into the loan workflow."
          icon="cash-outline"
          onPress={() =>
            tabNavigation?.navigate(ROUTES.tabs.servicesStack, {
              screen: ROUTES.services.loanCalculator,
            })
          }
          title="Loan Calculator"
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionTitle({
  title,
  actionLabel,
  onAction,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {actionLabel ? (
        <Pressable onPress={onAction}>
          <Text style={styles.sectionAction}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function HomeCategory({
  icon,
  title,
  onPress,
}: {
  icon: string;
  title: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.categoryItem}>
      <View style={styles.categoryIconWrap}>
        <Icon color={colors.iconPurple} name={icon} size={20} />
      </View>
      <Text numberOfLines={2} style={styles.categoryTitle}>
        {title}
      </Text>
    </Pressable>
  );
}

function HomePropertyCard({
  property,
  width,
  isSaved,
  onPress,
  onToggleSave,
  onShare,
  onCall,
  onWhatsApp,
}: {
  property: Property;
  width: number;
  isSaved?: boolean;
  onPress?: () => void;
  onToggleSave?: () => void;
  onShare?: () => void;
  onCall?: () => void;
  onWhatsApp?: () => void;
}) {
  return (
    <View style={[styles.propertyCard, { width }]}>
      <Pressable onPress={onPress}>
        <Image
          resizeMode="cover"
          source={getPropertyImage(property.id)}
          style={styles.propertyImage}
        />
        <Pressable onPress={onToggleSave} style={styles.saveButton}>
          <Icon
            color={isSaved ? colors.brandPurple : colors.textPrimary}
            name={isSaved ? 'heart' : 'heart-outline'}
            size={18}
          />
        </Pressable>
        {property.verified ? (
          <View style={styles.verifiedBadge}>
            <Icon color={colors.homeGreen} name="checkmark-circle" size={13} />
            <Text style={styles.verifiedText}>Verified</Text>
          </View>
        ) : null}
      </Pressable>
      <View style={styles.propertyBody}>
        <Text numberOfLines={1} style={styles.propertyTitle}>
          {property.title}
        </Text>
        <Text numberOfLines={1} style={styles.propertyMeta}>
          {property.location.area}, {property.location.city}
        </Text>
        <Text style={styles.propertyPrice}>
          {formatCurrency(property.price)}
        </Text>
        <Text style={styles.propertyMeta}>
          {property.areaSqFt} sq ft | {property.propertyType}
        </Text>
        <View style={styles.propertyActions}>
          <PropertyAction icon="call-outline" onPress={onCall} />
          <PropertyAction icon="logo-whatsapp" onPress={onWhatsApp} />
          <PropertyAction icon="share-social-outline" onPress={onShare} />
        </View>
      </View>
    </View>
  );
}

function PropertyAction({
  icon,
  onPress,
}: {
  icon: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      disabled={!onPress}
      onPress={onPress}
      style={styles.actionButton}
    >
      <Icon color={colors.brandPurple} name={icon} size={15} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
    paddingTop: spacing.sm,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  locationButton: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    minHeight: 40,
  },
  locationText: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
  },
  headerActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  iconButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.roleCardBorder,
    borderRadius: 18,
    borderWidth: 1,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  notificationDot: {
    backgroundColor: colors.notification,
    borderColor: colors.surface,
    borderRadius: 5,
    borderWidth: 1,
    height: 10,
    position: 'absolute',
    right: 7,
    top: 6,
    width: 10,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: colors.brandPurpleSoft,
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  avatarText: {
    color: colors.brandPurple,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
  },
  greeting: {
    marginTop: spacing.md,
  },
  greetingText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  roleText: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    marginTop: spacing.xs,
  },
  searchRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  searchBox: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.roleCardBorder,
    borderRadius: spacing.radiusMd,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    minHeight: 48,
    paddingHorizontal: spacing.md,
  },
  searchInput: {
    color: colors.textPrimary,
    flex: 1,
    fontSize: typography.fontSize.sm,
    minWidth: 0,
    paddingHorizontal: spacing.sm,
    paddingVertical: 0,
  },
  filterButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.roleCardBorder,
    borderRadius: spacing.radiusMd,
    borderWidth: 1,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  filterContent: {
    gap: spacing.sm,
    paddingTop: spacing.lg,
  },
  filterChip: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.roleCardBorder,
    borderRadius: 999,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 34,
    paddingHorizontal: spacing.lg,
  },
  filterChipActive: {
    backgroundColor: colors.brandPurple,
    borderColor: colors.brandPurple,
  },
  filterChipText: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },
  filterChipTextActive: {
    color: colors.white,
  },
  heroBanner: {
    borderRadius: spacing.radiusXl,
    height: 164,
    justifyContent: 'center',
    marginTop: spacing.lg,
    overflow: 'hidden',
  },
  bannerImage: {
    borderRadius: spacing.radiusXl,
  },
  bannerScrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.overlay,
  },
  bannerCopy: {
    maxWidth: 210,
    paddingLeft: spacing.xl,
  },
  bannerTitle: {
    color: colors.white,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    lineHeight: typography.lineHeight.lg,
  },
  bannerSubtitle: {
    color: colors.textOnPrimarySoft,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
    lineHeight: typography.lineHeight.xs,
    marginTop: spacing.xs,
  },
  exploreButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: 999,
    justifyContent: 'center',
    marginTop: spacing.sm,
    minHeight: 34,
    paddingHorizontal: spacing.lg,
  },
  exploreText: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xl,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
  },
  sectionAction: {
    color: colors.brandPurple,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },
  categoryContent: {
    gap: spacing.lg,
    paddingTop: spacing.lg,
  },
  categoryItem: {
    alignItems: 'center',
    width: 63,
  },
  categoryIconWrap: {
    alignItems: 'center',
    backgroundColor: colors.brandPurpleSubtle,
    borderColor: colors.brandPurpleSoft,
    borderRadius: 18,
    borderWidth: 1,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  categoryTitle: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semiBold,
    lineHeight: typography.lineHeight.xs,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  propertyContent: {
    gap: spacing.md,
    paddingTop: spacing.md,
  },
  propertyCard: {
    backgroundColor: colors.surface,
    borderColor: colors.roleCardBorder,
    borderRadius: spacing.radiusLg,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: colors.homeCardShadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 3,
  },
  propertyImage: {
    height: 104,
    width: '100%',
  },
  saveButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 15,
    height: 30,
    justifyContent: 'center',
    position: 'absolute',
    right: spacing.sm,
    top: spacing.sm,
    width: 30,
  },
  verifiedBadge: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 999,
    bottom: spacing.sm,
    flexDirection: 'row',
    gap: spacing.xs,
    left: spacing.sm,
    minHeight: 24,
    paddingHorizontal: spacing.sm,
    position: 'absolute',
  },
  verifiedText: {
    color: colors.homeGreen,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },
  propertyBody: {
    gap: spacing.xs,
    padding: spacing.md,
  },
  propertyTitle: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
  },
  propertyMeta: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.xs,
  },
  propertyPrice: {
    color: colors.brandPurple,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
  },
  propertyActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  actionButton: {
    alignItems: 'center',
    backgroundColor: colors.brandPurpleSoft,
    borderRadius: 14,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  emptyCopy: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    marginTop: spacing.md,
  },
});
