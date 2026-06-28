import React from 'react';
import {StyleSheet, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';

import {
  AppButton,
  AppHeader,
  BannerCard,
  LegalRequestCard,
  LegalTeamCard,
  ScreenContainer,
  SectionHeader,
  ServiceCard,
  StatCard,
} from '@/components';
import {ROUTES} from '@/constants/routes';
import {spacing} from '@/constants/spacing';
import {useLegalStore} from '@/store/legalStore';
import type {ServicesStackParamList} from '@/types';
import {callLegalTeam} from '@/utils/legalActions';

type Props = NativeStackScreenProps<
  ServicesStackParamList,
  'LegalServicesDashboard'
>;

export function LegalServicesDashboardScreen({navigation}: Props) {
  const requests = useLegalStore(state => state.requests);
  const teams = useLegalStore(state => state.teams);

  return (
    <ScreenContainer>
      <AppHeader
        title="Legal Services"
        subtitle="Verification, registration, tracking and local legal teams"
        onBackPress={navigation.goBack}
      />
      <View style={styles.stats}>
        <StatCard label="Total Requests" value={requests.length} />
        <StatCard
          label="Under Review"
          value={requests.filter(item => item.status === 'Under Review').length}
        />
        <StatCard
          label="Document Required"
          value={
            requests.filter(item => item.status === 'Document Required').length
          }
        />
        <StatCard label="Legal Teams" value={teams.length} />
      </View>
      <View style={styles.grid}>
        <ServiceCard
          description="Create a new property verification request"
          icon="shield-checkmark-outline"
          onPress={() =>
            navigation.navigate(ROUTES.services.propertyVerificationRequest)
          }
          title="Verification"
        />
        <ServiceCard
          description="Create a new property registration request"
          icon="document-text-outline"
          onPress={() =>
            navigation.navigate(ROUTES.services.propertyRegistrationRequest)
          }
          title="Registration"
        />
        <ServiceCard
          description="View and manage legal requests locally"
          icon="list-outline"
          onPress={() => navigation.navigate(ROUTES.services.legalRequestTracking)}
          title="Tracking"
        />
      </View>
      <View style={styles.actions}>
        <AppButton
          label="Property Verification Request"
          onPress={() =>
            navigation.navigate(ROUTES.services.propertyVerificationRequest)
          }
          style={styles.button}
        />
        <AppButton
          label="Property Registration Request"
          onPress={() =>
            navigation.navigate(ROUTES.services.propertyRegistrationRequest)
          }
          style={styles.button}
          variant="outlined"
        />
      </View>
      <SectionHeader title="Recent Legal Requests" />
      {requests.slice(0, 2).map(request => (
        <LegalRequestCard
          key={request.id}
          onEdit={() =>
            navigation.navigate(
              request.type === 'Property Verification'
                ? ROUTES.services.propertyVerificationRequest
                : ROUTES.services.propertyRegistrationRequest,
              {requestId: request.id},
            )
          }
          onView={() =>
            navigation.navigate(ROUTES.services.legalRequestDetail, {
              requestId: request.id,
            })
          }
          request={request}
          teamName={teams.find(item => item.id === request.assignedTeamId)?.name}
        />
      ))}
      <SectionHeader title="Legal Teams" />
      {teams.slice(0, 2).map(team => (
        <LegalTeamCard
          key={team.id}
          onCall={() => {
            void callLegalTeam(team);
          }}
          onView={() =>
            navigation.navigate(ROUTES.services.legalTeamDetail, {
              teamId: team.id,
            })
          }
          team={team}
        />
      ))}
      <BannerCard
        ctaLabel="Open Tracking"
        description="Use request tracking to update status, manage remarks, and review document placeholders."
        icon="briefcase-outline"
        onPress={() => navigation.navigate(ROUTES.services.legalRequestTracking)}
        title="Legal Request Workflow Ready"
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  stats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  button: {
    flex: 1,
  },
});
