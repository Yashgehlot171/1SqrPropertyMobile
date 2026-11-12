import {getServiceProviders} from '@/services/constructionApi';
import type {DirectoryEntry} from '@/types';
import {useRemoteLoad} from '@/hooks/useRemoteFlow';
import {RemoteStatus} from '@/components/common/RemoteStatus';
import React, {useCallback, useMemo, useState} from 'react';
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

export function ContractorDirectoryScreen({navigation, route}: Props) {
  const loadConstruction = useConstructionStore(state => state.load);
  const constructionLoading = useConstructionStore(state => state.loading);
  const constructionError = useConstructionStore(state => state.error);
  const storedContractors = useConstructionStore(state => state.contractors);
  const [providers, setProviders] = useState<DirectoryEntry[]>([]);
  const [providerLoading, setProviderLoading] = useState(false);
  const [providerError, setProviderError] = useState<string | null>(null);
  const serviceType = route.params?.serviceType;
  const loadRemote = useCallback(async () => {
    if (!serviceType) { await loadConstruction(); return; }
    setProviderLoading(true); setProviderError(null);
    try { setProviders(await getServiceProviders(serviceType)); }
    catch (error) { setProviderError(error instanceof Error ? error.message : 'Unable to load providers.'); }
    finally { setProviderLoading(false); }
  }, [serviceType, loadConstruction]);
  useRemoteLoad(loadRemote);
  const remoteLoading = serviceType ? providerLoading : constructionLoading;
  const remoteError = serviceType ? providerError : constructionError;
  const contractors = serviceType ? providers : storedContractors;
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
    <ScreenContainer><RemoteStatus loading={remoteLoading} error={remoteError} retry={() => { void loadRemote().catch(() => {}); }} />
      <AppHeader
        title={route.params?.title ?? 'Contractor Directory'}
        subtitle="Available partners; shortlists are saved for this session"
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
