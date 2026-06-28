import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

import {AppButton} from '@/components/common/AppButton';
import {StatusChip} from '@/components/common/StatusChip';
import {colors} from '@/constants/colors';
import {spacing} from '@/constants/spacing';
import {typography} from '@/constants/typography';
import type {LoanRequest} from '@/types';
import {formatCurrency} from '@/utils/formatCurrency';

interface LoanRequestCardProps {
  request: LoanRequest;
  bankName?: string;
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function LoanRequestCard({
  request,
  bankName,
  onView,
  onEdit,
  onDelete,
}: LoanRequestCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.copy}>
          <Text style={styles.name}>{request.applicantName}</Text>
          <Text style={styles.meta}>{request.propertyDetails}</Text>
          <Text style={styles.meta}>{bankName ?? 'No preferred bank'}</Text>
        </View>
        <StatusChip label={request.status} />
      </View>
      <Text style={styles.meta}>
        Loan Amount: {formatCurrency(request.loanAmount)}
      </Text>
      <Text style={styles.meta}>
        Income: {formatCurrency(request.monthlyIncome)} / month
      </Text>
      <View style={styles.row}>
        {onView ? (
          <AppButton
            label="View"
            onPress={onView}
            style={styles.button}
            variant="outlined"
          />
        ) : null}
        {onEdit ? (
          <AppButton
            label="Edit"
            onPress={onEdit}
            style={styles.button}
            variant="outlined"
          />
        ) : null}
      </View>
      {onDelete ? (
        <AppButton label="Delete" onPress={onDelete} variant="danger" />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: spacing.radiusXl,
    padding: spacing.xl,
    gap: spacing.md,
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
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  button: {
    flex: 1,
  },
});
