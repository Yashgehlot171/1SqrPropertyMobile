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
  const requests = useLegalStore(state => state.requests);
  const request = useMemo(
    () =>
      route.params?.requestId
        ? requests.find(item => item.id === route.params?.requestId)
        : undefined,
    [requests, route.params?.requestId],
  );

  return (
    <LegalRequestFormContent
      navigation={navigation}
      request={request}
      type="Property Registration"
    />
  );
}
