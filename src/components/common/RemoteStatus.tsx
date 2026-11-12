import React from 'react';
import {ActivityIndicator, Text, View, Button} from 'react-native';
export function RemoteStatus({loading, error, retry}: {loading: boolean; error: string | null; retry: () => void}) {
  return <View accessibilityLiveRegion="polite">{loading ? <ActivityIndicator /> : null}
    {error ? <><Text>{error}</Text><Button title="Retry" onPress={retry} /></> : null}</View>;
}
