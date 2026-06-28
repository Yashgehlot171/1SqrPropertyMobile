import React, {useMemo, useState} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';

import {
  AppButton,
  AppHeader,
  ConfirmationModal,
  EmptyState,
  LoanRequestCard,
  ScreenContainer,
  SearchBar,
} from '@/components';
import {LOAN_STATUSES} from '@/constants/appConstants';
import {colors} from '@/constants/colors';
import {ROUTES} from '@/constants/routes';
import {spacing} from '@/constants/spacing';
import {typography} from '@/constants/typography';
import {useLoanStore} from '@/store/loanStore';
import type {LoanRequest, LoanStatus, ServicesStackParamList} from '@/types';
import {showToast} from '@/utils/toast';

type Props = NativeStackScreenProps<
  ServicesStackParamList,
  'LoanRequestTracking'
>;

type RequestFilter = 'All' | LoanStatus;

export function LoanRequestTrackingScreen({navigation}: Props) {
  const requests = useLoanStore(state => state.requests);
  const banks = useLoanStore(state => state.banks);
  const deleteRequest = useLoanStore(state => state.deleteRequest);
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<RequestFilter>('All');
  const [deleteTarget, setDeleteTarget] = useState<LoanRequest | null>(null);

  const visibleRequests = useMemo(
    () =>
      requests.filter(request => {
        const matchesFilter =
          activeFilter === 'All' || request.status === activeFilter;
        const searchValue = query.trim().toLowerCase();
        const bankName =
          banks.find(item => item.id === request.preferredBankId)?.name ?? '';
        const matchesQuery =
          !searchValue ||
          request.applicantName.toLowerCase().includes(searchValue) ||
          request.propertyDetails.toLowerCase().includes(searchValue) ||
          bankName.toLowerCase().includes(searchValue);

        return matchesFilter && matchesQuery;
      }),
    [activeFilter, banks, query, requests],
  );

  return (
    <ScreenContainer>
      <AppHeader
        title="Loan Request Tracking"
        subtitle="View, edit, delete and monitor local loan requests"
        onBackPress={navigation.goBack}
      />
      <SearchBar
        onChangeText={setQuery}
        placeholder="Search applicant, property or bank"
        value={query}
      />
      <View style={styles.filters}>
        {(['All', ...LOAN_STATUSES] as RequestFilter[]).map(item => (
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
      <AppButton
        label="Add New Request"
        onPress={() => navigation.navigate(ROUTES.services.loanApplication)}
      />
      {visibleRequests.length ? (
        visibleRequests.map(request => (
          <LoanRequestCard
            bankName={
              banks.find(item => item.id === request.preferredBankId)?.name
            }
            key={request.id}
            onDelete={() => setDeleteTarget(request)}
            onEdit={() =>
              navigation.navigate(ROUTES.services.loanApplication, {
                requestId: request.id,
              })
            }
            onView={() =>
              navigation.navigate(ROUTES.services.loanRequestDetail, {
                requestId: request.id,
              })
            }
            request={request}
          />
        ))
      ) : (
        <EmptyState
          description="Create a new request or change the active filter."
          title="No loan requests found"
        />
      )}
      <ConfirmationModal
        confirmLabel="Delete"
        message={
          deleteTarget
            ? `Delete the local request for ${deleteTarget.applicantName}?`
            : 'Delete this request?'
        }
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            deleteRequest(deleteTarget.id);
            showToast('Loan request deleted locally.');
          }
          setDeleteTarget(null);
        }}
        title="Delete Loan Request"
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
});
