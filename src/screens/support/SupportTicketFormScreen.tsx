import React, {useMemo, useState} from 'react';
import {StyleSheet, Text} from 'react-native';
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

type Props = NativeStackScreenProps<ServicesStackParamList, 'SupportTicketForm'>;

export function SupportTicketFormScreen({navigation, route}: Props) {
  const ticketId = route.params?.ticketId;
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

  const handleAddDocument = () => {
    const nextIndex = documents.length + 1;
    setDocuments(current => [
      {
        id: `support-form-document-${nextIndex}`,
        name: `Support Attachment ${nextIndex}`,
        type: 'PDF',
        uri: `local://support-document-${nextIndex}`,
        uploadedAt: new Date().toISOString(),
        status: 'uploaded',
      },
      ...current,
    ]);
    showToast('Document placeholder added locally.');
  };

  const handleSubmit = () => {
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
      updateTicket(ticket.id, payload);
      showToast('Support ticket updated locally.');
      navigation.replace(ROUTES.services.supportTicketDetail, {
        ticketId: ticket.id,
      });
      return;
    }

    const created = addTicket(payload);
    showToast('Support ticket created locally.');
    navigation.replace(ROUTES.services.supportTicketDetail, {
      ticketId: created.id,
    });
  };

  return (
    <ScreenContainer>
      <AppHeader
        title={ticket ? 'Edit Support Ticket' : 'Create Support Ticket'}
        subtitle="Static-data support request form with local document UI"
        onBackPress={navigation.goBack}
      />
      <SectionHeader title="Ticket Information" />
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
        placeholder="property-1"
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
        subtitle="Add screenshots or proof placeholders to this local ticket."
        title="Add Attachment Placeholder"
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
              showToast('Document removed locally.');
            }}
            onView={() => showToast(`Viewing ${document.name}.`)}
          />
        ))
      ) : (
        <Text style={styles.emptyCopy}>No attachments added yet.</Text>
      )}
      <AppButton
        label={ticket ? 'Update Ticket' : 'Submit Ticket'}
        onPress={handleSubmit}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  emptyCopy: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
  },
});
