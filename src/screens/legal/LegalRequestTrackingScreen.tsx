import React, {useMemo, useState} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';

import {
  AppButton,
  AppHeader,
  ConfirmationModal,
  EmptyState,
  LegalRequestCard,
  ScreenContainer,
  SearchBar,
} from '@/components';
import {LEGAL_STATUSES} from '@/constants/appConstants';
import {colors} from '@/constants/colors';
import {ROUTES} from '@/constants/routes';
import {spacing} from '@/constants/spacing';
import {typography} from '@/constants/typography';
import {useLegalStore} from '@/store/legalStore';
import type {LegalRequest, LegalStatus, ServicesStackParamList} from '@/types';
import {showToast} from '@/utils/toast';

type Props = NativeStackScreenProps<
  ServicesStackParamList,
  'LegalRequestTracking'
>;

type RequestFilter = 'All' | LegalStatus;

export function LegalRequestTrackingScreen({navigation}: Props) {
  const requests = useLegalStore(state => state.requests);
  const teams = useLegalStore(state => state.teams);
  const deleteRequest = useLegalStore(state => state.deleteRequest);
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<RequestFilter>('All');
  const [deleteTarget, setDeleteTarget] = useState<LegalRequest | null>(null);

  const visibleRequests = useMemo(
    () =>
      requests.filter(request => {
        const matchesFilter =
          activeFilter === 'All' || request.status === activeFilter;
        const teamName =
          teams.find(item => item.id === request.assignedTeamId)?.name ?? '';
        const searchValue = query.trim().toLowerCase();
        const matchesQuery =
          !searchValue ||
          request.type.toLowerCase().includes(searchValue) ||
          request.propertyDetails.toLowerCase().includes(searchValue) ||
          request.location.city.toLowerCase().includes(searchValue) ||
          teamName.toLowerCase().includes(searchValue);

        return matchesFilter && matchesQuery;
      }),
    [activeFilter, query, requests, teams],
  );

  return (
    <ScreenContainer>
      <AppHeader
        title="Legal Request Tracking"
        subtitle="View, edit, delete and monitor local legal requests"
        onBackPress={navigation.goBack}
      />
      <SearchBar
        onChangeText={setQuery}
        placeholder="Search type, property, city or legal team"
        value={query}
      />
      <View style={styles.filters}>
        {(['All', ...LEGAL_STATUSES] as RequestFilter[]).map(item => (
          <Pressable
            key={item}
            onPress={() => setActiveFilter(item)}
            style={[
              styles.filterChip,
              activeFilter === item && styles.filterChipSelected,
            ]}>
            <Text
              style={[
                styles.filterText,
                activeFilter === item && styles.filterTextSelected,
              ]}>
              {item}
            </Text>
          </Pressable>
        ))}
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
      {visibleRequests.length ? (
        visibleRequests.map(request => (
          <LegalRequestCard
            key={request.id}
            onDelete={() => setDeleteTarget(request)}
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
        ))
      ) : (
        <EmptyState
          description="Create a new request or change the active filter."
          title="No legal requests found"
        />
      )}
      <ConfirmationModal
        confirmLabel="Delete"
        message={
          deleteTarget
            ? `Delete the local legal request for ${deleteTarget.propertyDetails}?`
            : 'Delete this legal request?'
        }
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            deleteRequest(deleteTarget.id);
            showToast('Legal request deleted locally.');
          }
          setDeleteTarget(null);
        }}
        title="Delete Legal Request"
        visible={Boolean(deleteTarget)}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  filterChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    color: colors.textPrimary,
    fontWeight: typography.fontWeight.medium,
  },
  filterTextSelected: {
    color: colors.white,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  button: {
    flex: 1,
  },
});
