import React, {useMemo, useState} from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';

import {
  AppButton,
  AppHeader,
  DirectoryCard,
  EmptyState,
  ScreenContainer,
  SearchBar,
  SectionHeader,
} from '@/components';
import {ROUTES} from '@/constants/routes';
import {useConstructionStore} from '@/store/constructionStore';
import type {ServicesStackParamList} from '@/types';
import {
  callDirectoryPartner,
  openWhatsAppForDirectoryPartner,
} from '@/utils/constructionActions';
import {showToast} from '@/utils/toast';

type Props = NativeStackScreenProps<
  ServicesStackParamList,
  'ContractorDirectory'
>;

export function ContractorDirectoryScreen({navigation}: Props) {
  const contractors = useConstructionStore(state => state.contractors);
  const shortlistedContractorIds = useConstructionStore(
    state => state.shortlistedContractorIds,
  );
  const toggleContractorShortlist = useConstructionStore(
    state => state.toggleContractorShortlist,
  );
  const [query, setQuery] = useState('');

  const filteredContractors = useMemo(
    () =>
      contractors.filter(item => {
        const searchValue = query.trim().toLowerCase();
        if (!searchValue) {
          return true;
        }

        return (
          item.name.toLowerCase().includes(searchValue) ||
          item.location.toLowerCase().includes(searchValue) ||
          item.tags?.some(tag => tag.toLowerCase().includes(searchValue)) ===
            true
        );
      }),
    [contractors, query],
  );

  return (
    <ScreenContainer>
      <AppHeader
        title="Contractor Directory"
        subtitle="Static local contractors with local shortlist actions"
        onBackPress={navigation.goBack}
      />
      <SearchBar
        onChangeText={setQuery}
        placeholder="Search contractors, city or experience"
        value={query}
      />
      <SectionHeader title="Contractor Matches" />
      <AppButton
        label="Run Calculator"
        onPress={() => navigation.navigate(ROUTES.services.constructionCostCalculator)}
        variant="outlined"
      />
      {filteredContractors.length ? (
        filteredContractors.map(item => {
          const isShortlisted = shortlistedContractorIds.includes(item.id);

          return (
            <DirectoryCard
              entry={item}
              isShortlisted={isShortlisted}
              key={item.id}
              onCall={() => {
                void callDirectoryPartner(item);
              }}
              onToggleShortlist={() => {
                toggleContractorShortlist(item.id);
                showToast(
                  isShortlisted
                    ? 'Contractor removed from shortlist.'
                    : 'Contractor added to shortlist.',
                );
              }}
              onWhatsApp={() => {
                void openWhatsAppForDirectoryPartner(
                  item,
                  'house construction execution',
                );
              }}
              primaryLabel="Contractor"
            />
          );
        })
      ) : (
        <EmptyState
          description="Try another city or experience filter."
          title="No contractors found"
        />
      )}
    </ScreenContainer>
  );
}
