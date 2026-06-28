import React, {useMemo, useState} from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';

import {
  AppHeader,
  EmptyState,
  LoanBankCard,
  ScreenContainer,
  SearchBar,
  SectionHeader,
} from '@/components';
import {ROUTES} from '@/constants/routes';
import {useLoanStore} from '@/store/loanStore';
import type {ServicesStackParamList} from '@/types';
import {callFinanceTeam} from '@/utils/financeActions';

type Props = NativeStackScreenProps<ServicesStackParamList, 'LoanMarketplace'>;

export function LoanMarketplaceScreen({navigation}: Props) {
  const banks = useLoanStore(state => state.banks);
  const [query, setQuery] = useState('');

  const filteredBanks = useMemo(
    () =>
      [...banks]
        .filter(bank => {
          const searchValue = query.trim().toLowerCase();
          if (!searchValue) {
            return true;
          }

          return (
            bank.name.toLowerCase().includes(searchValue) ||
            bank.city.toLowerCase().includes(searchValue) ||
            bank.contactPerson.toLowerCase().includes(searchValue) ||
            bank.highlights.some(tag =>
              tag.toLowerCase().includes(searchValue),
            )
          );
        })
        .sort((a, b) => a.interestRate - b.interestRate),
    [banks, query],
  );

  return (
    <ScreenContainer>
      <AppHeader
        title="Loan Marketplace"
        subtitle="Compare lenders, team details and application routes"
        onBackPress={navigation.goBack}
      />
      <SearchBar
        onChangeText={setQuery}
        placeholder="Search bank, city or highlight"
        value={query}
      />
      <SectionHeader title="Available Lenders" />
      {filteredBanks.length ? (
        filteredBanks.map(bank => (
          <LoanBankCard
            bank={bank}
            key={bank.id}
            onApply={() =>
              navigation.navigate(ROUTES.services.loanApplication, {
                bankId: bank.id,
                interestRate: bank.interestRate,
              })
            }
            onCall={() => {
              void callFinanceTeam(bank);
            }}
            onViewTeam={() =>
              navigation.navigate(ROUTES.services.financeTeamDetail, {
                bankId: bank.id,
              })
            }
          />
        ))
      ) : (
        <EmptyState
          description="Try another search term or city."
          title="No lenders found"
        />
      )}
    </ScreenContainer>
  );
}
