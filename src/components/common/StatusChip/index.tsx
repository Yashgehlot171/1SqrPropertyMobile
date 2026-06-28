import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

import {colors, statusColors} from '@/constants/colors';
import {spacing} from '@/constants/spacing';
import {typography} from '@/constants/typography';

interface StatusChipProps {
  label: string;
}

const labelColorMap: Record<string, string> = {
  Active: statusColors.active,
  Pending: statusColors.pending,
  Sold: statusColors.sold,
  Rejected: statusColors.rejected,
  Draft: statusColors.draft,
  New: statusColors.new,
  Contacted: statusColors.contacted,
  Interested: statusColors.interested,
  'Site Visit': statusColors.siteVisit,
  Negotiation: statusColors.negotiation,
  Closed: statusColors.closed,
  Lost: statusColors.lost,
  Submitted: statusColors.submitted,
  'Under Review': statusColors.underReview,
  'Document Required': statusColors.documentRequired,
  Verified: statusColors.verified,
  Completed: statusColors.completed,
  'In Review': statusColors.inReview,
  Processing: statusColors.processing,
  Approved: statusColors.approved,
  Disbursed: statusColors.disbursed,
  Open: statusColors.open,
  'In Progress': statusColors.inProgress,
  'Waiting for User': statusColors.waitingForUser,
  Resolved: statusColors.resolved,
};

function getStatusColor(label: string) {
  return labelColorMap[label] ?? colors.secondary;
}

export function StatusChip({label}: StatusChipProps) {
  const backgroundColor = getStatusColor(label);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: `${backgroundColor}14`,
          borderColor: `${backgroundColor}32`,
        },
      ]}>
      <Text style={[styles.label, {color: backgroundColor}]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    alignSelf: 'flex-start',
    borderWidth: 1,
  },
  label: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semiBold,
  },
});
