import React, {useMemo} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';

import {
  AppButton,
  AppHeader,
  EmptyState,
  LeadCard,
  ScreenContainer,
  SectionHeader,
  StatCard,
} from '@/components';
import {colors} from '@/constants/colors';
import {ROUTES} from '@/constants/routes';
import {spacing} from '@/constants/spacing';
import {useAuthStore} from '@/store/authStore';
import {useLeadStore} from '@/store/leadStore';
import {usePropertyStore} from '@/store/propertyStore';
import type {ProfileStackParamList} from '@/types';
import {callLeadBuyer, openWhatsAppForLead} from '@/utils/leadActions';

type Props = NativeStackScreenProps<
  ProfileStackParamList,
  'PortfolioDashboard'
>;

export function PortfolioDashboardScreen({navigation}: Props) {
  const tabNavigation = navigation.getParent<any>();
  const user = useAuthStore(state => state.user);
  const properties = usePropertyStore(state => state.properties);
  const leads = useLeadStore(state => state.leads);

  const ownedProperties = useMemo(() => {
    if (!user) {
      return [];
    }

    return properties.filter(
      item =>
        item.owner.id === user.id ||
        (user.role !== 'buyer' && item.owner.role === user.role),
    );
  }, [properties, user]);

  const ownedPropertyIds = ownedProperties.map(item => item.id);

  const portfolioLeads = useMemo(
    () => leads.filter(lead => ownedPropertyIds.includes(lead.property.id)),
    [leads, ownedPropertyIds],
  );

  const stats = useMemo(
    () => ({
      active: ownedProperties.filter(item => item.status === 'Active').length,
      sold: ownedProperties.filter(item => item.status === 'Sold').length,
      pending: ownedProperties.filter(item => item.status === 'Pending').length,
      totalLeads: portfolioLeads.length,
      interested: portfolioLeads.filter(lead => lead.status === 'Interested').length,
      siteVisits: portfolioLeads.filter(lead => lead.status === 'Site Visit').length,
    }),
    [ownedProperties, portfolioLeads],
  );

  const recentLeads = portfolioLeads.slice(0, 3);
  const followUps = portfolioLeads
    .filter(lead => lead.followUpDate)
    .sort((a, b) => (a.followUpDate ?? '').localeCompare(b.followUpDate ?? ''))
    .slice(0, 3);

  return (
    <ScreenContainer>
      <AppHeader
        title="Portfolio"
        subtitle="Seller and broker performance overview"
        onBackPress={navigation.goBack}
        rightLabel="My Leads"
        onRightPress={() => navigation.navigate(ROUTES.portfolio.leadList)}
      />
      <View style={styles.grid}>
        <StatCard label="Active Properties" value={stats.active} />
        <StatCard label="Sold Properties" value={stats.sold} />
        <StatCard label="Pending Properties" value={stats.pending} />
        <StatCard label="Total Leads" value={stats.totalLeads} />
        <StatCard label="Interested Buyers" value={stats.interested} />
        <StatCard label="Site Visits" value={stats.siteVisits} />
      </View>
      <View style={styles.actions}>
        <AppButton
          label="My Properties"
          onPress={() =>
            tabNavigation?.navigate(
              ROUTES.tabs.addPropertyStack,
              {screen: ROUTES.addProperty.myProperties},
            )
          }
          style={styles.actionButton}
          variant="outlined"
        />
        <AppButton
          label="Lead Management"
          onPress={() => navigation.navigate(ROUTES.portfolio.leadList)}
          style={styles.actionButton}
        />
      </View>
      <SectionHeader
        actionLabel="View All"
        onAction={() => navigation.navigate(ROUTES.portfolio.leadList)}
        title="Recent Leads"
      />
      {recentLeads.length ? (
        recentLeads.map(lead => (
          <LeadCard
            key={lead.id}
            lead={lead}
            onCall={() => {
              void callLeadBuyer(lead);
            }}
            onPress={() =>
              navigation.navigate(ROUTES.portfolio.leadDetail, {
                leadId: lead.id,
              })
            }
            onWhatsApp={() => {
              void openWhatsAppForLead(lead);
            }}
          />
        ))
      ) : (
        <EmptyState
          description="No leads are linked to your local properties yet."
          title="No recent leads"
        />
      )}
      <SectionHeader title="Follow-ups" />
      {followUps.length ? (
        followUps.map(lead => (
          <View key={lead.id} style={styles.followUpCard}>
            <Text style={styles.followUpTitle}>{lead.buyer.name}</Text>
            <Text style={styles.followUpMeta}>{lead.property.title}</Text>
            <Text style={styles.followUpMeta}>
              Follow-up Date: {lead.followUpDate}
            </Text>
          </View>
        ))
      ) : (
        <EmptyState
          description="No follow-up dates have been scheduled locally."
          title="No follow-ups"
        />
      )}
      <SectionHeader title="Performance Summary" />
      <View style={styles.summaryCard}>
        <Text style={styles.summaryText}>
          {stats.totalLeads
            ? `You currently have ${stats.totalLeads} local leads across ${ownedProperties.length} managed properties.`
            : 'Add or assign more properties to start tracking lead performance.'}
        </Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
  },
  followUpCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    gap: 6,
  },
  followUpTitle: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  followUpMeta: {
    color: colors.textSecondary,
  },
  summaryCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
  },
  summaryText: {
    color: colors.textPrimary,
  },
});
