import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';

import {
  AppButton,
  AppHeader,
  EmptyState,
  ScreenContainer,
  SectionHeader,
  StatusChip,
} from '@/components';
import {colors} from '@/constants/colors';
import {ROUTES} from '@/constants/routes';
import {spacing} from '@/constants/spacing';
import {typography} from '@/constants/typography';
import {useLoanStore} from '@/store/loanStore';
import type {ServicesStackParamList} from '@/types';
import {
  callFinanceTeam,
  openWhatsAppForFinanceTeam,
} from '@/utils/financeActions';
import {formatCurrency} from '@/utils/formatCurrency';

type Props = NativeStackScreenProps<ServicesStackParamList, 'FinanceTeamDetail'>;

export function FinanceTeamDetailScreen({navigation, route}: Props) {
  const banks = useLoanStore(state => state.banks);
  const bank = banks.find(item => item.id === route.params.bankId);

  if (!bank) {
    return (
      <ScreenContainer>
        <AppHeader title="Finance Team" onBackPress={navigation.goBack} />
        <EmptyState
          description="The selected lender team is not available locally."
          title="Finance team not found"
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <AppHeader
        title={`${bank.name} Team`}
        subtitle={bank.city}
        onBackPress={navigation.goBack}
      />
      <View style={styles.hero}>
        <Text style={styles.heroLabel}>Relationship Manager</Text>
        <Text style={styles.heroTitle}>{bank.contactPerson}</Text>
        <Text style={styles.heroCopy}>
          {bank.turnaroundTime} | Rate starts at {bank.interestRate}%
        </Text>
        <View style={styles.chips}>
          {bank.highlights.map(item => (
            <StatusChip key={item} label={item} />
          ))}
        </View>
      </View>
      <View style={styles.card}>
        <SectionHeader title="Team Information" />
        <DetailRow label="Bank" value={bank.name} />
        <DetailRow label="City" value={bank.city} />
        <DetailRow label="Phone" value={bank.phone} />
        <DetailRow label="WhatsApp" value={bank.whatsapp} />
        <DetailRow label="Eligibility" value={bank.eligibility} />
        <DetailRow
          label="Max Loan"
          value={formatCurrency(bank.maxLoanAmount)}
        />
        <DetailRow label="Processing Fee" value={bank.processingFee} />
        <DetailRow label="Turnaround" value={bank.turnaroundTime} />
      </View>
      <View style={styles.actions}>
        <AppButton
          label="Call"
          onPress={() => {
            void callFinanceTeam(bank);
          }}
          style={styles.button}
          variant="outlined"
        />
        <AppButton
          label="WhatsApp"
          onPress={() => {
            void openWhatsAppForFinanceTeam(bank, 'a home loan application');
          }}
          style={styles.button}
          variant="outlined"
        />
      </View>
      <AppButton
        label="Start Loan Application"
        onPress={() =>
          navigation.navigate(ROUTES.services.loanApplication, {
            bankId: bank.id,
            interestRate: bank.interestRate,
          })
        }
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
  heroLabel: {
    color: colors.accent,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
  },
  heroTitle: {
    color: colors.white,
    fontSize: typography.fontSize.xxl,
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
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  button: {
    flex: 1,
  },
});
