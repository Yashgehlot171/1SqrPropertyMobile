import React, {useMemo} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';

import {
  AppButton,
  AppHeader,
  ScreenContainer,
  SectionHeader,
  StatCard,
  StatusChip,
} from '@/components';
import {colors} from '@/constants/colors';
import {ROUTES} from '@/constants/routes';
import {spacing} from '@/constants/spacing';
import {typography} from '@/constants/typography';
import {useLoanStore} from '@/store/loanStore';
import type {ServicesStackParamList} from '@/types';
import {calculateEmi} from '@/utils/emiCalculator';
import {
  callFinanceTeam,
  shareEmiResult,
} from '@/utils/financeActions';
import {formatCurrency} from '@/utils/formatCurrency';

type Props = NativeStackScreenProps<ServicesStackParamList, 'EmiResult'>;

export function EmiResultScreen({navigation, route}: Props) {
  const {loanAmount, interestRate, tenureYears, downPayment, bankId} =
    route.params;
  const banks = useLoanStore(state => state.banks);
  const selectedBank = banks.find(item => item.id === bankId);
  const result = useMemo(
    () =>
      calculateEmi({
        loanAmount,
        interestRate,
        tenureYears,
        downPayment,
      }),
    [downPayment, interestRate, loanAmount, tenureYears],
  );
  const financedAmount = Math.max(loanAmount - downPayment, 0);

  return (
    <ScreenContainer>
      <AppHeader
        title="EMI Result"
        subtitle="Monthly payment and interest breakdown"
        onBackPress={navigation.goBack}
      />
      <View style={styles.hero}>
        <Text style={styles.heroLabel}>Estimated EMI</Text>
        <Text style={styles.heroValue}>
          {formatCurrency(result.monthlyEmi)} / month
        </Text>
        <Text style={styles.heroCopy}>
          {selectedBank ? `${selectedBank.name} | ` : ''}
          {interestRate}% for {tenureYears} years
        </Text>
        <View style={styles.chips}>
          <StatusChip label={`${interestRate}% rate`} />
          <StatusChip label={`${tenureYears} years`} />
        </View>
      </View>
      <View style={styles.stats}>
        <StatCard label="Financed Amount" value={formatCurrency(financedAmount)} />
        <StatCard label="Down Payment" value={formatCurrency(downPayment)} />
        <StatCard
          label="Total Interest"
          value={formatCurrency(result.totalInterest)}
        />
        <StatCard
          label="Total Payable"
          value={formatCurrency(result.totalPayable)}
        />
      </View>
      <View style={styles.card}>
        <SectionHeader title="Next Steps" />
        <View style={styles.actions}>
          <AppButton
            label="Apply Loan"
            onPress={() =>
              navigation.navigate(ROUTES.services.loanApplication, {
                bankId,
                loanAmount,
                interestRate,
                tenureYears,
                downPayment,
              })
            }
            style={styles.button}
          />
          <AppButton
            label="Compare Lenders"
            onPress={() => navigation.navigate(ROUTES.services.loanMarketplace)}
            style={styles.button}
            variant="outlined"
          />
        </View>
        <View style={styles.actions}>
          <AppButton
            label="Share Result"
            onPress={() => {
              void shareEmiResult(
                selectedBank,
                {loanAmount, interestRate, tenureYears, downPayment},
                result,
              );
            }}
            style={styles.button}
            variant="outlined"
          />
          <AppButton
            label="Track Requests"
            onPress={() => navigation.navigate(ROUTES.services.loanRequestTracking)}
            style={styles.button}
            variant="outlined"
          />
        </View>
        {selectedBank ? (
          <AppButton
            label="Call Finance Team"
            onPress={() => {
              void callFinanceTeam(selectedBank);
            }}
            variant="outlined"
          />
        ) : null}
      </View>
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
  heroLabel: {
    color: colors.accent,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
  },
  heroValue: {
    color: colors.white,
    fontSize: typography.fontSize.display,
    fontWeight: typography.fontWeight.bold,
  },
  heroCopy: {
    color: colors.textOnPrimaryMuted,
    fontSize: typography.fontSize.sm,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  stats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: spacing.radiusXl,
    padding: spacing.xl,
    gap: spacing.md,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  button: {
    flex: 1,
  },
});
