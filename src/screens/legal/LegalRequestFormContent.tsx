import React, {useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

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
import {spacing} from '@/constants/spacing';
import {typography} from '@/constants/typography';
import {useAuthStore} from '@/store/authStore';
import {useLegalStore} from '@/store/legalStore';
import type {
  LegalRequest,
  ServicesStackParamList,
  UploadedDocument,
} from '@/types';
import {generateId} from '@/services/serviceUtils';
import {showToast} from '@/utils/toast';

interface LegalRequestFormContentProps {
  navigation: NativeStackNavigationProp<ServicesStackParamList>;
  request?: LegalRequest;
  type: LegalRequest['type'];
}

export function LegalRequestFormContent({
  navigation,
  request,
  type,
}: LegalRequestFormContentProps) {
  const user = useAuthStore(state => state.user);
  const teams = useLegalStore(state => state.teams);
  const addRequest = useLegalStore(state => state.addRequest);
  const updateRequest = useLegalStore(state => state.updateRequest);
  const [assignedTeamId, setAssignedTeamId] = useState(
    request?.assignedTeamId ?? teams[0]?.id ?? '',
  );
  const [applicantName, setApplicantName] = useState(
    request?.applicantName ?? user?.name ?? '',
  );
  const [ownerName, setOwnerName] = useState(request?.ownerName ?? '');
  const [buyerName, setBuyerName] = useState(request?.buyerName ?? '');
  const [propertyDetails, setPropertyDetails] = useState(
    request?.propertyDetails ?? '',
  );
  const [city, setCity] = useState(request?.location.city ?? user?.city ?? '');
  const [stateValue, setStateValue] = useState(
    request?.location.state ?? 'Uttar Pradesh',
  );
  const [area, setArea] = useState(request?.location.area ?? '');
  const [preferredRegistrationDate, setPreferredRegistrationDate] = useState(
    request?.preferredRegistrationDate ?? '',
  );
  const [documents, setDocuments] = useState<UploadedDocument[]>(
    request?.documents ?? [],
  );

  const handleAddDocument = () => {
    const nextIndex = documents.length + 1;
    setDocuments(current => [
      {
        id: `legal-form-document-${nextIndex}`,
        name: `${type} Document ${nextIndex}`,
        type: 'PDF',
        uri: `local://legal-document-${nextIndex}`,
        uploadedAt: new Date().toISOString(),
        status: 'uploaded',
      },
      ...current,
    ]);
    showToast('Document placeholder added locally.');
  };

  const handleSubmit = () => {
    if (
      !assignedTeamId ||
      !applicantName.trim() ||
      !ownerName.trim() ||
      !propertyDetails.trim() ||
      !city.trim() ||
      !stateValue.trim() ||
      !area.trim() ||
      (type === 'Property Registration' && !buyerName.trim()) ||
      (type === 'Property Registration' && !preferredRegistrationDate.trim())
    ) {
      showToast('Complete all required legal request fields.');
      return;
    }

    const payload = {
      type,
      assignedTeamId,
      applicantName: applicantName.trim(),
      ownerName: ownerName.trim(),
      buyerName:
        type === 'Property Registration' ? buyerName.trim() : undefined,
      propertyDetails: propertyDetails.trim(),
      location: {
        city: city.trim(),
        state: stateValue.trim(),
        area: area.trim(),
      },
      preferredRegistrationDate:
        type === 'Property Registration'
          ? preferredRegistrationDate.trim()
          : undefined,
      status: request?.status ?? 'Submitted',
      documents,
      remarks: request?.remarks ?? [],
      history:
        request?.history ?? [
          {
            id: generateId('legal-history'),
            status: 'Submitted',
            updatedBy: applicantName.trim(),
            updatedAt: new Date().toISOString(),
          },
        ],
    } as const;

    if (request) {
      updateRequest(request.id, payload);
      showToast('Legal request updated locally.');
      navigation.replace(ROUTES.services.legalRequestDetail, {
        requestId: request.id,
      });
      return;
    }

    const created = addRequest(payload);
    showToast('Legal request created locally.');
    navigation.replace(ROUTES.services.legalRequestDetail, {
      requestId: created.id,
    });
  };

  return (
    <ScreenContainer>
      <AppHeader
        title={request ? `Edit ${type}` : type}
        subtitle="Static-data legal request form with local document UI"
        onBackPress={navigation.goBack}
      />
      <View style={styles.banner}>
        <Text style={styles.bannerLabel}>Request Type</Text>
        <Text style={styles.bannerTitle}>{type}</Text>
        <Text style={styles.bannerCopy}>
          Select a team, add request details, and submit this legal workflow locally.
        </Text>
      </View>
      <SectionHeader title="Assigned Legal Team" />
      <View style={styles.teamChoices}>
        {teams.map(team => (
          <Text
            key={team.id}
            onPress={() => setAssignedTeamId(team.id)}
            style={[
              styles.teamChip,
              assignedTeamId === team.id && styles.teamChipSelected,
            ]}>
            {team.name}
          </Text>
        ))}
      </View>
      <SectionHeader title="Request Information" />
      <AppInput
        label="Applicant Name"
        onChangeText={setApplicantName}
        required
        value={applicantName}
      />
      <AppInput
        label="Owner Name"
        onChangeText={setOwnerName}
        required
        value={ownerName}
      />
      {type === 'Property Registration' ? (
        <AppInput
          label="Buyer Name"
          onChangeText={setBuyerName}
          required
          value={buyerName}
        />
      ) : null}
      <AppInput
        label="Property Details"
        multiline
        onChangeText={setPropertyDetails}
        placeholder="Residential plot in Gomti Nagar"
        required
        value={propertyDetails}
      />
      <AppInput label="City" onChangeText={setCity} required value={city} />
      <AppInput
        label="State"
        onChangeText={setStateValue}
        required
        value={stateValue}
      />
      <AppInput label="Area" onChangeText={setArea} required value={area} />
      {type === 'Property Registration' ? (
        <AppInput
          label="Preferred Registration Date (YYYY-MM-DD)"
          onChangeText={setPreferredRegistrationDate}
          placeholder="2026-06-20"
          required
          value={preferredRegistrationDate}
        />
      ) : null}
      <SectionHeader title="Documents" />
      <UploadBox
        onPress={handleAddDocument}
        subtitle="Add sale deed, ownership proof or ID placeholders."
        title="Add Document Placeholder"
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
        <Text style={styles.emptyCopy}>No documents added yet.</Text>
      )}
      <View style={styles.actions}>
        <AppButton
          label="Legal Tracking"
          onPress={() => navigation.navigate(ROUTES.services.legalRequestTracking)}
          style={styles.button}
          variant="outlined"
        />
        <AppButton
          label={request ? 'Update Request' : 'Submit Request'}
          onPress={handleSubmit}
          style={styles.button}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: colors.primary,
    borderRadius: spacing.radiusXl,
    padding: spacing.xl,
    gap: spacing.xs,
  },
  bannerLabel: {
    color: colors.accent,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
  },
  bannerTitle: {
    color: colors.white,
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
  },
  bannerCopy: {
    color: colors.textOnPrimaryMuted,
    fontSize: typography.fontSize.sm,
  },
  teamChoices: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  teamChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.textPrimary,
    fontWeight: typography.fontWeight.medium,
  },
  teamChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    color: colors.white,
  },
  emptyCopy: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  button: {
    flex: 1,
  },
});
