import React, {useMemo, useState} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';

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
import {useAuthStore} from '@/store/authStore';
import {useLeadStore} from '@/store/leadStore';
import {usePropertyStore} from '@/store/propertyStore';
import type {LeadStatus, ProfileStackParamList} from '@/types';
import {callLeadBuyer, openWhatsAppForLead} from '@/utils/leadActions';

type Props = NativeStackScreenProps<ProfileStackParamList, 'LeadList'>;

export function LeadListScreen({navigation}: Props) {
  const user = useAuthStore(state => state.user);
  const properties = usePropertyStore(state => state.properties);
  const leads = useLeadStore(state => state.leads);
  const [activeStatus, setActiveStatus] = useState<LeadStatus>('New');

  const ownedPropertyIds = useMemo(() => {
    if (!user) {
      return [];
    }

    return properties
      .filter(
        item =>
          item.owner.id === user.id ||
          (user.role !== 'buyer' && item.owner.role === user.role),
      )
      .map(item => item.id);
  }, [properties, user]);

  const visibleLeads = useMemo(
    () =>
      leads.filter(
        lead =>
          ownedPropertyIds.includes(lead.property.id) &&
          lead.status === activeStatus,
      ),
    [activeStatus, leads, ownedPropertyIds],
  );

  return (
    <ScreenContainer>
      <AppHeader
        title="Lead Management"
        subtitle="Status-wise local lead workflow"
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
      {visibleLeads.length ? (
        visibleLeads.map(lead => (
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
          description={`No ${activeStatus.toLowerCase()} leads are linked to your properties.`}
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
});
