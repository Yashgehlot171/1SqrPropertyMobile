import {pickRequestAttachment} from '@/services/requestAttachment';
import {useRemoteLoad, useRemoteAction} from '@/hooks/useRemoteFlow';
import {RemoteStatus} from '@/components/common/RemoteStatus';
import React, {useMemo, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
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
import {colors} from '@/constants/colors';
import {ROUTES} from '@/constants/routes';
import {spacing} from '@/constants/spacing';
import {typography} from '@/constants/typography';
import {useLegalStore} from '@/store/legalStore';
import type {
  Remark,
  ServicesStackParamList,
} from '@/types';
import {callLegalTeam, openWhatsAppForLegalTeam} from '@/utils/legalActions';
import {showToast} from '@/utils/toast';

type Props = NativeStackScreenProps<ServicesStackParamList, 'LegalRequestDetail'>;

export function LegalRequestDetailScreen({navigation, route}: Props) {
  const loadRemote = useLegalStore(state => state.load);
  const remoteLoading = useLegalStore(state => state.loading);
  const remoteError = useLegalStore(state => state.error);
  useRemoteLoad(loadRemote);
  const {run, busy} = useRemoteAction();

  const requests = useLegalStore(state => state.requests);
  const teams = useLegalStore(state => state.teams);
  const addRemark = useLegalStore(state => state.addRemark);
  const editRemark = useLegalStore(state => state.editRemark);
  const deleteRemark = useLegalStore(state => state.deleteRemark);
  const addDocument = useLegalStore(state => state.addDocument);
  const removeDocument = useLegalStore(state => state.removeDocument);
  const deleteRequest = useLegalStore(state => state.deleteRequest);

  const request = requests.find(item => item.id === route.params.requestId);
  const team = teams.find(item => item.id === request?.assignedTeamId);
  const [remarkText, setRemarkText] = useState('');
  const [editingRemark, setEditingRemark] = useState<Remark | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Remark | null>(null);
  const [showDeleteRequest, setShowDeleteRequest] = useState(false);

  const sortedHistory = useMemo(
    () =>
      [...(request?.history ?? [])].sort((a, b) =>
        b.updatedAt.localeCompare(a.updatedAt),
      ),
    [request?.history],
  );

  if (!request) {
    return (
      <ScreenContainer><RemoteStatus loading={remoteLoading} error={remoteError} retry={() => { void loadRemote().catch(() => {}); }} />
        <AppHeader title="Legal Request Detail" onBackPress={navigation.goBack} />
        <EmptyState
          description="This legal request is not available in the account."
          title="Legal request not found"
        />
      </ScreenContainer>
    );
  }

  const handleSaveRemark = () => { return run(async () => {
    const trimmed = remarkText.trim();
    if (!trimmed) {
      showToast('Remark text is required.');
      return;
    }

    if (editingRemark) {
      await editRemark(request.id, editingRemark.id, trimmed);
      setEditingRemark(null);
      showToast('Remark updated.');
    } else {
      await addRemark(request.id, trimmed);
      showToast('Remark added.');
    }

    setRemarkText('');
  
  }); };

  return (
    <ScreenContainer><RemoteStatus loading={remoteLoading} error={remoteError} retry={() => { void loadRemote().catch(() => {}); }} />
      <AppHeader
        title="Legal Request Detail"
        subtitle={request.type}
        onBackPress={navigation.goBack}
      />
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>{request.propertyDetails}</Text>
        <Text style={styles.heroMeta}>
          {request.location.area}, {request.location.city}
        </Text>
        <Text style={styles.heroMeta}>
          Team: {team?.name ?? 'No assigned team'}
        </Text>
        <View style={styles.chips}>
          <StatusChip label={request.status} />
          <StatusChip label={request.type} />
        </View>
      </View>
      <View style={styles.actions}>
        <AppButton disabled={busy}
          label="Edit Request"
          onPress={() =>
            navigation.navigate(
              request.type === 'Property Verification'
                ? ROUTES.services.propertyVerificationRequest
                : ROUTES.services.propertyRegistrationRequest,
              {requestId: request.id},
            )
          }
          style={styles.button}
          variant="outlined"
        />
        <AppButton disabled={busy}
          label="Delete Request"
          onPress={() => setShowDeleteRequest(true)}
          style={styles.button}
          variant="danger"
        />
      </View>
      {team ? (
        <View style={styles.actions}>
          <AppButton disabled={busy}
            label="Call Team"
            onPress={() => {
              void callLegalTeam(team);
            }}
            style={styles.button}
            variant="outlined"
          />
          <AppButton disabled={busy}
            label="WhatsApp Team"
            onPress={() => {
              void openWhatsAppForLegalTeam(team, 'the current legal request');
            }}
            style={styles.button}
            variant="outlined"
          />
        </View>
      ) : null}
      <View style={styles.card}>
        <SectionHeader title="Request Information" />
        <DetailRow label="Applicant" value={request.applicantName} />
        <DetailRow label="Owner" value={request.ownerName} />
        <DetailRow label="Buyer" value={request.buyerName ?? 'N/A'} />
        <DetailRow label="City" value={request.location.city} />
        <DetailRow label="Area" value={request.location.area ?? 'N/A'} />
        <DetailRow
          label="Registration Date"
          value={request.preferredRegistrationDate ?? 'N/A'}
        />
      </View>

      <View style={styles.card}>
        <SectionHeader title="Documents" />
        <UploadBox
          onPress={() => run(async () => {
    const document = await pickRequestAttachment('legal');
    if (document) { await addDocument(request.id, document); }
  })}
          subtitle="Add property papers or ID proof placeholders to this request."
          title="Upload Image"
        />
        {request.documents.length ? (
          request.documents.map(document => (
            <DocumentCard
              document={document}
              key={document.id}
              onDelete={() => { return run(async () => {
                await removeDocument(request.id, document.id);
                showToast('Document deleted.');
              
  }); }}
              onView={() => showToast(`Viewing ${document.name}.`)}
            />
          ))
        ) : (
          <Text style={styles.emptyText}>No documents uploaded yet.</Text>
        )}
      </View>
      <View style={styles.card}>
        <SectionHeader title="Remarks" />
        <AppInput
          label={editingRemark ? 'Edit Remark' : 'Add Remark'}
          multiline
          onChangeText={setRemarkText}
          placeholder="Add an internal legal remark"
          required
          value={remarkText}
        />
        <View style={styles.actions}>
          {editingRemark ? (
            <AppButton disabled={busy}
              label="Cancel Edit"
              onPress={() => {
                setEditingRemark(null);
                setRemarkText('');
              }}
              style={styles.button}
              variant="outlined"
            />
          ) : null}
          <AppButton disabled={busy}
            label={editingRemark ? 'Update Remark' : 'Add Remark'}
            onPress={handleSaveRemark}
            style={styles.button}
            variant="secondary"
          />
        </View>
        {request.remarks.length ? (
          request.remarks.map(remark => (
            <RemarkCard
              key={remark.id}
              
              
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
        onConfirm={() => { return run(async () => {
          if (deleteTarget) {
            await deleteRemark(request.id, deleteTarget.id);
            showToast('Remark deleted.');
          }
          setDeleteTarget(null);
        
  }); }}
        title="Delete Remark"
        visible={Boolean(deleteTarget)}
      />
      <ConfirmationModal
        confirmLabel="Delete"
        message="Delete this legal request?"
        onCancel={() => setShowDeleteRequest(false)}
        onConfirm={() => { return run(async () => {
          await deleteRequest(request.id);
          setShowDeleteRequest(false);
          showToast('Legal request deleted.');
          navigation.goBack();
        
  }); }}
        title="Delete Legal Request"
        visible={showDeleteRequest}
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
