import {pickRequestAttachment} from '@/services/requestAttachment';
import {useRemoteLoad, useRemoteAction} from '@/hooks/useRemoteFlow';
import {RemoteStatus} from '@/components/common/RemoteStatus';
import React, {useEffect, useMemo, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
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
import {spacing} from '@/constants/spacing';
import {typography} from '@/constants/typography';
import {useAuthStore} from '@/store/authStore';
import {useLoanStore} from '@/store/loanStore';
import type {ServicesStackParamList, UploadedDocument} from '@/types';
import {generateId} from '@/services/serviceUtils';
import {formatCurrency} from '@/utils/formatCurrency';
import {showToast} from '@/utils/toast';

type Props = NativeStackScreenProps<ServicesStackParamList, 'LoanApplication'>;

function LoanApplicationContent({navigation, route}: Props) {
  const loadRemote = useLoanStore(state => state.load);
  const remoteLoading = useLoanStore(state => state.loading);
  const remoteError = useLoanStore(state => state.error);
  useRemoteLoad(loadRemote);
  const {run, busy} = useRemoteAction();

  const user = useAuthStore(state => state.user);
  const banks = useLoanStore(state => state.banks);
  const requests = useLoanStore(state => state.requests);
  const addRequest = useLoanStore(state => state.addRequest);
  const updateRequest = useLoanStore(state => state.updateRequest);

  const existingRequest = useMemo(
    () =>
      route.params?.requestId
        ? requests.find(item => item.id === route.params?.requestId)
        : undefined,
    [requests, route.params?.requestId],
  );
  const defaultBank =
    banks.find(item => item.id === route.params?.bankId) ??
    banks.find(item => item.id === existingRequest?.preferredBankId) ??
    banks[0];

  const [preferredBankId, setPreferredBankId] = useState(
    existingRequest?.preferredBankId ?? defaultBank?.id ?? '',
  );
  const [applicantName, setApplicantName] = useState(
    existingRequest?.applicantName ?? user?.name ?? '',
  );
  const [mobile, setMobile] = useState(
    existingRequest?.mobile ?? user?.mobile ?? '',
  );
  const [email, setEmail] = useState(existingRequest?.email ?? user?.email ?? '');
  const [monthlyIncome, setMonthlyIncome] = useState(
    String(existingRequest?.monthlyIncome ?? ''),
  );
  const [employmentType, setEmploymentType] = useState(
    existingRequest?.employmentType ?? 'Salaried',
  );
  const [loanAmount, setLoanAmount] = useState(
    String(existingRequest?.loanAmount ?? route.params?.loanAmount ?? ''),
  );
  const [downPayment, setDownPayment] = useState(
    String(existingRequest?.downPayment ?? route.params?.downPayment ?? ''),
  );
  const [tenureYears, setTenureYears] = useState(
    String(existingRequest?.tenureYears ?? route.params?.tenureYears ?? ''),
  );
  const [interestRate, setInterestRate] = useState(
    String(
      existingRequest?.interestRate ??
        route.params?.interestRate ??
        defaultBank?.interestRate ??
        '',
    ),
  );
  const [propertyDetails, setPropertyDetails] = useState(
    existingRequest?.propertyDetails ?? '',
  );
  const [documents, setDocuments] = useState<UploadedDocument[]>(
    existingRequest?.documents ?? [],
  );

  const selectedBank = banks.find(item => item.id === preferredBankId);

  useEffect(() => {
    if (!preferredBankId && defaultBank) {
      setPreferredBankId(defaultBank.id);
      if (defaultBank.interestRate) setInterestRate(String(defaultBank.interestRate));
    }
  }, [defaultBank, preferredBankId]);

  const handleAddDocument = () => run(async () => {
    const document = await pickRequestAttachment('loan');
    if (document) { setDocuments(current => [document, ...current]); }
  });

  const handleSubmit = () => { return run(async () => {
    const incomeValue = Number(monthlyIncome);
    const loanValue = Number(loanAmount);
    const downValue = Number(downPayment);
    const tenureValue = Number(tenureYears);
    const rateValue = Number(interestRate);

    if (
      !preferredBankId ||
      !applicantName.trim() ||
      !/^\d{10}$/.test(mobile.trim()) ||
      !email.trim() ||
      !incomeValue ||
      !loanValue ||
      tenureValue < 0 ||
      rateValue < 0 ||

      downValue < 0 ||
      downValue >= loanValue
    ) {
      showToast('Complete all required fields with valid values.');
      return;
    }

    const payload = {
      preferredBankId,
      applicantName: applicantName.trim(),
      mobile: mobile.trim(),
      email: email.trim(),
      monthlyIncome: incomeValue,
      employmentType: employmentType.trim(),
      loanAmount: loanValue,
      downPayment: downValue,
      tenureYears: tenureValue,
      interestRate: rateValue,
      propertyDetails: propertyDetails.trim(),
      status: existingRequest?.status ?? 'New',
      documents,
      remarks: existingRequest?.remarks ?? [],
      history:
        existingRequest?.history ?? [
          {
            id: generateId('loan-history'),
            status: 'New',
            updatedBy: applicantName.trim(),
            updatedAt: new Date().toISOString(),
          },
        ],
    } as const;

    if (existingRequest) {
      await updateRequest(existingRequest.id, payload);
      showToast('Loan request updated.');
      navigation.replace(ROUTES.services.loanRequestDetail, {
        requestId: existingRequest.id,
      });
      return;
    }

    const created = await addRequest(payload);
    showToast('Loan request created.');
    navigation.replace(ROUTES.services.loanRequestDetail, {
      requestId: created.id,
    });
  
  }); };

  return (
    <ScreenContainer><RemoteStatus loading={remoteLoading} error={remoteError} retry={() => { void loadRemote().catch(() => {}); }} />
      <AppHeader
        title={existingRequest ? 'Edit Loan Application' : 'Loan Application'}
        subtitle="Submit and track your request"
        onBackPress={navigation.goBack}
      />
      {selectedBank ? (
        <View style={styles.bankBanner}>
          <Text style={styles.bankLabel}>Preferred bank</Text>
          <Text style={styles.bankTitle}>{selectedBank.name}</Text>
          <Text style={styles.bankCopy}>
            {[selectedBank.contactPerson, selectedBank.interestRate ? `${selectedBank.interestRate}% lender rate` : undefined].filter(Boolean).join(' · ') || 'Additional lender details not provided'}
          </Text>
        </View>
      ) : null}
      <SectionHeader title="Bank Selection" />
      <View style={styles.bankOptions}>
        {banks.map(bank => (
          <StatusChipButton
            isSelected={preferredBankId === bank.id}
            key={bank.id}
            label={bank.name}
            onPress={() => {
              setPreferredBankId(bank.id);
              setInterestRate(bank.interestRate ? String(bank.interestRate) : '');
            }}
          />
        ))}
      </View>
      <SectionHeader title="Applicant Information" />
      <AppInput
        label="Applicant Name"
        onChangeText={setApplicantName}
        required
        value={applicantName}
      />
      <AppInput
        keyboardType="phone-pad"
        label="Mobile Number"
        onChangeText={setMobile}
        required
        value={mobile}
      />
      <AppInput
        keyboardType="email-address"
        label="Email"
        onChangeText={setEmail}
        required
        value={email}
      />
      <AppInput
        keyboardType="numeric"
        label="Monthly Income"
        onChangeText={setMonthlyIncome}
        required
        value={monthlyIncome}
      />
      <AppInput
        label="Employment Type"
        onChangeText={setEmploymentType}
        required
        value={employmentType}
      />
      <SectionHeader title="Loan Details" />
      <AppInput
        keyboardType="numeric"
        label="Property Budget"
        onChangeText={setLoanAmount}
        required
        value={loanAmount}
      />
      <AppInput
        keyboardType="numeric"
        label="Down Payment"
        onChangeText={setDownPayment}
        value={downPayment}
      />
      <AppInput
        keyboardType="numeric"
        label="Tenure (Years)"
        onChangeText={setTenureYears}
        required
        value={tenureYears}
      />
      <AppInput
        keyboardType="numeric"
        label="Interest Rate (%)"
        onChangeText={setInterestRate}
        required
        value={interestRate}
      />
      <AppInput
        label="Property Details"
        multiline
        onChangeText={setPropertyDetails}
        placeholder="Enter property details"
        required
        value={propertyDetails}
      />
      <Text style={styles.loanCopy}>
        Estimated financed amount: {formatCurrency(Math.max(Number(loanAmount || 0) - Number(downPayment || 0), 0))}
      </Text>
      <SectionHeader title="Documents" />
      <UploadBox
        onPress={handleAddDocument}
        subtitle="Choose a JPG or PNG image to attach."
        title="Add Image"
      />
      {documents.map(document => (
        <DocumentCard
          document={document}
          key={document.id}
          onDelete={() => {
            setDocuments(current =>
              current.filter(item => item.id !== document.id),
            );
            showToast('Document removed.');
          }}
          onView={() => showToast(`Viewing ${document.name}.`)}
        />
      ))}
      <View style={styles.actions}>
        <AppButton disabled={busy}
          label="Loan Marketplace"
          onPress={() => navigation.navigate(ROUTES.services.loanMarketplace)}
          style={styles.button}
          variant="outlined"
        />
        <AppButton disabled={busy}
          label={existingRequest ? 'Update Request' : 'Submit Request'}
          onPress={handleSubmit}
          style={styles.button}
        />
      </View>
    </ScreenContainer>
  );
}

function StatusChipButton({
  label,
  isSelected,
  onPress,
}: {
  label: string;
  isSelected: boolean;
  onPress: () => void;
}) {
  return (
    <Text onPress={onPress} style={[styles.choiceChip, isSelected && styles.choiceChipSelected]}>
      {label}
    </Text>
  );
}

const styles = StyleSheet.create({
  bankBanner: {
    backgroundColor: colors.primary,
    borderRadius: spacing.radiusXl,
    padding: spacing.xl,
    gap: spacing.xs,
  },
  bankLabel: {
    color: colors.accent,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
  },
  bankTitle: {
    color: colors.white,
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
  },
  bankCopy: {
    color: colors.textOnPrimaryMuted,
    fontSize: typography.fontSize.sm,
  },
  bankOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  choiceChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.textPrimary,
    fontWeight: typography.fontWeight.medium,
  },
  choiceChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    color: colors.white,
  },
  loanCopy: {
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

export function LoanApplicationScreen(props: Props) {
  const load = useLoanStore(state => state.load);
  const loading = useLoanStore(state => state.loading);
  const error = useLoanStore(state => state.error);
  const items = useLoanStore(state => state.requests);
  useRemoteLoad(load);
  const id = props.route.params?.requestId;
  if (id && !items.some(item => item.id === id)) {
    return <ScreenContainer><AppHeader title="Edit request" onBackPress={props.navigation.goBack} />
      <RemoteStatus loading={loading} error={error ?? (loading ? null : 'Request unavailable. Retry to refresh.')} retry={() => { void load().catch(() => {}); }} />
    </ScreenContainer>;
  }
  return <LoanApplicationContent key={id ?? 'new'} {...props} />;
}
