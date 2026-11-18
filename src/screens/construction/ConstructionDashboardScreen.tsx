import { useRemoteLoad } from '@/hooks/useRemoteFlow';
import { RemoteStatus } from '@/components/common/RemoteStatus';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import {
  AppButton,
  AppHeader,
  BannerCard,
  EmptyState,
  ScreenContainer,
  SectionHeader,
  ServiceCard,
  StatCard,
  StatusChip,
} from '@/components';
import { colors } from '@/constants/colors';
import { ROUTES } from '@/constants/routes';
import { spacing } from '@/constants/spacing';
import { typography } from '@/constants/typography';
import { useConstructionStore } from '@/store/constructionStore';
import type { ServicesStackParamList } from '@/types';
import { formatCurrency } from '@/utils/formatCurrency';
import { shareConstructionQuote } from '@/utils/constructionActions';
import { formatDate } from '@/utils/dateUtils';

type Props = NativeStackScreenProps<
  ServicesStackParamList,
  'ConstructionDashboard'
>;

export function ConstructionDashboardScreen({ navigation }: Props) {
  const loadRemote = useConstructionStore(state => state.load);
  const remoteLoading = useConstructionStore(state => state.loading);
  const remoteError = useConstructionStore(state => state.error);
  useRemoteLoad(loadRemote);

  const packages = useConstructionStore(state => state.packages);
  const quotes = useConstructionStore(state => state.quotes);
  const requests = useConstructionStore(state => state.requests);
  const shortlistedSuppliers = useConstructionStore(
    state => state.shortlistedSupplierIds.length,
  );
  const shortlistedContractors = useConstructionStore(
    state => state.shortlistedContractorIds.length,
  );

  const latestQuote = quotes[0];
  const latestRequest = requests[0];

  return (
    <ScreenContainer>
      <RemoteStatus
        loading={remoteLoading}
        error={remoteError}
        retry={() => {
          void loadRemote().catch(() => {});
        }}
      />
      <AppHeader
        title="Construction Services"
        subtitle="Customer construction requests and service tools"
        onBackPress={navigation.goBack}
      />
      <View style={styles.hero}>
        <Text style={styles.heroEyebrow}>CUSTOMER CONSTRUCTION</Text>
        <Text style={styles.heroTitle}>Plan your build with 1SQUARE.</Text>
        <Text style={styles.heroCopy}>
          Share your requirements with eligible Builders, or use the separate
          construction service tools below.
        </Text>
        <AppButton
          label="Request Builder Quotes"
          onPress={() =>
            navigation
              .getParent<any>()
              ?.navigate(ROUTES.tabs.homeStack, {
                screen: ROUTES.home.constructionRequirement,
                params: {},
              })
          }
        />
        <AppButton
          label="Start Estimate"
          onPress={() =>
            navigation.navigate(ROUTES.services.constructionCostCalculator)
          }
          variant="secondary"
        />
      </View>
      <View style={styles.stats}>
        <StatCard label="Packages" value={packages.length} />
        <StatCard label="Saved Quotes" value={quotes.length} />
        <StatCard label="Quote Requests" value={requests.length} />
        <StatCard
          label="Shortlisted Partners"
          value={shortlistedSuppliers + shortlistedContractors}
        />
      </View>
      <SectionHeader title="Construction Service Tools" />
      <View style={styles.grid}>
        <ServiceCard
          description="Browse packages returned by the construction service catalogue"
          icon="layers-outline"
          onPress={() =>
            navigation.navigate(ROUTES.services.houseConstructionPackages)
          }
          title="Packages"
        />
        <ServiceCard
          description="Request an estimate from the construction calculator service"
          icon="calculator-outline"
          onPress={() =>
            navigation.navigate(ROUTES.services.constructionCostCalculator)
          }
          title="Cost Calculator"
        />
        <ServiceCard
          description="Open the material catalogue when verified data is available"
          icon="flask-outline"
          onPress={() =>
            navigation.navigate(ROUTES.services.materialInformation)
          }
          title="Materials"
        />
        <ServiceCard
          description="Search and shortlist suppliers with available contact data"
          icon="storefront-outline"
          onPress={() => navigation.navigate(ROUTES.services.supplierDirectory)}
          title="Suppliers"
        />
        <ServiceCard
          description="Browse the legacy construction contractor directory"
          icon="people-outline"
          onPress={() =>
            navigation.navigate(ROUTES.services.contractorDirectory)
          }
          title="Contractors"
        />
      </View>
      <SectionHeader title="Latest Quote" />
      {latestQuote ? (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.copy}>
              <Text style={styles.cardTitle}>
                {formatCurrency(latestQuote.totalCost)}
              </Text>
              <Text style={styles.cardMeta}>
                {latestQuote.builtUpAreaSqFt} sq ft x {latestQuote.floors}{' '}
                floors
              </Text>
            </View>
            <StatusChip label={latestQuote.quality} />
          </View>
          <Text style={styles.cardMeta}>
            Estimated timeline: {latestQuote.estimatedTimelineMonths} months
          </Text>
          <Text style={styles.cardMeta}>
            Saved on {formatDate(latestQuote.createdAt)}
          </Text>
          <View style={styles.row}>
            <AppButton
              label="View Result"
              onPress={() =>
                navigation.navigate(ROUTES.services.quotationResult, {
                  quoteId: latestQuote.id,
                })
              }
              style={styles.button}
            />
            <AppButton
              label="Share"
              onPress={() => {
                void shareConstructionQuote(latestQuote);
              }}
              style={styles.button}
              variant="outlined"
            />
          </View>
        </View>
      ) : (
        <EmptyState
          description="Run the calculator to save your first quotation locally."
          title="No construction quote yet"
        />
      )}
      <SectionHeader title="Latest Quote Request" />
      {latestRequest ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{latestRequest.customerName}</Text>
          <Text style={styles.cardMeta}>
            {latestRequest.location.area}, {latestRequest.location.city}
          </Text>
          <Text style={styles.cardMeta}>{latestRequest.mobile}</Text>
          <StatusChip label={latestRequest.history[0]?.status ?? 'Submitted'} />
          <View style={styles.row}>
            {latestRequest.quoteId ? (
              <AppButton
                label="View Estimate"
                onPress={() =>
                  navigation.navigate(ROUTES.services.quotationResult, {
                    quoteId: latestRequest.quoteId as string,
                  })
                }
                style={styles.button}
                variant="outlined"
              />
            ) : null}
          </View>
        </View>
      ) : (
        <EmptyState
          description="Saved quotation requests will appear here."
          title="No quotation request yet"
        />
      )}
      <BannerCard
        ctaLabel="Browse Materials"
        description="Check whether material catalogue data is available, then browse listed suppliers."
        icon="construct-outline"
        onPress={() => navigation.navigate(ROUTES.services.materialInformation)}
        title="Material Catalogue"
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.darkPurple,
    borderRadius: spacing.radiusXl,
    padding: spacing.xl,
    gap: spacing.md,
  },
  heroTitle: {
    color: colors.white,
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
  },
  heroEyebrow: {
    color: colors.accent,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: 1,
  },
  heroCopy: {
    color: colors.textOnPrimaryMuted,
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.sm,
  },
  stats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: spacing.radiusXl,
    padding: spacing.xl,
    gap: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
  },
  cardTitle: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
  },
  cardMeta: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  button: {
    flex: 1,
  },
});
