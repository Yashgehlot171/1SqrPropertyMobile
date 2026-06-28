import React, {useMemo, useState} from 'react';
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
  const banks = useLoanStore(state => state.banks);
  const [selectedBankId, setSelectedBankId] = useState(banks[0]?.id ?? '');
  const selectedBank = useMemo(
    () => banks.find(item => item.id === selectedBankId) ?? banks[0],
    [banks, selectedBankId],
  );
  const [loanAmount, setLoanAmount] = useState('5000000');
  const [downPayment, setDownPayment] = useState('500000');
  const [tenureYears, setTenureYears] = useState('20');
  const [interestRate, setInterestRate] = useState(
    String(selectedBank?.interestRate ?? 8.5),
  );

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

  const resetCalculator = () => {
    setLoanAmount('5000000');
    setDownPayment('500000');
    setTenureYears('20');
    setInterestRate(String(selectedBank?.interestRate ?? 8.5));
  };

  return (
    <ScreenContainer>
      <AppHeader title="Loan Calculator" onBackPress={navigation.goBack} />
      <Text style={styles.sectionTitle}>Preferred Bank</Text>
      <View style={styles.bankChips}>
        {banks.map(bank => (
          <Pressable
            key={bank.id}
            onPress={() => {
              setSelectedBankId(bank.id);
              setInterestRate(String(bank.interestRate));
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

      <AppInput
        keyboardType="numeric"
        label="Loan Amount"
        onChangeText={setLoanAmount}
        placeholder="5000000"
        required
        value={loanAmount}
      />
      <View style={styles.sliderTrack}>
        <View style={styles.sliderFill} />
        <View style={styles.sliderThumb} />
      </View>
      <View style={styles.rangeRow}>
        <Text style={styles.rangeText}>Rs.1,00,000</Text>
        <Text style={styles.rangeText}>Rs.5,00,00,000</Text>
      </View>
      <AppInput
        keyboardType="numeric"
        label="Down Payment"
        onChangeText={setDownPayment}
        placeholder="500000"
        value={downPayment}
      />
      <AppInput
        keyboardType="numeric"
        label="Interest Rate (p.a.)"
        onChangeText={setInterestRate}
        placeholder="8.5"
        required
        value={interestRate}
      />
      <AppInput
        keyboardType="numeric"
        label="Loan Tenure"
        onChangeText={setTenureYears}
        placeholder="20"
        required
        value={tenureYears}
      />

      <View style={styles.resultCard}>
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
      </View>

      <AppButton
        label="Apply for Loan"
        onPress={() => {
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

          navigation.navigate(ROUTES.services.emiResult, {
            loanAmount: amount,
            interestRate: rate,
            tenureYears: tenure,
            downPayment: down,
            bankId: selectedBankId || undefined,
          });
        }}
        style={styles.primaryButton}
      />
      <Pressable onPress={resetCalculator} style={styles.resetButton}>
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
  sliderTrack: {
    height: 4,
    borderRadius: 999,
    backgroundColor: colors.border,
    marginTop: -spacing.md,
  },
  sliderFill: {
    width: '48%',
    height: 4,
    borderRadius: 999,
    backgroundColor: colors.primary,
  },
  sliderThumb: {
    position: 'absolute',
    left: '47%',
    top: -5,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.primary,
  },
  rangeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -spacing.lg,
  },
  rangeText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.xs,
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
