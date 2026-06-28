import React, {useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';

import {
  AppButton,
  AppHeader,
  BannerCard,
  ConfirmationModal,
  EmptyState,
  ScreenContainer,
  SectionHeader,
  ServiceCard,
  StatCard,
  StatusChip,
} from '@/components';
import {colors} from '@/constants/colors';
import {ROUTES} from '@/constants/routes';
import {spacing} from '@/constants/spacing';
import {typography} from '@/constants/typography';
import {useConstructionStore} from '@/store/constructionStore';
import type {ConstructionRequest, ServicesStackParamList} from '@/types';
import {formatCurrency} from '@/utils/formatCurrency';
import {shareConstructionQuote} from '@/utils/constructionActions';
import {formatDate} from '@/utils/dateUtils';
import {showToast} from '@/utils/toast';

type Props = NativeStackScreenProps<
  ServicesStackParamList,
  'ConstructionDashboard'
>;

export function ConstructionDashboardScreen({navigation}: Props) {
  const packages = useConstructionStore(state => state.packages);
  const quotes = useConstructionStore(state => state.quotes);
  const requests = useConstructionStore(state => state.requests);
  const deleteRequest = useConstructionStore(state => state.deleteRequest);
  const shortlistedSuppliers = useConstructionStore(
    state => state.shortlistedSupplierIds.length,
  );
  const shortlistedContractors = useConstructionStore(
    state => state.shortlistedContractorIds.length,
  );
  const [deleteTarget, setDeleteTarget] = useState<ConstructionRequest | null>(
    null,
  );

  const latestQuote = quotes[0];
  const latestRequest = requests[0];

  return (
    <ScreenContainer>
      <AppHeader
        title="Construction Services"
        subtitle="Packages, calculator, quotations, materials and directory"
        onBackPress={navigation.goBack}
      />
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Plan your build before you spend.</Text>
        <Text style={styles.heroCopy}>
          Compare packages, estimate total cost, save quotations, and contact
          shortlisted suppliers and contractors.
        </Text>
        <AppButton
          label="Start Estimate"
          onPress={() => navigation.navigate(ROUTES.services.constructionCostCalculator)}
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
      <SectionHeader title="Construction Tools" />
      <View style={styles.grid}>
        <ServiceCard
          description="Compare inclusions and per-sq-ft pricing"
          icon="layers-outline"
          onPress={() => navigation.navigate(ROUTES.services.houseConstructionPackages)}
          title="Packages"
        />
        <ServiceCard
          description="Calculate a local build estimate"
          icon="calculator-outline"
          onPress={() => navigation.navigate(ROUTES.services.constructionCostCalculator)}
          title="Cost Calculator"
        />
        <ServiceCard
          description="Browse recommended brands and specs"
          icon="flask-outline"
          onPress={() => navigation.navigate(ROUTES.services.materialInformation)}
          title="Materials"
        />
        <ServiceCard
          description="Call and shortlist local supply partners"
          icon="storefront-outline"
          onPress={() => navigation.navigate(ROUTES.services.supplierDirectory)}
          title="Suppliers"
        />
        <ServiceCard
          description="Discover contractors by city and experience"
          icon="people-outline"
          onPress={() => navigation.navigate(ROUTES.services.contractorDirectory)}
          title="Contractors"
        />
        <ServiceCard
          description="Architect discovery placeholder using local contractor data"
          icon="business-outline"
          onPress={() => {
            showToast(
              'Architect discovery is routed through the contractor directory for static workflow testing.',
            );
            navigation.navigate(ROUTES.services.contractorDirectory);
          }}
          title="Architects"
        />
        <ServiceCard
          description="Interior designer discovery placeholder using local supplier data"
          icon="color-palette-outline"
          onPress={() => {
            showToast(
              'Interior designer discovery is routed through supplier partners for static workflow testing.',
            );
            navigation.navigate(ROUTES.services.supplierDirectory);
          }}
          title="Interior Designers"
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
                {latestQuote.builtUpAreaSqFt} sq ft x {latestQuote.floors} floors
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
            <AppButton
              label="Delete Request"
              onPress={() => setDeleteTarget(latestRequest)}
              style={styles.button}
              variant="danger"
            />
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
        description="Use recommended materials first, then shortlist matching suppliers."
        icon="construct-outline"
        onPress={() => navigation.navigate(ROUTES.services.materialInformation)}
        title="Material Planning"
      />
      <ConfirmationModal
        confirmLabel="Delete"
        message={
          deleteTarget
            ? `Delete the local request for ${deleteTarget.customerName}?`
            : 'Delete this quotation request?'
        }
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            deleteRequest(deleteTarget.id);
            showToast('Construction request deleted locally.');
          }
          setDeleteTarget(null);
        }}
        title="Delete Construction Request"
        visible={Boolean(deleteTarget)}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.primary,
    borderRadius: spacing.radiusXl,
    padding: spacing.xl,
    gap: spacing.md,
  },
  heroTitle: {
    color: colors.white,
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
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
