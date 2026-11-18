import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

import {AppButton} from '@/components/common/AppButton';
import {StatusChip} from '@/components/common/StatusChip';
import {colors} from '@/constants/colors';
import {spacing} from '@/constants/spacing';
import {typography} from '@/constants/typography';
import type {SupportTicket} from '@/types';

interface SupportTicketCardProps {
  ticket: SupportTicket;
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function SupportTicketCard({
  ticket,
  onView,
  onEdit,
  onDelete,
}: SupportTicketCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.copy}>
          <Text style={styles.title}>{ticket.subject}</Text>
          <Text style={styles.meta}>{ticket.issueType}</Text>
          <Text style={styles.meta}>{ticket.description}</Text>
        </View>
        <StatusChip label={ticket.status} />
      </View>
      <View style={styles.actions}>
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
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.darkPurple,
    shadowOpacity: 0.035,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 5},
    elevation: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
  meta: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.sm,
    flexShrink: 1,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  button: {
    flexGrow: 1,
    flexBasis: 120,
  },
});
