import React, {useMemo, useState} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';

import {
  AppButton,
  AppHeader,
  AppInput,
  ConfirmationModal,
  DocumentCard,
  EmptyState,
  RemarkCard,
  ScreenContainer,
  SectionHeader,
  StatusChip,
  UploadBox,
} from '@/components';
import {SUPPORT_TICKET_STATUSES} from '@/constants/appConstants';
import {colors} from '@/constants/colors';
import {ROUTES} from '@/constants/routes';
import {spacing} from '@/constants/spacing';
import {typography} from '@/constants/typography';
import {useSupportStore} from '@/store/supportStore';
import type {
  Remark,
  ServicesStackParamList,
  SupportTicketStatus,
} from '@/types';
import {showToast} from '@/utils/toast';

type Props = NativeStackScreenProps<ServicesStackParamList, 'SupportTicketDetail'>;

export function SupportTicketDetailScreen({navigation, route}: Props) {
  const tickets = useSupportStore(state => state.tickets);
  const updateTicketStatus = useSupportStore(state => state.updateTicketStatus);
  const addRemark = useSupportStore(state => state.addRemark);
  const editRemark = useSupportStore(state => state.editRemark);
  const deleteRemark = useSupportStore(state => state.deleteRemark);
  const addDocument = useSupportStore(state => state.addDocument);
  const removeDocument = useSupportStore(state => state.removeDocument);
  const deleteTicket = useSupportStore(state => state.deleteTicket);

  const ticket = tickets.find(item => item.id === route.params.ticketId);
  const [remarkText, setRemarkText] = useState('');
  const [editingRemark, setEditingRemark] = useState<Remark | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Remark | null>(null);
  const [showDeleteTicket, setShowDeleteTicket] = useState(false);

  const sortedHistory = useMemo(
    () =>
      [...(ticket?.history ?? [])].sort((a, b) =>
        b.updatedAt.localeCompare(a.updatedAt),
      ),
    [ticket?.history],
  );

  if (!ticket) {
    return (
      <ScreenContainer>
        <AppHeader title="Support Ticket" onBackPress={navigation.goBack} />
        <EmptyState
          description="This support ticket is not available in the local workflow."
          title="Support ticket not found"
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
      editRemark(ticket.id, editingRemark.id, trimmed);
      setEditingRemark(null);
      showToast('Remark updated locally.');
    } else {
      addRemark(ticket.id, trimmed);
      showToast('Remark added locally.');
    }

    setRemarkText('');
  };

  return (
    <ScreenContainer>
      <AppHeader
        title="Support Ticket Detail"
        subtitle={ticket.issueType}
        onBackPress={navigation.goBack}
      />
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>{ticket.subject}</Text>
        <Text style={styles.heroMeta}>{ticket.description}</Text>
        <View style={styles.chips}>
          <StatusChip label={ticket.status} />
          {ticket.relatedProperty ? (
            <StatusChip label={ticket.relatedProperty} />
          ) : null}
        </View>
      </View>
      <View style={styles.actions}>
        <AppButton
          label="Edit Ticket"
          onPress={() =>
            navigation.navigate(ROUTES.services.supportTicketForm, {
              ticketId: ticket.id,
            })
          }
          style={styles.button}
          variant="outlined"
        />
        <AppButton
          label="Delete Ticket"
          onPress={() => setShowDeleteTicket(true)}
          style={styles.button}
          variant="danger"
        />
      </View>
      <View style={styles.card}>
        <SectionHeader title="Status Update" />
        <View style={styles.statusRow}>
          {SUPPORT_TICKET_STATUSES.map(status => (
            <Pressable
              key={status}
              onPress={() => {
                updateTicketStatus(ticket.id, status as SupportTicketStatus);
                showToast(`Support ticket updated to ${status}.`);
              }}
              style={[
                styles.statusChip,
                ticket.status === status && styles.statusChipSelected,
              ]}>
              <Text
                style={[
                  styles.statusChipText,
                  ticket.status === status && styles.statusChipTextSelected,
                ]}>
                {status}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
      <View style={styles.card}>
        <SectionHeader title="Attachments" />
        <UploadBox
          onPress={() => {
            const nextIndex = ticket.documents.length + 1;
            addDocument(ticket.id, {
              name: `Support Attachment ${nextIndex}`,
              type: 'PDF',
              uri: `local://support-request-document-${nextIndex}`,
            });
            showToast('Document placeholder added locally.');
          }}
          subtitle="Add screenshots or proof placeholders to this ticket."
          title="Upload Attachment Placeholder"
        />
        {ticket.documents.length ? (
          ticket.documents.map(document => (
            <DocumentCard
              document={document}
              key={document.id}
              onDelete={() => {
                removeDocument(ticket.id, document.id);
                showToast('Document deleted locally.');
              }}
              onView={() => showToast(`Viewing ${document.name}.`)}
            />
          ))
        ) : (
          <Text style={styles.emptyText}>No attachments uploaded yet.</Text>
        )}
      </View>
      <View style={styles.card}>
        <SectionHeader title="Remarks" />
        <AppInput
          label={editingRemark ? 'Edit Remark' : 'Add Remark'}
          multiline
          onChangeText={setRemarkText}
          placeholder="Add an internal support remark"
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
              style={styles.button}
              variant="outlined"
            />
          ) : null}
          <AppButton
            label={editingRemark ? 'Update Remark' : 'Add Remark'}
            onPress={handleSaveRemark}
            style={styles.button}
            variant="secondary"
          />
        </View>
        {ticket.remarks.length ? (
          ticket.remarks.map(remark => (
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
            deleteRemark(ticket.id, deleteTarget.id);
            showToast('Remark deleted locally.');
          }
          setDeleteTarget(null);
        }}
        title="Delete Remark"
        visible={Boolean(deleteTarget)}
      />
      <ConfirmationModal
        confirmLabel="Delete"
        message="Delete this local support ticket?"
        onCancel={() => setShowDeleteTicket(false)}
        onConfirm={() => {
          deleteTicket(ticket.id);
          setShowDeleteTicket(false);
          showToast('Support ticket deleted locally.');
          navigation.goBack();
        }}
        title="Delete Support Ticket"
        visible={showDeleteTicket}
      />
    </ScreenContainer>
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
  button: {
    flex: 1,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: spacing.radiusXl,
    padding: spacing.xl,
    gap: spacing.md,
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
  emptyText: {
    color: colors.textSecondary,
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
});
