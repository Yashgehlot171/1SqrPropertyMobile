import React, {useCallback, useEffect, useState} from 'react';
import {ActivityIndicator, Pressable, StyleSheet, Text, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';

import {showApiError} from '@/api';
import {
  AppHeader,
  EmptyState,
  LeadCard,
  ScreenContainer,
} from '@/components';
import {LEAD_STATUSES} from '@/constants/appConstants';
import {colors} from '@/constants/colors';
import {ROUTES} from '@/constants/routes';
import {spacing} from '@/constants/spacing';
import {typography} from '@/constants/typography';
import {getLeads} from '@/services/leadApi';
import type {Lead, LeadStatus, ProfileStackParamList} from '@/types';
import {callLeadBuyer, openWhatsAppForLead} from '@/utils/leadActions';

type Props = NativeStackScreenProps<ProfileStackParamList, 'LeadList'>;

export function LeadListScreen({navigation}: Props) {
  const [activeStatus, setActiveStatus] = useState<LeadStatus>('New');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // GET /me/leads (leadApi.ts's getLeads) already scopes results to exactly the
  // leads relevant to the current user server-side — lead.service.ts's
  // list(req, query, mine=true) filters where.OR on customerId/property.ownerId/
  // assignedToId — a superset of the old client-side ownedPropertyIds filter, so no
  // client-side re-filtering by property ownership is needed anymore. status is
  // re-fetched per tab (rather than fetching all statuses once and filtering
  // client-side) so each tab always reflects the server's own filtering/pagination
  // for that status rather than a locally-cached snapshot, at the cost of one
  // request per tab switch — an acceptable tradeoff since lead lists are small and
  // tab switches are infrequent compared to, say, scroll-driven pagination.
  const loadLeads = useCallback(async (status: LeadStatus) => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const items = await getLeads({status});
      setLeads(items);
    } catch (error) {
      showApiError(error);
      setLoadError('Unable to load your leads right now.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLeads(activeStatus);
  }, [activeStatus, loadLeads]);

  return (
    <ScreenContainer>
      <AppHeader
        title="Lead Management"
        subtitle="Status-wise lead workflow"
        onBackPress={navigation.goBack}
      />
      <View style={styles.tabRow}>
        {LEAD_STATUSES.map(status => (
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
      {isLoading && !leads.length ? (
        <View style={styles.centerState}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={styles.centerStateText}>Loading leads...</Text>
        </View>
      ) : loadError && !leads.length ? (
        <View style={styles.centerState}>
          <Text style={styles.centerStateText}>{loadError}</Text>
          <Pressable
            onPress={() => loadLeads(activeStatus)}
            style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        </View>
      ) : leads.length ? (
        leads.map(lead => (
          <LeadCard
            key={lead.id}
            lead={lead}
            onCall={() => {
              void callLeadBuyer(lead);
            }}
            onPress={() =>
              navigation.navigate(ROUTES.portfolio.leadDetail, {leadId: lead.id})
            }
            onWhatsApp={() => {
              void openWhatsAppForLead(lead);
            }}
          />
        ))
      ) : (
        <EmptyState
          description={`No ${activeStatus.toLowerCase()} leads found.`}
          title={`${activeStatus} leads are empty`}
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  tabRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tabChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  tabChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabText: {
    color: colors.textPrimary,
    fontWeight: typography.fontWeight.medium,
  },
  tabTextSelected: {
    color: colors.white,
  },
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
});
