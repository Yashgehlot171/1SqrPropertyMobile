import {getEmiEstimate} from '@/services/calculatorApi';
import {useRemoteAction} from '@/hooks/useRemoteFlow';
import {useRemoteLoad} from '@/hooks/useRemoteFlow';
import {RemoteStatus} from '@/components/common/RemoteStatus';
import React, {useEffect, useMemo, useState} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';

import {
  AppButton,
  AppHeader,
  AppInput,
  ScreenContainer,
} from '@/components';
import {colors} from '@/constants/colors';
import {ROUTES} from '@/constants/routes';
import {spacing} from '@/constants/spacing';
import {typography} from '@/constants/typography';
import {useLoanStore} from '@/store/loanStore';
import type {ServicesStackParamList} from '@/types';
import {calculateEmi} from '@/utils/emiCalculator';
import {showToast} from '@/utils/toast';

type Props = NativeStackScreenProps<ServicesStackParamList, 'LoanCalculator'>;

export function LoanCalculatorScreen({navigation}: Props) {
  const loadRemote = useLoanStore(state => state.load);
  const remoteLoading = useLoanStore(state => state.loading);
  const remoteError = useLoanStore(state => state.error);
  useRemoteLoad(loadRemote);

  const {run, busy} = useRemoteAction();
  const banks = useLoanStore(state => state.banks);
  const [selectedBankId, setSelectedBankId] = useState(banks[0]?.id ?? '');
  const selectedBank = useMemo(
    () => banks.find(item => item.id === selectedBankId) ?? banks[0],
    [banks, selectedBankId],
  );
  const [loanAmount, setLoanAmount] = useState('');
  const [downPayment, setDownPayment] = useState('');
  const [tenureYears, setTenureYears] = useState('');
  const [interestRate, setInterestRate] = useState('');
  useEffect(() => {
    if (!selectedBankId && banks.length) setSelectedBankId(banks[0].id);
  }, [banks, selectedBankId]);
  useEffect(() => {
    if (selectedBank?.interestRate) setInterestRate(String(selectedBank.interestRate));
  }, [selectedBankId, selectedBank?.interestRate]);

  const financedAmount =
    Math.max(Number(loanAmount || 0) - Number(downPayment || 0), 0) || 0;
  const principal = Number(loanAmount || 0);
  const emiResult = useMemo(
    () =>
      calculateEmi({
        loanAmount: principal,
        interestRate: Number(interestRate || 0),
        tenureYears: Number(tenureYears || 0),
        downPayment: Number(downPayment || 0),
      }),
    [downPayment, interestRate, principal, tenureYears],
  );
  const isCalculationReady = principal > 0 && Number(tenureYears) > 0 && Number(interestRate) > 0 && Number(downPayment || 0) >= 0 && Number(downPayment || 0) < principal;

  const resetCalculator = () => {
    setLoanAmount('');
    setDownPayment('');
    setTenureYears('');
    setInterestRate(selectedBank?.interestRate ? String(selectedBank.interestRate) : '');
  };

  return (
    <ScreenContainer><RemoteStatus loading={remoteLoading} error={remoteError} retry={() => { void loadRemote().catch(() => {}); }} />
      <AppHeader title="Loan Calculator" onBackPress={navigation.goBack} />
      <Text style={styles.sectionTitle}>Preferred Bank</Text>
      <View style={styles.bankChips}>
        {banks.map(bank => (
          <Pressable
            key={bank.id}
            onPress={() => {
              setSelectedBankId(bank.id);
              setInterestRate(bank.interestRate ? String(bank.interestRate) : '');
            }}
            style={[
              styles.bankChip,
              selectedBankId === bank.id && styles.bankChipSelected,
            ]}>
            <Text
              style={[
                styles.bankChipText,
                selectedBankId === bank.id && styles.bankChipTextSelected,
              ]}>
              {bank.name}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.helper}>{selectedBank?.interestRate ? `${selectedBank.name} supplied the rate shown below. Confirm terms with the lender.` : 'Enter the amount and lender terms you want to estimate. No offer or rate is preselected.'}</Text>
      <AppInput keyboardType="numeric" label="Property Budget" onChangeText={setLoanAmount} placeholder="Enter amount" required value={loanAmount} />
      <AppInput
        keyboardType="numeric"
        label="Down Payment"
        onChangeText={setDownPayment}
        placeholder="Enter down payment"
        value={downPayment}
      />
      <AppInput
        keyboardType="numeric"
        label="Interest Rate (p.a.)"
        onChangeText={setInterestRate}
        placeholder="Enter lender rate"
        required
        value={interestRate}
      />
      <AppInput
        keyboardType="numeric"
        label="Loan Tenure"
        onChangeText={setTenureYears}
        placeholder="Enter years"
        required
        value={tenureYears}
      />

      {isCalculationReady ? <View style={styles.resultCard}>
        <Text style={styles.resultTitle}>Your EMI</Text>
        <View style={styles.emiRow}>
          <Text style={styles.emiValue}>
            Rs.{emiResult.monthlyEmi.toLocaleString('en-IN')}
          </Text>
          <Text style={styles.emiSuffix}>/month</Text>
        </View>
        <ResultRow label="Principal Amount" value={principal} />
        <ResultRow label="Financed Amount" value={financedAmount} />
        <ResultRow label="Total Interest" value={emiResult.totalInterest} />
        <ResultRow label="Total Amount" value={emiResult.totalPayable} />
      </View> : <View style={styles.waitingCard}><Text style={styles.waitingTitle}>EMI estimate</Text><Text style={styles.waitingCopy}>Enter a positive amount, tenure and lender rate, with a down payment below the property budget, to calculate an estimate.</Text></View>}

      <AppButton disabled={busy}
        label="Apply for Loan"
        onPress={() => run(async () => {
          const amount = Number(loanAmount);
          const down = Number(downPayment);
          const tenure = Number(tenureYears);
          const rate = Number(interestRate);

          if (!amount || !tenure || !rate || down < 0 || down >= amount) {
            showToast(
              'Enter a valid loan amount, down payment, tenure and interest rate.',
            );
            return;
          }

          const result = await getEmiEstimate({loanAmount: amount, downPayment: down, interestRate: rate, tenureYears: tenure});
          navigation.navigate(ROUTES.services.emiResult, {result,
            loanAmount: amount,
            interestRate: rate,
            tenureYears: tenure,
            downPayment: down,
            bankId: selectedBankId || undefined,
          });
        })}
        style={styles.primaryButton}
      />
      <Pressable disabled={busy} onPress={resetCalculator} style={styles.resetButton}>
        <Icon color={colors.primary} name="refresh-outline" size={18} />
        <Text style={styles.resetText}>Reset</Text>
      </Pressable>
    </ScreenContainer>
  );
}

function ResultRow({label, value}: {label: string; value: number}) {
  return (
    <View style={styles.resultRow}>
      <Text style={styles.resultLabel}>{label}</Text>
      <Text style={styles.resultAmount}>
        Rs.{Math.round(value).toLocaleString('en-IN')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    marginBottom: -spacing.sm,
  },
  bankChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  bankChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.radiusMd,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  bankChipSelected: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  bankChipText: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },
  bankChipTextSelected: {
    color: colors.primary,
  },
  helper: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.xs,
    lineHeight: typography.lineHeight.xs,
  },
  waitingCard: {
    padding: spacing.lg,
    gap: spacing.xs,
    borderRadius: spacing.radiusLg,
    backgroundColor: colors.brandPurpleSubtle,
  },
  waitingTitle: {
    color: colors.darkPurple,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
  },
  waitingCopy: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.sm,
  },
  resultCard: {
    backgroundColor: colors.white,
    borderRadius: spacing.radiusLg,
    borderWidth: 1,
    borderColor: colors.chipBorder,
    padding: spacing.xl,
    gap: spacing.md,
    shadowColor: colors.primary,
    shadowOpacity: 0.05,
    shadowRadius: 14,
    shadowOffset: {width: 0, height: 8},
    elevation: 2,
  },
  resultTitle: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
  },
  emiRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  emiValue: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
  },
  emiSuffix: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.xs,
    paddingBottom: spacing.xs,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  resultLabel: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
  },
  resultAmount: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  primaryButton: {
    borderRadius: spacing.radiusMd,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: -spacing.md,
  },
  resetText: {
    color: colors.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
  },
});
