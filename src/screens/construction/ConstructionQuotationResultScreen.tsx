import React, {useMemo, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';

import {
  AppButton,
  AppHeader,
  ConfirmationModal,
  EmptyState,
  ScreenContainer,
  SectionHeader,
  StatusChip,
} from '@/components';
import {colors} from '@/constants/colors';
import {ROUTES} from '@/constants/routes';
import {spacing} from '@/constants/spacing';
import {typography} from '@/constants/typography';
import {useAuthStore} from '@/store/authStore';
import {useConstructionStore} from '@/store/constructionStore';
import type {ServicesStackParamList} from '@/types';
import {shareConstructionQuote} from '@/utils/constructionActions';
import {formatDate} from '@/utils/dateUtils';
import {formatCurrency} from '@/utils/formatCurrency';
import {showToast} from '@/utils/toast';

type Props = NativeStackScreenProps<ServicesStackParamList, 'QuotationResult'>;

export function ConstructionQuotationResultScreen({
  navigation,
  route,
}: Props) {
  const user = useAuthStore(state => state.user);
  const quotes = useConstructionStore(state => state.quotes);
  const packages = useConstructionStore(state => state.packages);
  const requests = useConstructionStore(state => state.requests);
  const addRequest = useConstructionStore(state => state.addRequest);
  const deleteQuote = useConstructionStore(state => state.deleteQuote);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const quote = quotes.find(item => item.id === route.params.quoteId);
  const relatedRequests = useMemo(
    () => requests.filter(item => item.quoteId === route.params.quoteId),
    [requests, route.params.quoteId],
  );
  const matchingPackage = packages.find(item => item.name === quote?.quality);

  if (!quote) {
    return (
      <ScreenContainer>
        <AppHeader title="Quotation Result" onBackPress={navigation.goBack} />
        <EmptyState
          description="The selected construction quote is not available locally."
          title="Quote not found"
        />
      </ScreenContainer>
    );
  }

  const handleRequestQuote = () => {
    if (relatedRequests.length) {
      showToast('A detailed quotation request already exists for this estimate.');
      return;
    }

    const created = addRequest({
      customerName: user?.name ?? 'UrbanKart User',
      mobile: user?.mobile ?? '9998887776',
      location: {
        city: user?.city ?? 'Lucknow',
        state: 'Uttar Pradesh',
        area: `${quote.quality} construction`,
      },
      quoteId: quote.id,
      documents: [],
    });

    showToast(`Detailed quotation request saved for ${created.location.city}.`);
  };

  return (
    <ScreenContainer>
      <AppHeader
        title="Quotation Result"
        subtitle="Saved locally from the construction calculator"
        onBackPress={navigation.goBack}
      />
      <View style={styles.hero}>
        <Text style={styles.heroLabel}>Estimated total</Text>
        <Text style={styles.heroValue}>{formatCurrency(quote.totalCost)}</Text>
        <Text style={styles.heroCopy}>
          {quote.builtUpAreaSqFt} sq ft x {quote.floors} floors | Saved on{' '}
          {formatDate(quote.createdAt)}
        </Text>
        <View style={styles.chips}>
          <StatusChip label={quote.quality} />
          <StatusChip label={`${quote.estimatedTimelineMonths} months`} />
        </View>
      </View>
      <View style={styles.card}>
        <SectionHeader title="Cost Breakdown" />
        <DetailRow label="Plot Size" value={`${quote.plotSizeSqFt} sq ft`} />
        <DetailRow
          label="Built-Up Area"
          value={`${quote.builtUpAreaSqFt} sq ft`}
        />
        <DetailRow label="Floors" value={String(quote.floors)} />
        <DetailRow
          label="Material Cost"
          value={formatCurrency(quote.materialCost)}
        />
        <DetailRow
          label="Labour Cost"
          value={formatCurrency(quote.labourCost)}
        />
        <DetailRow label="Total Cost" value={formatCurrency(quote.totalCost)} />
      </View>
      {matchingPackage ? (
        <View style={styles.card}>
          <SectionHeader title="Matched Package" />
          <Text style={styles.packageTitle}>{matchingPackage.name}</Text>
          <Text style={styles.bodyText}>{matchingPackage.materialQuality}</Text>
          <Text style={styles.bodyText}>
            Rate used: {formatCurrency(matchingPackage.costPerSqFt)} / sq ft
          </Text>
        </View>
      ) : null}
      <View style={styles.card}>
        <SectionHeader title="Quotation Actions" />
        <View style={styles.row}>
          <AppButton
            label="Share Estimate"
            onPress={() => {
              void shareConstructionQuote(quote);
            }}
            style={styles.button}
            variant="outlined"
          />
          <AppButton
            label="Request Detailed Quote"
            onPress={handleRequestQuote}
            style={styles.button}
          />
        </View>
        <View style={styles.row}>
          <AppButton
            label="Materials"
            onPress={() => navigation.navigate(ROUTES.services.materialInformation)}
            style={styles.button}
            variant="outlined"
          />
          <AppButton
            label="Suppliers"
            onPress={() => navigation.navigate(ROUTES.services.supplierDirectory)}
            style={styles.button}
            variant="outlined"
          />
        </View>
        <AppButton
          label="Find Contractors"
          onPress={() => navigation.navigate(ROUTES.services.contractorDirectory)}
          variant="outlined"
        />
      </View>
      <View style={styles.card}>
        <SectionHeader title="Request Status" />
        {relatedRequests.length ? (
          relatedRequests.map(request => (
            <View key={request.id} style={styles.requestItem}>
              <Text style={styles.requestTitle}>{request.customerName}</Text>
              <Text style={styles.bodyText}>
                {request.location.area}, {request.location.city}
              </Text>
              <StatusChip label={request.history[0]?.status ?? 'Submitted'} />
            </View>
          ))
        ) : (
          <Text style={styles.bodyText}>
            No detailed quotation request has been raised from this estimate yet.
          </Text>
        )}
      </View>
      <AppButton
        label="Delete Quote"
        onPress={() => setShowDeleteConfirm(true)}
        variant="danger"
      />
      <ConfirmationModal
        confirmLabel="Delete"
        message="Delete this local construction quote and its linked requests?"
        onCancel={() => setShowDeleteConfirm(false)}
        onConfirm={() => {
          deleteQuote(quote.id);
          setShowDeleteConfirm(false);
          showToast('Construction quote deleted locally.');
          navigation.goBack();
        }}
        title="Delete Quote"
        visible={showDeleteConfirm}
      />
    </ScreenContainer>
  );
}

function DetailRow({label, value}: {label: string; value: string}) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.primary,
    borderRadius: spacing.radiusXl,
    padding: spacing.xl,
    gap: spacing.sm,
  },
  heroLabel: {
    color: colors.accent,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
  },
  heroValue: {
    color: colors.white,
    fontSize: typography.fontSize.display,
    fontWeight: typography.fontWeight.bold,
  },
  heroCopy: {
    color: colors.textOnPrimaryMuted,
    fontSize: typography.fontSize.sm,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: spacing.radiusXl,
    padding: spacing.xl,
    gap: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  detailLabel: {
    color: colors.textSecondary,
    flex: 1,
  },
  detailValue: {
    color: colors.textPrimary,
    flex: 1,
    textAlign: 'right',
    fontWeight: typography.fontWeight.medium,
  },
  packageTitle: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semiBold,
  },
  bodyText: {
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
  requestItem: {
    gap: spacing.xs,
  },
  requestTitle: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
  },
});
