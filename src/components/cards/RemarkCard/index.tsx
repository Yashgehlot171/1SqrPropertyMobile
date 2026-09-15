import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';

import {colors} from '@/constants/colors';
import {spacing} from '@/constants/spacing';
import {typography} from '@/constants/typography';
import type {Remark} from '@/types';
import {formatDate} from '@/utils/dateUtils';

interface RemarkCardProps {
  remark: Remark;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function RemarkCard({remark, onEdit, onDelete}: RemarkCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.text}>{remark.text}</Text>
      <Text style={styles.meta}>
        {remark.addedBy} | {formatDate(remark.date)}
      </Text>
      {onEdit || onDelete ? (
        <View style={styles.actions}>
          {onEdit ? (
            <Pressable onPress={onEdit} style={styles.action}>
              <Text style={styles.actionText}>Edit</Text>
            </Pressable>
          ) : null}
          {onDelete ? (
            <Pressable onPress={onDelete} style={styles.action}>
              <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: spacing.radiusLg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  text: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.sm,
  },
  meta: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.xs,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  action: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    backgroundColor: colors.muted,
  },
  actionText: {
    color: colors.textPrimary,
    fontWeight: typography.fontWeight.medium,
  },
  deleteText: {
    color: colors.error,
  },
});
