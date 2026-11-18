import React from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';

import type {ConstructionRequirementStackParamList} from '@/types';
import {FlowPage, FlowState} from './FlowUI';

type Props = NativeStackScreenProps<
  ConstructionRequirementStackParamList,
  'PackageComparison' | 'ComparePlans'
>;

/**
 * Legacy customer package comparison has no verified public package catalogue.
 * Builder authored plans are a separate, capability-gated workflow and must not
 * be presented here as customer package data.
 */
export function PackageComparisonScreen({navigation, route}: Props) {
  const isLegacyPlanCompare = route.name === 'ComparePlans';
  return (
    <FlowPage
      title={isLegacyPlanCompare ? 'Compare Construction Plans' : 'Construction Packages'}
      onBack={navigation.goBack}
    >
      <FlowState
        icon="layers-outline"
        title="Verified package data is unavailable"
        message={
          isLegacyPlanCompare
            ? 'This legacy comparison has no live customer plan catalogue. Plan details, inclusions and rates are hidden until verified data is connected.'
            : 'There is no verified public construction package catalogue to compare. Builder-authored plans remain in the separate Builder workspace.'
        }
      />
    </FlowPage>
  );
}
