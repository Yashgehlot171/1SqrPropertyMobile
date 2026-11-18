import {pickRequestAttachment} from '@/services/requestAttachment';
import {useRemoteLoad, useRemoteAction} from '@/hooks/useRemoteFlow';
import {RemoteStatus} from '@/components/common/RemoteStatus';
import React, {useMemo, useState} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';

import {
  AppButton,
  AppHeader,
  AppInput,
  DocumentCard,
  ScreenContainer,
  SectionHeader,
  UploadBox,
} from '@/components';
import {colors} from '@/constants/colors';
import {ROUTES} from '@/constants/routes';
import {typography} from '@/constants/typography';
import {useSupportStore} from '@/store/supportStore';
import type {ServicesStackParamList, UploadedDocument} from '@/types';
import {generateId} from '@/services/serviceUtils';
import {showToast} from '@/utils/toast';
import {openUploadedDocument} from '@/utils/documentActions';
import {spacing} from '@/constants/spacing';

type Props = NativeStackScreenProps<ServicesStackParamList, 'SupportTicketForm'>;

function SupportTicketFormContent({navigation, route}: Props) {
  const loadRemote = useSupportStore(state => state.load);
  const remoteLoading = useSupportStore(state => state.loading);
  const remoteError = useSupportStore(state => state.error);
  useRemoteLoad(loadRemote);
  const {run, busy} = useRemoteAction();

  const ticketId = route.params?.ticketId;
  const categories = useSupportStore(state => state.categories);
  const tickets = useSupportStore(state => state.tickets);
  const addTicket = useSupportStore(state => state.addTicket);
  const updateTicket = useSupportStore(state => state.updateTicket);

  const ticket = useMemo(
    () => (ticketId ? tickets.find(item => item.id === ticketId) : undefined),
    [ticketId, tickets],
  );

  const [issueType, setIssueType] = useState(ticket?.issueType ?? '');
  const [relatedProperty, setRelatedProperty] = useState(
    ticket?.relatedProperty ?? '',
  );
  const [subject, setSubject] = useState(ticket?.subject ?? '');
  const [description, setDescription] = useState(ticket?.description ?? '');
  const [documents, setDocuments] = useState<UploadedDocument[]>(
    ticket?.documents ?? [],
  );

  const handleAddDocument = () => run(async () => {
    const document = await pickRequestAttachment('support');
    if (document) { setDocuments(current => [document, ...current]); }
  });

  const handleSubmit = () => { return run(async () => {
    if (!issueType.trim() || !subject.trim() || !description.trim()) {
      showToast('Issue type, subject and description are required.');
      return;
    }

    const payload = {
      issueType: issueType.trim(),
      relatedProperty: relatedProperty.trim() || undefined,
      subject: subject.trim(),
      description: description.trim(),
      status: ticket?.status ?? 'Open',
      documents,
      remarks: ticket?.remarks ?? [],
      history:
        ticket?.history ?? [
          {
            id: generateId('support-history'),
            status: 'Open',
            updatedBy: 'User',
            updatedAt: new Date().toISOString(),
          },
        ],
    } as const;

    if (ticket) {
      await updateTicket(ticket.id, payload);
      showToast('Support ticket updated.');
      navigation.replace(ROUTES.services.supportTicketDetail, {
        ticketId: ticket.id,
      });
      return;
    }

    const created = await addTicket(payload);
    showToast('Support ticket created.');
    navigation.replace(ROUTES.services.supportTicketDetail, {
      ticketId: created.id,
    });
  
  }); };

  return (
    <ScreenContainer><RemoteStatus loading={remoteLoading} error={remoteError} retry={() => { void loadRemote().catch(() => {}); }} />
      <AppHeader
        title={ticket ? 'Edit Support Ticket' : 'Create Support Ticket'}
        subtitle="Submit and track your request"
        onBackPress={navigation.goBack}
      />
      <SectionHeader title="Ticket Information" />
      <View style={styles.categories}>
        {categories.map(category => <Pressable key={category.id} onPress={() => setIssueType(category.name)} style={[styles.category, issueType === category.name && styles.categorySelected]}><Text style={[styles.categoryText, issueType === category.name && styles.categoryTextSelected]}>{category.name}</Text></Pressable>)}
      </View>
      <AppInput
        label="Issue Type"
        onChangeText={setIssueType}
        placeholder="Login, Property Listing, Loan, Legal..."
        required
        value={issueType}
      />
      <AppInput
        label="Related Property ID (Optional)"
        onChangeText={setRelatedProperty}
        placeholder="Numeric property ID"
        value={relatedProperty}
      />
      <AppInput
        label="Subject"
        onChangeText={setSubject}
        placeholder="Short issue summary"
        required
        value={subject}
      />
      <AppInput
        label="Description"
        multiline
        onChangeText={setDescription}
        placeholder="Describe the issue you need help with"
        required
        value={description}
      />
      <SectionHeader title="Attachments" />
      <UploadBox
        onPress={handleAddDocument}
        subtitle="Choose a JPG or PNG image to attach."
        title="Add Image"
      />
      {documents.length ? (
        documents.map(document => (
          <DocumentCard
            document={document}
            key={document.id}
            onDelete={() => {
              setDocuments(current =>
                current.filter(item => item.id !== document.id),
              );
              showToast('Document removed.');
            }}
            onView={() => { void openUploadedDocument(document); }}
          />
        ))
      ) : (
        <Text style={styles.emptyCopy}>No attachments added yet.</Text>
      )}
      <AppButton disabled={busy}
        label={ticket ? 'Update Ticket' : 'Submit Ticket'}
        onPress={handleSubmit}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  categories: {flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm},
  category: {borderWidth: 1, borderColor: colors.border, borderRadius: 999, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, backgroundColor: colors.white},
  categorySelected: {backgroundColor: colors.primary, borderColor: colors.primary},
  categoryText: {color: colors.textPrimary},
  categoryTextSelected: {color: colors.white},
  emptyCopy: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
  },
});

export function SupportTicketFormScreen(props: Props) {
  const load = useSupportStore(state => state.load);
  const loading = useSupportStore(state => state.loading);
  const error = useSupportStore(state => state.error);
  const items = useSupportStore(state => state.tickets);
  useRemoteLoad(load);
  const id = props.route.params?.ticketId;
  if (id && !items.some(item => item.id === id)) {
    return <ScreenContainer><AppHeader title="Edit request" onBackPress={props.navigation.goBack} />
      <RemoteStatus loading={loading} error={error ?? (loading ? null : 'Request unavailable. Retry to refresh.')} retry={() => { void load().catch(() => {}); }} />
    </ScreenContainer>;
  }
  return <SupportTicketFormContent key={id ?? 'new'} {...props} />;
}
