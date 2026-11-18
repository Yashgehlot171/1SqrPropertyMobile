import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

import {AppButton} from '@/components/common/AppButton';
import {StatusChip} from '@/components/common/StatusChip';
import {colors} from '@/constants/colors';
import {spacing} from '@/constants/spacing';
import {typography} from '@/constants/typography';
import type {LoanBank} from '@/types';
import {formatCurrency} from '@/utils/formatCurrency';

interface LoanBankCardProps {
  bank: LoanBank;
  onApply?: () => void;
  onViewTeam?: () => void;
  onCall?: () => void;
}

export function LoanBankCard({
  bank,
  onApply,
  onViewTeam,
  onCall,
}: LoanBankCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.copy}>
          <Text style={styles.name}>{bank.name}</Text>
          {bank.city || bank.contactPerson ? <Text style={styles.meta}>{[bank.city, bank.contactPerson].filter(Boolean).join(' · ')}</Text> : null}
        </View>
        {bank.interestRate ? <StatusChip label={`${bank.interestRate}%`} /> : null}
      </View>
      {bank.processingFee ? <Text style={styles.meta}>Processing fee: {bank.processingFee}</Text> : null}
      {bank.eligibility ? <Text style={styles.meta}>Eligibility: {bank.eligibility}</Text> : null}
      {bank.maxLoanAmount && bank.maxLoanAmount > 0 ? <Text style={styles.meta}>Maximum loan: {formatCurrency(bank.maxLoanAmount)}</Text> : null}
      <View style={styles.tags}>
        {bank.highlights.map(tag => (
          <StatusChip key={tag} label={tag} />
        ))}
      </View>
      <View style={styles.row}>
        <AppButton
          label="Apply"
          onPress={onApply}
          style={styles.button}
        />
        <AppButton label="Team Detail" onPress={onViewTeam} style={styles.button} variant="outlined" />
      </View>
      {bank.phone ? <AppButton label="Call Team" onPress={onCall} variant="outlined" /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: spacing.radiusXl,
    padding: spacing.xl,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.darkPurple,
    shadowOpacity: 0.05,
    shadowRadius: 14,
    shadowOffset: {width: 0, height: 8},
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
  },
  name: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
  meta: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    alignItems: 'stretch',
  },
  button: {
    flexGrow: 1,
    flexBasis: 140,
  },
});
