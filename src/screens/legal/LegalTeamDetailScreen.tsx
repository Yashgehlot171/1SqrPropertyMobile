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
import {useLegalStore} from '@/store/legalStore';
import type {ServicesStackParamList} from '@/types';
import {callLegalTeam, openWhatsAppForLegalTeam} from '@/utils/legalActions';

type Props = NativeStackScreenProps<ServicesStackParamList, 'LegalTeamDetail'>;

export function LegalTeamDetailScreen({navigation, route}: Props) {
  const teams = useLegalStore(state => state.teams);
  const team = teams.find(item => item.id === route.params.teamId);

  if (!team) {
    return (
      <ScreenContainer>
        <AppHeader title="Legal Team" onBackPress={navigation.goBack} />
        <EmptyState
          description="The selected legal team is not available locally."
          title="Legal team not found"
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <AppHeader
        title={team.name}
        subtitle={team.city}
        onBackPress={navigation.goBack}
      />
      <View style={styles.hero}>
        <Text style={styles.heroLabel}>Specialization</Text>
        <Text style={styles.heroTitle}>{team.specialization}</Text>
        <Text style={styles.heroCopy}>
          {team.experience} | {team.email}
        </Text>
        <View style={styles.chips}>
          {team.highlights.map(item => (
            <StatusChip key={item} label={item} />
          ))}
        </View>
      </View>
      <View style={styles.card}>
        <SectionHeader title="Team Information" />
        <DetailRow label="Team" value={team.name} />
        <DetailRow label="City" value={team.city} />
        <DetailRow label="Phone" value={team.phone} />
        <DetailRow label="WhatsApp" value={team.whatsapp} />
        <DetailRow label="Email" value={team.email} />
        <DetailRow label="Experience" value={team.experience} />
      </View>
      <View style={styles.actions}>
        <AppButton
          label="Call"
          onPress={() => {
            void callLegalTeam(team);
          }}
          style={styles.button}
          variant="outlined"
        />
        <AppButton
          label="WhatsApp"
          onPress={() => {
            void openWhatsAppForLegalTeam(team, 'a legal property request');
          }}
          style={styles.button}
          variant="outlined"
        />
      </View>
      <View style={styles.actions}>
        <AppButton
          label="Verification Request"
          onPress={() =>
            navigation.navigate(ROUTES.services.propertyVerificationRequest)
          }
          style={styles.button}
        />
        <AppButton
          label="Registration Request"
          onPress={() =>
            navigation.navigate(ROUTES.services.propertyRegistrationRequest)
          }
          style={styles.button}
          variant="outlined"
        />
      </View>
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
