import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import {colors} from '@/constants/colors';
import {spacing} from '@/constants/spacing';
import {typography} from '@/constants/typography';
import type {UploadedDocument} from '@/types';

interface DocumentCardProps {
  document: UploadedDocument;
  onView?: () => void;
  onDelete?: () => void;
}

export function DocumentCard({
  document,
  onView,
  onDelete,
}: DocumentCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.info}>
        <View style={styles.iconWrap}>
          <Icon color={colors.secondary} name="document-outline" size={20} />
        </View>
        <View style={styles.copy}>
          <Text style={styles.name}>{document.name}</Text>
          <Text style={styles.meta}>
            {document.type} | {document.status}
          </Text>
        </View>
      </View>
      <View style={styles.actions}>
        <Pressable onPress={onView} style={styles.action}>
          <Text style={styles.actionText}>View</Text>
        </Pressable>
        <Pressable onPress={onDelete} style={styles.action}>
          <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: spacing.radiusLg,
    padding: spacing.lg,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  info: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
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
  meta: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
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
