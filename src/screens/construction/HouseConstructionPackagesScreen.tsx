import {useRemoteLoad} from '@/hooks/useRemoteFlow';
import {RemoteStatus} from '@/components/common/RemoteStatus';
import React from 'react';
import {Alert, StyleSheet, Text, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';

import {
  AppHeader,
  ConstructionPackageCard,
  EmptyState,
  ScreenContainer,
  SectionHeader,
} from '@/components';
import {ROUTES} from '@/constants/routes';
import {useConstructionStore} from '@/store/constructionStore';
import type {ServicesStackParamList} from '@/types';
import {colors} from '@/constants/colors';
import {spacing} from '@/constants/spacing';
import {typography} from '@/constants/typography';

type Props = NativeStackScreenProps<
  ServicesStackParamList,
  'HouseConstructionPackages'
>;

export function HouseConstructionPackagesScreen({navigation}: Props) {
  const loadRemote = useConstructionStore(state => state.load);
  const remoteLoading = useConstructionStore(state => state.loading);
  const remoteError = useConstructionStore(state => state.error);
  useRemoteLoad(loadRemote);

  const packages = useConstructionStore(state => state.packages);

  return (
    <ScreenContainer><RemoteStatus loading={remoteLoading} error={remoteError} retry={() => { void loadRemote().catch(() => {}); }} />
      <AppHeader
        title="House Construction Packages"
        subtitle="Compare inclusions and start the estimate flow"
        onBackPress={navigation.goBack}
      />
      {packages.length ? (
        <>
          <View style={styles.note}>
            <Text style={styles.noteTitle}>Catalogue information</Text>
            <Text style={styles.noteCopy}>Rates and inclusions below come from the construction package service. Confirm the final scope and price with the provider.</Text>
          </View>
          <SectionHeader title="Available Packages" />
          {[...packages].sort((a, b) => a.costPerSqFt - b.costPerSqFt).map(item => (
          <ConstructionPackageCard
            item={item}
            key={item.id}
            onRequestQuote={() =>
              navigation.navigate(ROUTES.services.constructionCostCalculator, {
                selectedPackageId: item.id,
              })
            }
            onViewDetails={() =>
              Alert.alert(item.name, [
                item.quality ? `Quality: ${item.quality}` : undefined,
                item.materialQuality ? `Materials: ${item.materialQuality}` : undefined,
                `Labour included: ${item.labourIncluded ? 'Yes' : 'No'}`,
                `Timeline: ${item.timeline || 'Not specified'}`,
                item.features.length ? `Features: ${item.features.join(', ')}` : undefined,
              ].filter(Boolean).join('\n'))
            }
          />
          ))}
        </>
      ) : !remoteLoading && !remoteError ? (
        <EmptyState description="No construction packages were returned by the catalogue service. No package prices or inclusions are being shown." title="No packages available" />
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  note: {gap: spacing.xs, padding: spacing.lg, borderRadius: spacing.radiusLg, backgroundColor: colors.brandPurpleSubtle},
  noteTitle: {color: colors.darkPurple, fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.bold},
  noteCopy: {color: colors.textSecondary, fontSize: typography.fontSize.sm, lineHeight: typography.lineHeight.sm},
});
