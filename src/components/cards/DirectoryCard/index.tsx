import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

import {AppButton} from '@/components/common/AppButton';
import {StatusChip} from '@/components/common/StatusChip';
import {colors} from '@/constants/colors';
import {spacing} from '@/constants/spacing';
import {typography} from '@/constants/typography';
import type {DirectoryEntry} from '@/types';

interface DirectoryCardProps {
  entry: DirectoryEntry;
  primaryLabel: string;
  isShortlisted?: boolean;
  onToggleShortlist?: () => void;
  onCall?: () => void;
  onWhatsApp?: () => void;
}

export function DirectoryCard({
  entry,
  primaryLabel,
  isShortlisted,
  onToggleShortlist,
  onCall,
  onWhatsApp,
}: DirectoryCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.copy}>
          <Text style={styles.title}>{entry.name}</Text>
          <Text style={styles.location}>{entry.location}</Text>
        </View>
        <StatusChip label={`${entry.rating}/5`} />
      </View>
      <View style={styles.tags}>
        <StatusChip label={primaryLabel} />
        {entry.tags?.map(tag => <StatusChip key={tag} label={tag} />)}
      </View>
      <View style={styles.row}>
        <AppButton
          label={isShortlisted ? 'Shortlisted' : 'Shortlist'}
          onPress={onToggleShortlist}
          style={styles.button}
          variant={isShortlisted ? 'secondary' : 'outlined'}
        />
        <AppButton
          label="Call"
          onPress={onCall}
          style={styles.button}
          variant="outlined"
        />
      </View>
      <AppButton
        label="WhatsApp"
        onPress={onWhatsApp}
        variant="outlined"
      />
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
    fontWeight: typography.fontWeight.semiBold,
  },
  location: {
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
    gap: spacing.md,
  },
  button: {
    flex: 1,
  },
});
