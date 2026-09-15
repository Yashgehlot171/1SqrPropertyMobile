import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {ActivityIndicator, Pressable, StyleSheet, Text, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';

import {showApiError} from '@/api';
import {
  AppButton,
  AppHeader,
  AppInput,
  EmptyState,
  RemarkCard,
  ScreenContainer,
  SectionHeader,
  StatusChip,
} from '@/components';
import {LEAD_STATUSES} from '@/constants/appConstants';
import {colors} from '@/constants/colors';
import {spacing} from '@/constants/spacing';
import {typography} from '@/constants/typography';
import {
  addLeadRemark,
  getLeadById,
  scheduleLeadFollowUp,
  updateLeadStatus,
} from '@/services/leadApi';
import type {Lead, LeadStatus, ProfileStackParamList} from '@/types';
import {callLeadBuyer, openWhatsAppForLead} from '@/utils/leadActions';
import {showToast} from '@/utils/toast';

type Props = NativeStackScreenProps<ProfileStackParamList, 'LeadDetail'>;

// Mirrors leadApi.ts's (unexported) STATUS_SLUGS_REQUIRING_REMARK /
// STATUS_SLUG_REQUIRING_VISIT_DATE at the label level. leadApi.ts's
// updateLeadStatus only enforces this after the fact (throwing a client-side Error
// before the request goes out), so the UI needs to know *before* the user taps a
// status chip which ones need extra input, in order to prompt for it instead of
// firing a request that is guaranteed to throw.
const STATUSES_REQUIRING_REMARK: LeadStatus[] = ['Closed', 'Lost', 'Converted'];
const STATUS_REQUIRING_VISIT_DATE: LeadStatus = 'Site Visit';

export function LeadDetailScreen({navigation, route}: Props) {
  const {leadId} = route.params;

  const [lead, setLead] = useState<Lead | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [remarkText, setRemarkText] = useState('');
  const [isSavingRemark, setIsSavingRemark] = useState(false);

  const [followUpDate, setFollowUpDate] = useState('');
  const [followUpNextAction, setFollowUpNextAction] = useState('');
  const [isSavingFollowUp, setIsSavingFollowUp] = useState(false);

  // Status change awaiting the extra remark/visitDate input required for
  // Closed/Lost/Converted/Site Visit — see STATUSES_REQUIRING_REMARK above.
  const [pendingStatus, setPendingStatus] = useState<LeadStatus | null>(null);
  const [statusRemark, setStatusRemark] = useState('');
  const [statusVisitDate, setStatusVisitDate] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const sortedHistory = useMemo(
    () => [...(lead?.history ?? [])].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [lead?.history],
  );

  const loadLead = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const item = await getLeadById(leadId);
      if (item) {
        setLead(item);
        setFollowUpDate(item.followUpDate ? item.followUpDate.slice(0, 10) : '');
      } else {
        setLoadError('This lead could not be found.');
      }
    } catch (error) {
      showApiError(error);
      setLoadError('Unable to load this lead right now.');
    } finally {
      setIsLoading(false);
    }
  }, [leadId]);

  useEffect(() => {
    loadLead();
  }, [loadLead]);

  const applyStatusChange = useCallback(
    async (status: LeadStatus, options?: {remark?: string; visitDate?: string}) => {
      if (!lead) {
        return;
      }
      setIsUpdatingStatus(true);
      try {
        const updated = await updateLeadStatus(lead.id, status, options);
        if (updated) {
          setLead(updated);
          showToast(`Lead status updated to ${status}.`);
          setPendingStatus(null);
          setStatusRemark('');
          setStatusVisitDate('');
        } else {
          showToast('Could not update lead status — please try again.');
        }
      } catch (error) {
        showApiError(error);
      } finally {
        setIsUpdatingStatus(false);
      }
    },
    [lead],
  );

  const handleStatusPress = (status: LeadStatus) => {
    if (!lead || status === lead.status) {
      return;
    }
    if (
      STATUSES_REQUIRING_REMARK.includes(status) ||
      status === STATUS_REQUIRING_VISIT_DATE
    ) {
      setPendingStatus(status);
      setStatusRemark('');
      setStatusVisitDate('');
      return;
    }
    void applyStatusChange(status);
  };

  const handleConfirmPendingStatus = () => {
    if (!pendingStatus) {
      return;
    }
    if (STATUSES_REQUIRING_REMARK.includes(pendingStatus)) {
      const trimmed = statusRemark.trim();
      if (!trimmed) {
        showToast('A remark is required for this status.');
        return;
      }
      void applyStatusChange(pendingStatus, {remark: trimmed});
      return;
    }
    const trimmedDate = statusVisitDate.trim();
    if (!trimmedDate) {
      showToast('A visit date is required for this status.');
      return;
    }
    void applyStatusChange(pendingStatus, {visitDate: trimmedDate});
  };

  const handleCancelPendingStatus = () => {
    setPendingStatus(null);
    setStatusRemark('');
    setStatusVisitDate('');
  };

  const handleSaveRemark = async () => {
    if (!lead) {
      return;
    }
    const trimmed = remarkText.trim();
    if (!trimmed) {
      showToast('Remark text is required.');
      return;
    }
    setIsSavingRemark(true);
    try {
      const remark = await addLeadRemark(lead.id, trimmed);
      if (remark) {
        setLead(current =>
          current ? {...current, remarks: [remark, ...current.remarks]} : current,
        );
        showToast('Remark added.');
        setRemarkText('');
      } else {
        showToast('Could not add remark — please try again.');
      }
    } catch (error) {
      showApiError(error);
    } finally {
      setIsSavingRemark(false);
    }
  };

  const handleSaveFollowUp = async () => {
    if (!lead) {
      return;
    }
    const trimmedDate = followUpDate.trim();
    const trimmedAction = followUpNextAction.trim();
    if (!trimmedDate || !trimmedAction) {
      showToast('Follow-up date and next action are both required.');
      return;
    }
    setIsSavingFollowUp(true);
    try {
      const followUp = await scheduleLeadFollowUp(lead.id, {
        followUpAt: trimmedDate,
        nextAction: trimmedAction,
      });
      if (followUp) {
        setLead(current =>
          current ? {...current, followUpDate: followUp.followUpAt} : current,
        );
        showToast('Follow-up scheduled.');
        setFollowUpNextAction('');
      } else {
        showToast('Could not schedule follow-up — please try again.');
      }
    } catch (error) {
      showApiError(error);
    } finally {
      setIsSavingFollowUp(false);
    }
  };

  if (isLoading && !lead) {
    return (
      <ScreenContainer>
        <AppHeader title="Lead Detail" onBackPress={navigation.goBack} />
        <View style={styles.centerState}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={styles.centerStateText}>Loading lead...</Text>
        </View>
      </ScreenContainer>
    );
  }

  if (loadError && !lead) {
    return (
      <ScreenContainer>
        <AppHeader title="Lead Detail" onBackPress={navigation.goBack} />
        <View style={styles.centerState}>
          <Text style={styles.centerStateText}>{loadError}</Text>
          <Pressable onPress={loadLead} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        </View>
      </ScreenContainer>
    );
  }

  if (!lead) {
    return (
      <ScreenContainer>
        <AppHeader title="Lead Detail" onBackPress={navigation.goBack} />
        <EmptyState description="This lead is not available." title="Lead not found" />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <AppHeader
        title="Lead Detail"
        subtitle={lead.buyer.name}
        onBackPress={navigation.goBack}
      />
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>{lead.property.title}</Text>
        <Text style={styles.heroMeta}>{lead.buyer.mobile}</Text>
        <View style={styles.chips}>
          <StatusChip label={lead.status} />
          {lead.followUpDate ? <StatusChip label={lead.followUpDate} /> : null}
        </View>
      </View>
      <View style={styles.actions}>
        <AppButton
          label="Call"
          onPress={() => {
            void callLeadBuyer(lead);
          }}
          style={styles.actionButton}
          variant="outlined"
        />
        <AppButton
          label="WhatsApp"
          onPress={() => {
            void openWhatsAppForLead(lead);
          }}
          style={styles.actionButton}
          variant="outlined"
        />
      </View>
      <View style={styles.card}>
        <SectionHeader title="Buyer Information" />
        <DetailRow label="Name" value={lead.buyer.name} />
        <DetailRow label="Mobile" value={lead.buyer.mobile} />
        <DetailRow label="Email" value={lead.buyer.email ?? 'N/A'} />
        <DetailRow label="City" value={lead.buyer.city} />
      </View>
      <View style={styles.card}>
        <SectionHeader title="Property Information" />
        <DetailRow label="Property" value={lead.property.title} />
        <DetailRow label="Location" value={lead.property.location.city} />
        <DetailRow label="Area" value={lead.property.location.area ?? 'N/A'} />
      </View>
      <View style={styles.card}>
        <SectionHeader title="Status Update" />
        <View style={styles.statusRow}>
          {LEAD_STATUSES.map(status => (
            <StatusToggle
              isSelected={lead.status === status}
              key={status}
              label={status}
              onPress={() => handleStatusPress(status)}
            />
          ))}
        </View>
        {pendingStatus ? (
          <View style={styles.pendingStatusBox}>
            {STATUSES_REQUIRING_REMARK.includes(pendingStatus) ? (
              <AppInput
                label={`Remark for moving to ${pendingStatus}`}
                multiline
                onChangeText={setStatusRemark}
                placeholder="Add a remark explaining this status change"
                required
                value={statusRemark}
              />
            ) : (
              <AppInput
                label="Site Visit Date (YYYY-MM-DD)"
                onChangeText={setStatusVisitDate}
                placeholder="2026-06-20"
                required
                value={statusVisitDate}
              />
            )}
            <View style={styles.actions}>
              <AppButton
                label="Cancel"
                onPress={handleCancelPendingStatus}
                style={styles.actionButton}
                variant="outlined"
              />
              <AppButton
                label="Confirm"
                loading={isUpdatingStatus}
                onPress={handleConfirmPendingStatus}
                style={styles.actionButton}
                variant="secondary"
              />
            </View>
          </View>
        ) : null}
      </View>
      <View style={styles.card}>
        <SectionHeader title="Follow-up" />
        <AppInput
          label="Follow-up Date (YYYY-MM-DD)"
          onChangeText={setFollowUpDate}
          placeholder="2026-06-20"
          required
          value={followUpDate}
        />
        <AppInput
          label="Next Action"
          onChangeText={setFollowUpNextAction}
          placeholder="e.g. Call back to confirm site visit interest"
          required
          value={followUpNextAction}
        />
        <AppButton
          label="Save Follow-up"
          loading={isSavingFollowUp}
          onPress={handleSaveFollowUp}
          variant="secondary"
        />
      </View>
      <View style={styles.card}>
        <SectionHeader title="Remarks" />
        <AppInput
          label="Add Remark"
          multiline
          onChangeText={setRemarkText}
          placeholder="Add a remark for this lead"
          required
          value={remarkText}
        />
        <AppButton
          label="Add Remark"
          loading={isSavingRemark}
          onPress={handleSaveRemark}
          variant="secondary"
        />
        {lead.remarks.length ? (
          lead.remarks.map(remark => <RemarkCard key={remark.id} remark={remark} />)
        ) : (
          <Text style={styles.emptyText}>No remarks added yet.</Text>
        )}
      </View>
      <View style={styles.card}>
        <SectionHeader title="Status History" />
        {sortedHistory.length ? (
          sortedHistory.map(item => (
            <View key={item.id} style={styles.historyRow}>
              <StatusChip label={item.status} />
              <Text style={styles.historyText}>
                {item.updatedBy} | {item.updatedAt.slice(0, 10)}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No status history available.</Text>
        )}
      </View>
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

function StatusToggle({
  label,
  isSelected,
  onPress,
}: {
  label: string;
  isSelected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.statusChip, isSelected && styles.statusChipSelected]}>
      <Text
        style={[
          styles.statusChipText,
          isSelected && styles.statusChipTextSelected,
        ]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.primary,
    borderRadius: spacing.radiusXl,
    padding: spacing.xl,
    gap: spacing.sm,
  },
  heroTitle: {
    color: colors.white,
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
  },
  heroMeta: {
    color: colors.textOnPrimaryMuted,
    fontSize: typography.fontSize.sm,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
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
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  statusChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    backgroundColor: colors.muted,
  },
  statusChipSelected: {
    backgroundColor: colors.primary,
  },
  statusChipText: {
    color: colors.textPrimary,
    fontWeight: typography.fontWeight.medium,
  },
  statusChipTextSelected: {
    color: colors.white,
  },
  pendingStatusBox: {
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    paddingTop: spacing.md,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  historyText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
  },
  emptyText: {
    color: colors.textSecondary,
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
