import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';

import {
  AppHeader,
  EmptyState,
  ScreenContainer,
} from '@/components';
import {colors} from '@/constants/colors';
import {ROUTES} from '@/constants/routes';
import {spacing} from '@/constants/spacing';
import {typography} from '@/constants/typography';
import {useConstructionStore} from '@/store/constructionStore';
import type {ServicesStackParamList} from '@/types';
import {showToast} from '@/utils/toast';

type Props = NativeStackScreenProps<ServicesStackParamList, 'ServicesDashboard'>;

export function ServicesDashboardScreen({navigation}: Props) {
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
        <Text style={styles.searchText}>Search services</Text>
      </View>

      <ServiceGroup title="Construction Services">
        <ServiceTile
          icon="construct-outline"
          onPress={() => navigation.navigate(ROUTES.services.constructionDashboard)}
          title="Construction Services"
        />
        <ServiceTile
          icon="home-outline"
          onPress={() => navigation.navigate(ROUTES.services.houseConstructionPackages)}
          title="House Construction"
        />
        <ServiceTile
          icon="calculator-outline"
          onPress={() => navigation.navigate(ROUTES.services.constructionCostCalculator)}
          title="Cost Calculator"
        />
        <ServiceTile
          icon="storefront-outline"
          onPress={() => navigation.navigate(ROUTES.services.supplierDirectory)}
          title="Material Suppliers"
        />
        <ServiceTile
          icon="people-outline"
          onPress={() => navigation.navigate(ROUTES.services.contractorDirectory)}
          title="Contractors"
        />
      </ServiceGroup>

      <ServiceGroup title="Finance Services">
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
          onPress={() => navigation.navigate(ROUTES.services.loanRequestTracking)}
          title="Loan Requests"
        />
      </ServiceGroup>

      <ServiceGroup title="Legal Services">
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
          onPress={() => navigation.navigate(ROUTES.services.legalRequestTracking)}
          title="Legal Requests"
        />
      </ServiceGroup>

      <ServiceGroup title="Support">
        <ServiceTile
          icon="chatbubble-ellipses-outline"
          onPress={() => navigation.navigate(ROUTES.services.supportDashboard)}
          title="Support Tickets"
        />
        <ServiceTile
          icon="business-outline"
          onPress={() => {
            showToast(
              'Architect partner discovery will be connected during API integration. Use Contractors for local workflow testing.',
            );
            navigation.navigate(ROUTES.services.contractorDirectory);
          }}
          title="Architects"
        />
        <ServiceTile
          icon="color-palette-outline"
          onPress={() => {
            showToast(
              'Interior designer discovery will be connected during API integration. Use Suppliers and Contractors for local workflow testing.',
            );
            navigation.navigate(ROUTES.services.supplierDirectory);
          }}
          title="Interior Designers"
        />
      </ServiceGroup>

      <Text style={styles.activityText}>
        {quotes.length} saved quotes | {requests.length} quote requests |{' '}
        {shortlistedPartners} shortlisted partners
      </Text>
      {!quotes.length && !requests.length ? (
        <EmptyState
          description="Open construction, finance, legal or support to start local service workflows."
          title="No service activity yet"
        />
      ) : null}
    </ScreenContainer>
  );
}

function ServiceGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.group}>
      <Text style={styles.groupTitle}>{title}</Text>
      <View style={styles.grid}>{children}</View>
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
    <Pressable onPress={onPress} style={styles.tile}>
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
  searchText: {
    color: colors.textSecondary,
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
    width: '17.6%',
    minHeight: 76,
    alignItems: 'center',
    gap: spacing.sm,
  },
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
    shadowOffset: {width: 0, height: 6},
    elevation: 1,
  },
  tileTitle: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.vs,
    fontWeight: typography.fontWeight.bold,
    textAlign: 'center',
  },
  activityText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.xs,
    marginTop: -spacing.md,
  },
});
