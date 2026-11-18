import React, {useState} from 'react';
import {Pressable, StyleSheet, Text, TextInput, View} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';

import { AppHeader, EmptyState, ScreenContainer } from '@/components';
import { colors } from '@/constants/colors';
import { ROUTES } from '@/constants/routes';
import { spacing } from '@/constants/spacing';
import { typography } from '@/constants/typography';
import { useConstructionStore } from '@/store/constructionStore';
import type { ServicesStackParamList } from '@/types';

type Props = NativeStackScreenProps<
  ServicesStackParamList,
  'ServicesDashboard'
>;

export function ServicesDashboardScreen({ navigation }: Props) {
  const [query, setQuery] = useState('');
  const quotes = useConstructionStore(state => state.quotes);
  const requests = useConstructionStore(state => state.requests);
  const shortlistedPartners =
    useConstructionStore(state => state.shortlistedSupplierIds.length) +
    useConstructionStore(state => state.shortlistedContractorIds.length);

  return (
    <ScreenContainer>
      <AppHeader title="Services" />
      <View style={styles.searchBox}>
        <Icon color={colors.textSecondary} name="search-outline" size={18} />
        <TextInput value={query} onChangeText={setQuery} placeholder="Search services" placeholderTextColor={colors.textSecondary} style={styles.searchInput} returnKeyType="search" />
      </View>

      <ServiceGroup title="Construction Services" filterText={query}>
        <ServiceTile
          icon="construct-outline"
          onPress={() =>
            navigation
              .getParent<any>()
              ?.navigate(ROUTES.tabs.homeStack, {
                screen: ROUTES.home.constructionRequirement,
                params: {},
              })
          }
          title="Construction Services"
        />
        <ServiceTile
          icon="home-outline"
          onPress={() =>
            navigation.navigate(ROUTES.services.houseConstructionPackages)
          }
          title="House Construction"
        />
        <ServiceTile
          icon="calculator-outline"
          onPress={() =>
            navigation.navigate(ROUTES.services.constructionCostCalculator)
          }
          title="Cost Calculator"
        />
        <ServiceTile
          icon="storefront-outline"
          onPress={() => navigation.navigate(ROUTES.services.supplierDirectory)}
          title="Material Suppliers"
        />
        <ServiceTile
          icon="people-outline"
          onPress={() =>
            navigation.navigate(ROUTES.services.contractorDirectory)
          }
          title="Contractors"
        />
      </ServiceGroup>

      <ServiceGroup title="Finance Services" filterText={query}>
        <ServiceTile
          icon="cash-outline"
          onPress={() => navigation.navigate(ROUTES.services.loanCalculator)}
          title="Loan Calculator"
        />
        <ServiceTile
          icon="card-outline"
          onPress={() => navigation.navigate(ROUTES.services.loanMarketplace)}
          title="Loan Marketplace"
        />
        <ServiceTile
          icon="document-text-outline"
          onPress={() =>
            navigation.navigate(ROUTES.services.loanRequestTracking)
          }
          title="Loan Requests"
        />
      </ServiceGroup>

      <ServiceGroup title="Legal Services" filterText={query}>
        <ServiceTile
          icon="shield-outline"
          onPress={() =>
            navigation.navigate(ROUTES.services.propertyVerificationRequest)
          }
          title="Property Verification"
        />
        <ServiceTile
          icon="document-outline"
          onPress={() =>
            navigation.navigate(ROUTES.services.propertyRegistrationRequest)
          }
          title="Property Registration"
        />
        <ServiceTile
          icon="documents-outline"
          onPress={() =>
            navigation.navigate(ROUTES.services.legalRequestTracking)
          }
          title="Legal Requests"
        />
      </ServiceGroup>

      <ServiceGroup title="Support" filterText={query}>
        <ServiceTile
          icon="chatbubble-ellipses-outline"
          onPress={() => navigation.navigate(ROUTES.services.supportDashboard)}
          title="Support Tickets"
        />
        <ServiceTile
          icon="business-outline"
          onPress={() =>
            navigation.navigate(ROUTES.services.contractorDirectory, {
              serviceType: 'architect',
              title: 'Architects',
            })
          }
          title="Architects"
        />
        <ServiceTile
          icon="color-palette-outline"
          onPress={() =>
            navigation.navigate(ROUTES.services.contractorDirectory, {
              serviceType: 'interior-designer',
              title: 'Interior Designers',
            })
          }
          title="Interior Designers"
        />
      </ServiceGroup>

      <Text style={styles.activityText}>
        {quotes.length} saved quotes | {requests.length} quote requests |{' '}
        {shortlistedPartners} shortlisted partners
      </Text>
      {query.trim() && !SERVICE_TITLES.some(title => title.toLowerCase().includes(query.trim().toLowerCase())) ? (
        <EmptyState description="Try another service name." title="No services found" />
      ) : null}
      {!query.trim() && !quotes.length && !requests.length ? (
        <EmptyState
          description="Open construction, finance, legal or support to submit a service request."
          title="No service activity yet"
        />
      ) : null}
    </ScreenContainer>
  );
}

function ServiceGroup({
  title,
  children,
  filterText,
}: {
  title: string;
  children: React.ReactNode;
  filterText: string;
}) {
  const normalizedQuery = filterText.trim().toLowerCase();
  const visibleItems = React.Children.toArray(children).filter(child =>
    React.isValidElement<{title: string}>(child) && child.props.title.toLowerCase().includes(normalizedQuery),
  );
  if (!visibleItems.length) return null;
  return (
    <View style={styles.group}>
      <Text style={styles.groupTitle}>{title}</Text>
      <View style={styles.grid}>{visibleItems}</View>
    </View>
  );
}

function ServiceTile({
  icon,
  title,
  onPress,
}: {
  icon: string;
  title: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({pressed}) => [styles.tile, pressed && styles.tilePressed]}>
      <View style={styles.tileIcon}>
        <Icon color={colors.primary} name={icon} size={18} />
      </View>
      <Text style={styles.tileTitle}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  searchBox: {
    minHeight: 44,
    borderRadius: spacing.radiusMd,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    marginTop: -spacing.md,
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 0,
    color: colors.textPrimary,
    fontSize: typography.fontSize.sm,
  },
  group: {
    gap: spacing.md,
  },
  groupTitle: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
  },
  tile: {
    width: '29%',
    minHeight: 98,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: spacing.radiusMd,
    borderWidth: 1,
    borderColor: colors.roleCardBorder,
    backgroundColor: colors.surface,
  },
  tilePressed: {opacity: 0.78, transform: [{scale: 0.98}]},
  tileIcon: {
    width: 44,
    height: 44,
    borderRadius: spacing.radiusMd,
    backgroundColor: colors.brandPurpleSubtle,
    borderWidth: 1,
    borderColor: colors.divider,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 1,
  },
  tileTitle: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.vs,
    fontWeight: typography.fontWeight.bold,
    textAlign: 'center',
    lineHeight: typography.lineHeight.xs,
  },
  activityText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.xs,
    marginTop: -spacing.md,
  },
});

const SERVICE_TITLES = [
  'Construction Services', 'House Construction', 'Cost Calculator',
  'Material Suppliers', 'Contractors', 'Loan Calculator', 'Loan Marketplace',
  'Loan Requests', 'Property Verification', 'Property Registration',
  'Legal Requests', 'Support Tickets', 'Architects', 'Interior Designers',
];
