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

type Props = NativeStackScreenProps<ServicesStackParamList, 'SupplierDirectory'>;

export function SupplierDirectoryScreen({navigation}: Props) {
  const suppliers = useConstructionStore(state => state.suppliers);
  const shortlistedSupplierIds = useConstructionStore(
    state => state.shortlistedSupplierIds,
  );
  const toggleSupplierShortlist = useConstructionStore(
    state => state.toggleSupplierShortlist,
  );
  const [query, setQuery] = useState('');

  const filteredSuppliers = useMemo(
    () =>
      suppliers.filter(item => {
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
    [query, suppliers],
  );

  return (
    <ScreenContainer>
      <AppHeader
        title="Supplier Directory"
        subtitle="Search, call, WhatsApp and shortlist suppliers"
        onBackPress={navigation.goBack}
      />
      <SearchBar
        onChangeText={setQuery}
        placeholder="Search suppliers, city or material"
        value={query}
      />
      <SectionHeader title="Local Supplier Matches" />
      <AppButton
        label="Browse Materials First"
        onPress={() => navigation.navigate(ROUTES.services.materialInformation)}
        variant="outlined"
      />
      {filteredSuppliers.length ? (
        filteredSuppliers.map(item => {
          const isShortlisted = shortlistedSupplierIds.includes(item.id);

          return (
            <DirectoryCard
              entry={item}
              isShortlisted={isShortlisted}
              key={item.id}
              onCall={() => {
                void callDirectoryPartner(item);
              }}
              onToggleShortlist={() => {
                toggleSupplierShortlist(item.id);
                showToast(
                  isShortlisted
                    ? 'Supplier removed from shortlist.'
                    : 'Supplier added to shortlist.',
                );
              }}
              onWhatsApp={() => {
                void openWhatsAppForDirectoryPartner(
                  item,
                  'material supply and quotation',
                );
              }}
              primaryLabel="Supplier"
            />
          );
        })
      ) : (
        <EmptyState
          description="Try another search term for materials or city."
          title="No suppliers found"
        />
      )}
    </ScreenContainer>
  );
}
