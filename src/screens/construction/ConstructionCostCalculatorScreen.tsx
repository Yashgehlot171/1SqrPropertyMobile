import {useRemoteLoad} from '@/hooks/useRemoteFlow';
import {RemoteStatus} from '@/components/common/RemoteStatus';
import React, {useEffect, useMemo, useState} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';

import {
  AppButton,
  AppHeader,
  AppInput,
  ScreenContainer,
  SectionHeader,
} from '@/components';
import {colors} from '@/constants/colors';
import {ROUTES} from '@/constants/routes';
import {spacing} from '@/constants/spacing';
import {typography} from '@/constants/typography';
import {useConstructionStore} from '@/store/constructionStore';
import type {ConstructionQuality, ServicesStackParamList} from '@/types';
import {calculateConstructionEstimate} from '@/services/constructionApi';
import {useRemoteAction} from '@/hooks/useRemoteFlow';
import {showToast} from '@/utils/toast';

type Props = NativeStackScreenProps<
  ServicesStackParamList,
  'ConstructionCostCalculator'
>;

// These are the quality values currently accepted by calculateConstructionEstimate.
const calculatorQualities: ConstructionQuality[] = ['Standard', 'Premium', 'Luxury'];

export function ConstructionCostCalculatorScreen({navigation, route}: Props) {
  const loadRemote = useConstructionStore(state => state.load);
  const remoteLoading = useConstructionStore(state => state.loading);
  const remoteError = useConstructionStore(state => state.error);
  useRemoteLoad(loadRemote);

  const {run, busy} = useRemoteAction();
  const packages = useConstructionStore(state => state.packages);
  const saveQuote = useConstructionStore(state => state.saveQuote);
  const selectedPackage = useMemo(
    () =>
      packages.find(item => item.id === route.params?.selectedPackageId) ??
      packages.find(item => item.name === 'Standard'),
    [packages, route.params?.selectedPackageId],
  );
  const [plotSizeSqFt, setPlotSizeSqFt] = useState('');
  const [builtUpAreaSqFt, setBuiltUpAreaSqFt] = useState('');
  const [floors, setFloors] = useState('');
  const [quality, setQuality] = useState<ConstructionQuality>('Standard');

  useEffect(() => {
    if (selectedPackage?.quality && calculatorQualities.includes(selectedPackage.quality)) {
      setQuality(selectedPackage.quality);
    }
  }, [selectedPackage?.id, selectedPackage?.quality]);

  const packageForQuality = useMemo(
    () => packages.find(item => (item.quality ?? item.name) === quality),
    [packages, quality],
  );

  const handleCalculate = () => run(async () => {
    const plot = Number(plotSizeSqFt);
    const area = Number(builtUpAreaSqFt);
    const floorCount = Number(floors);

    if (!plot || !area || !floorCount || plot < area || floorCount < 1) {
      showToast(
        'Enter valid plot size, built-up area and floors. Plot size should be greater than or equal to built-up area.',
      );
      return;
    }

    const quote = saveQuote(
      await calculateConstructionEstimate({
        plotSizeSqFt: plot,
        builtUpAreaSqFt: area,
        floors: floorCount,
        quality,
      }),
    );

    navigation.navigate(ROUTES.services.quotationResult, {
      quoteId: quote.id,
    });
  });

  return (
    <ScreenContainer><RemoteStatus loading={remoteLoading} error={remoteError} retry={() => { void loadRemote().catch(() => {}); }} />
      <AppHeader
        title="Construction Cost Calculator"
        subtitle="The construction calculator service returns this estimate. It is not a provider quotation."
        onBackPress={navigation.goBack}
      />
      {selectedPackage ? (
        <View style={styles.packageBanner}>
          <Text style={styles.packageLabel}>Selected package</Text>
          <Text style={styles.packageTitle}>{selectedPackage.name}</Text>
          <Text style={styles.packageCopy}>
            {selectedPackage.materialQuality} | {selectedPackage.timeline}
          </Text>
        </View>
      ) : null}
      <SectionHeader title="Project Details" />
      <AppInput
        keyboardType="numeric"
        label="Plot Size (sq ft)"
        onChangeText={setPlotSizeSqFt}
        placeholder="1200"
        required
        value={plotSizeSqFt}
      />
      <AppInput
        keyboardType="numeric"
        label="Built-Up Area per Floor (sq ft)"
        onChangeText={setBuiltUpAreaSqFt}
        placeholder="1200"
        required
        value={builtUpAreaSqFt}
      />
      <AppInput
        keyboardType="numeric"
        label="Number of Floors"
        onChangeText={setFloors}
        placeholder="2"
        required
        value={floors}
      />
      <SectionHeader title="Package Quality" />
      <View style={styles.qualityGrid}>
        {calculatorQualities.map(item => (
          <Pressable
            key={item}
            onPress={() => setQuality(item)}
            style={[
              styles.qualityChip,
              quality === item && styles.qualityChipSelected,
            ]}>
            <Text
              style={[
                styles.qualityText,
                quality === item && styles.qualityTextSelected,
              ]}>
              {item}
            </Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.rateNote}>
        <Text style={styles.rateCopy}>
          {packageForQuality && packageForQuality.costPerSqFt > 0
            ? `Catalogue reference: ${packageForQuality.costPerSqFt.toLocaleString('en-IN')} per sq ft`
            : 'No catalogue reference rate is available for this quality. The estimate comes from the construction calculator service.'}
        </Text>
      </View>
      <View style={styles.actions}>
        <AppButton disabled={busy}
          label="Reset"
          onPress={() => {
            setPlotSizeSqFt('');
            setBuiltUpAreaSqFt('');
            setFloors('');
            setQuality(
              selectedPackage?.quality && calculatorQualities.includes(selectedPackage.quality)
                ? selectedPackage.quality
                : 'Standard',
            );
          }}
          style={styles.button}
          variant="outlined"
        />
        <AppButton disabled={busy}
          label="Calculate Quote"
          onPress={handleCalculate}
          style={styles.button}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  packageBanner: {
    backgroundColor: colors.darkPurple,
    borderRadius: spacing.radiusXl,
    padding: spacing.xl,
    gap: spacing.xs,
  },
  packageLabel: {
    color: colors.accent,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
  },
  packageTitle: {
    color: colors.white,
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
  },
  packageCopy: {
    color: colors.textOnPrimaryMuted,
    fontSize: typography.fontSize.sm,
  },
  qualityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  qualityChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  qualityChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  qualityText: {
    color: colors.textPrimary,
    fontWeight: typography.fontWeight.medium,
  },
  qualityTextSelected: {
    color: colors.white,
  },
  rateCopy: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.sm,
  },
  rateNote: {
    padding: spacing.md,
    borderRadius: spacing.radiusMd,
    backgroundColor: colors.brandPurpleSubtle,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  button: {
    flexGrow: 1,
    flexBasis: 130,
  },
});
