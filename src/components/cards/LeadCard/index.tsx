import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import {StatusChip} from '@/components/common/StatusChip';
import {colors} from '@/constants/colors';
import {spacing} from '@/constants/spacing';
import {typography} from '@/constants/typography';
import type {Lead} from '@/types';

interface LeadCardProps {
  lead: Lead;
  onPress?: () => void;
  onCall?: () => void;
  onWhatsApp?: () => void;
}

export function LeadCard({lead, onPress, onCall, onWhatsApp}: LeadCardProps) {
  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={styles.header}>
        <View style={styles.copy}>
          <Text style={styles.name}>{lead.buyer.name}</Text>
          <Text style={styles.property}>{lead.property.title}</Text>
        </View>
        <StatusChip label={lead.status} />
      </View>
      <Text style={styles.meta}>{lead.buyer.mobile}</Text>
      <Text style={styles.meta}>
        Follow-up: {lead.followUpDate ?? 'Not scheduled'}
      </Text>
      <Text style={styles.remark} numberOfLines={2}>
        {lead.lastRemark ?? 'No remark added yet.'}
      </Text>
      <View style={styles.actions}>
        <ActionButton icon="eye-outline" label="View" onPress={onPress} />
        <ActionButton icon="call-outline" label="Call" onPress={onCall} />
        <ActionButton
          icon="logo-whatsapp"
          label="WhatsApp"
          onPress={onWhatsApp}
        />
      </View>
    </Pressable>
  );
}

function ActionButton({
  icon,
  label,
  onPress,
}: {
  icon: string;
  label: string;
  onPress?: () => void;
}) {
  return (
    <Pressable disabled={!onPress} onPress={onPress} style={styles.actionButton}>
      <Icon color={colors.secondary} name={icon} size={16} />
      <Text style={styles.actionText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: spacing.radiusXl,
    padding: spacing.xl,
    gap: spacing.sm,
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
  name: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
  },
  property: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
  },
  meta: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
  },
  remark: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.sm,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    backgroundColor: colors.muted,
  },
  actionText: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },
});
