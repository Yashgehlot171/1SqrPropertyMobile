import {ScreenContainer, AppHeader} from '@/components';
import {useRemoteLoad} from '@/hooks/useRemoteFlow';
import {RemoteStatus} from '@/components/common/RemoteStatus';
import React, {useMemo} from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';

import {useLegalStore} from '@/store/legalStore';
import type {ServicesStackParamList} from '@/types';

import {LegalRequestFormContent} from './LegalRequestFormContent';

type Props = NativeStackScreenProps<
  ServicesStackParamList,
  'PropertyRegistrationRequest'
>;

export function PropertyRegistrationRequestScreen({
  navigation,
  route,
}: Props) {
  const loadRemote = useLegalStore(state => state.load);
  const remoteLoading = useLegalStore(state => state.loading);
  const remoteError = useLegalStore(state => state.error);
  useRemoteLoad(loadRemote);

  const requests = useLegalStore(state => state.requests);
  const request = useMemo(
    () =>
      route.params?.requestId
        ? requests.find(item => item.id === route.params?.requestId)
        : undefined,
    [requests, route.params?.requestId],
  );

  if (route.params?.requestId && !request) {
    return <ScreenContainer><AppHeader title="Edit request" onBackPress={navigation.goBack} />
      <RemoteStatus loading={remoteLoading} error={remoteError ?? (remoteLoading ? null : 'Request unavailable. Retry to refresh.')} retry={() => { void loadRemote().catch(() => {}); }} />
    </ScreenContainer>;
  }
  return (
    <LegalRequestFormContent key={request?.id ?? 'new'}
      navigation={navigation}
      request={request}
      type="Property Registration"
    />
  );
}
