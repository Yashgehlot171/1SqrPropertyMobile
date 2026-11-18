import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

import {AppButton} from '@/components/common/AppButton';
import {StatusChip} from '@/components/common/StatusChip';
import {colors} from '@/constants/colors';
import {spacing} from '@/constants/spacing';
import {typography} from '@/constants/typography';
import type {LegalTeam} from '@/types';

interface LegalTeamCardProps {
  team: LegalTeam;
  onView?: () => void;
  onCall?: () => void;
}

export function LegalTeamCard({team, onView, onCall}: LegalTeamCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.copy}>
          <Text style={styles.name}>{team.name}</Text>
          {team.city || team.experience ? <Text style={styles.meta}>
            {[team.city, team.experience].filter(Boolean).join(' | ')}
          </Text> : null}
        </View>
        {team.specialization ? <StatusChip label={team.specialization} /> : null}
      </View>
      {team.email ? <Text style={styles.meta}>{team.email}</Text> : null}
      <View style={styles.tags}>
        {(team.highlights ?? []).map(item => (
          <StatusChip key={item} label={item} />
        ))}
      </View>
      <View style={styles.actions}>
        <AppButton
          label="Team Detail"
          onPress={onView}
          style={styles.button}
          variant="outlined"
        />
        <AppButton
          label="Call Team"
          onPress={team.phone ? onCall : undefined}
          style={styles.button}
        />
      </View>
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
    gap: spacing.md,
    alignItems: 'flex-start',
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
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  button: {
    flex: 1,
  },
});
