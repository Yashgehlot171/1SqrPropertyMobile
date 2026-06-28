import React from 'react';
import {Text} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';

import {
  AppHeader,
  ConstructionPackageCard,
  ScreenContainer,
  SectionHeader,
} from '@/components';
import {ROUTES} from '@/constants/routes';
import {useConstructionStore} from '@/store/constructionStore';
import type {ServicesStackParamList} from '@/types';
import {showToast} from '@/utils/toast';

type Props = NativeStackScreenProps<
  ServicesStackParamList,
  'HouseConstructionPackages'
>;

export function HouseConstructionPackagesScreen({navigation}: Props) {
  const packages = useConstructionStore(state => state.packages);

  return (
    <ScreenContainer>
      <AppHeader
        title="House Construction Packages"
        subtitle="Compare inclusions and start the estimate flow"
        onBackPress={navigation.goBack}
      />
      <Text>
        Static package data is sorted for quick comparison across quality and
        per-sq-ft pricing.
      </Text>
      <SectionHeader title="Available Packages" />
      {[...packages]
        .sort((a, b) => a.costPerSqFt - b.costPerSqFt)
        .map(item => (
          <ConstructionPackageCard
            item={item}
            key={item.id}
            onRequestQuote={() =>
              navigation.navigate(ROUTES.services.constructionCostCalculator, {
                selectedPackageId: item.id,
              })
            }
            onViewDetails={() =>
              showToast(
                `${item.name}: ${item.materialQuality} | Timeline ${item.timeline}.`,
              )
            }
          />
        ))}
    </ScreenContainer>
  );
}
