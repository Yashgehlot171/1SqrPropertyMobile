import React, {useMemo, useState} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';

import {
  AppButton,
  AppHeader,
  AppInput,
  ConfirmationModal,
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
import {useLeadStore} from '@/store/leadStore';
import type {LeadStatus, ProfileStackParamList, Remark} from '@/types';
import {formatCurrency} from '@/utils/formatCurrency';
import {callLeadBuyer, openWhatsAppForLead} from '@/utils/leadActions';
import {showToast} from '@/utils/toast';

type Props = NativeStackScreenProps<ProfileStackParamList, 'LeadDetail'>;

export function LeadDetailScreen({navigation, route}: Props) {
  const leads = useLeadStore(state => state.leads);
  const updateLeadStatus = useLeadStore(state => state.updateLeadStatus);
  const updateFollowUpDate = useLeadStore(state => state.updateFollowUpDate);
  const addRemark = useLeadStore(state => state.addRemark);
  const editRemark = useLeadStore(state => state.editRemark);
  const deleteRemark = useLeadStore(state => state.deleteRemark);
  const removeLead = useLeadStore(state => state.removeLead);
  const lead = leads.find(item => item.id === route.params.leadId);
  const [remarkText, setRemarkText] = useState('');
  const [editingRemark, setEditingRemark] = useState<Remark | null>(null);
  const [followUpDate, setFollowUpDate] = useState(lead?.followUpDate ?? '');
  const [deleteTarget, setDeleteTarget] = useState<Remark | null>(null);
  const [showLeadDelete, setShowLeadDelete] = useState(false);

  const sortedHistory = useMemo(
    () => [...(lead?.history ?? [])].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [lead?.history],
  );

  if (!lead) {
    return (
      <ScreenContainer>
        <AppHeader title="Lead Detail" onBackPress={navigation.goBack} />
        <EmptyState
          description="This lead is not available in the local workflow."
          title="Lead not found"
        />
      </ScreenContainer>
    );
  }

  const handleSaveRemark = () => {
    const trimmed = remarkText.trim();
    if (!trimmed) {
      showToast('Remark text is required.');
      return;
    }

    if (editingRemark) {
      editRemark(lead.id, editingRemark.id, trimmed);
      showToast('Remark updated locally.');
      setEditingRemark(null);
    } else {
      addRemark(lead.id, trimmed);
      showToast('Remark added locally.');
    }

    setRemarkText('');
  };

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
        <Text style={styles.heroMeta}>{formatCurrency(lead.property.price)}</Text>
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
              onPress={() => {
                updateLeadStatus(lead.id, status as LeadStatus);
                showToast(`Lead status updated to ${status}.`);
              }}
            />
          ))}
        </View>
      </View>
      <View style={styles.card}>
        <SectionHeader title="Follow-up Date" />
        <AppInput
          label="Follow-up (YYYY-MM-DD)"
          onChangeText={setFollowUpDate}
          placeholder="2026-06-20"
          value={followUpDate}
        />
        <AppButton
          label="Save Follow-up Date"
          onPress={() => {
            updateFollowUpDate(lead.id, followUpDate.trim());
            showToast('Follow-up date updated locally.');
          }}
          variant="secondary"
        />
      </View>
      <View style={styles.card}>
        <SectionHeader title="Remarks" />
        <AppInput
          label={editingRemark ? 'Edit Remark' : 'Add Remark'}
          multiline
          onChangeText={setRemarkText}
          placeholder="Add a remark for this lead"
          required
          value={remarkText}
        />
        <View style={styles.actions}>
          {editingRemark ? (
            <AppButton
              label="Cancel Edit"
              onPress={() => {
                setEditingRemark(null);
                setRemarkText('');
              }}
              style={styles.actionButton}
              variant="outlined"
            />
          ) : null}
          <AppButton
            label={editingRemark ? 'Update Remark' : 'Add Remark'}
            onPress={handleSaveRemark}
            style={styles.actionButton}
            variant="secondary"
          />
        </View>
        {lead.remarks.length ? (
          lead.remarks.map(remark => (
            <RemarkCard
              key={remark.id}
              onDelete={() => setDeleteTarget(remark)}
              onEdit={() => {
                setEditingRemark(remark);
                setRemarkText(remark.text);
              }}
              remark={remark}
            />
          ))
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
      <AppButton
        label="Close / Delete Lead"
        onPress={() => setShowLeadDelete(true)}
        variant="danger"
      />
      <ConfirmationModal
        confirmLabel="Delete"
        message={
          deleteTarget
            ? `Delete the remark "${deleteTarget.text}"?`
            : 'Delete this remark?'
        }
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            deleteRemark(lead.id, deleteTarget.id);
            showToast('Remark deleted locally.');
          }
          setDeleteTarget(null);
        }}
        title="Delete Remark"
        visible={Boolean(deleteTarget)}
      />
      <ConfirmationModal
        confirmLabel="Delete"
        message="Remove this lead from the local list?"
        onCancel={() => setShowLeadDelete(false)}
        onConfirm={() => {
          removeLead(lead.id);
          setShowLeadDelete(false);
          showToast('Lead deleted locally.');
          navigation.goBack();
        }}
        title="Delete Lead"
        visible={showLeadDelete}
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
});
