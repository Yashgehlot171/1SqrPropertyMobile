import React, {useMemo, useState} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';

import {
  AppButton,
  AppHeader,
  AppInput,
  ScreenContainer,
  SectionHeader,
} from '@/components';
import {CONSTRUCTION_QUALITIES} from '@/constants/appConstants';
import {colors} from '@/constants/colors';
import {ROUTES} from '@/constants/routes';
import {spacing} from '@/constants/spacing';
import {typography} from '@/constants/typography';
import {useConstructionStore} from '@/store/constructionStore';
import type {ConstructionQuality, ServicesStackParamList} from '@/types';
import {calculateConstructionQuote} from '@/utils/constructionCalculator';
import {showToast} from '@/utils/toast';

type Props = NativeStackScreenProps<
  ServicesStackParamList,
  'ConstructionCostCalculator'
>;

export function ConstructionCostCalculatorScreen({navigation, route}: Props) {
  const packages = useConstructionStore(state => state.packages);
  const saveQuote = useConstructionStore(state => state.saveQuote);
  const selectedPackage = useMemo(
    () =>
      packages.find(item => item.id === route.params?.selectedPackageId) ??
      packages.find(item => item.name === 'Standard'),
    [packages, route.params?.selectedPackageId],
  );
  const [plotSizeSqFt, setPlotSizeSqFt] = useState('1200');
  const [builtUpAreaSqFt, setBuiltUpAreaSqFt] = useState('1200');
  const [floors, setFloors] = useState('2');
  const [quality, setQuality] = useState<ConstructionQuality>(
    selectedPackage?.name ?? 'Standard',
  );

  const packageForQuality = useMemo(
    () => packages.find(item => item.name === quality),
    [packages, quality],
  );

  const handleCalculate = () => {
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
      calculateConstructionQuote({
        plotSizeSqFt: plot,
        builtUpAreaSqFt: area,
        floors: floorCount,
        quality,
        costPerSqFt: packageForQuality?.costPerSqFt,
      }),
    );

    navigation.navigate(ROUTES.services.quotationResult, {
      quoteId: quote.id,
    });
  };

  return (
    <ScreenContainer>
      <AppHeader
        title="Construction Cost Calculator"
        subtitle="Estimate material, labour, total cost and timeline"
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
        {CONSTRUCTION_QUALITIES.map(item => (
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
      <Text style={styles.rateCopy}>
        Selected rate: {packageForQuality?.costPerSqFt ?? 0} per sq ft
      </Text>
      <View style={styles.actions}>
        <AppButton
          label="Reset"
          onPress={() => {
            setPlotSizeSqFt('1200');
            setBuiltUpAreaSqFt('1200');
            setFloors('2');
            setQuality(selectedPackage?.name ?? 'Standard');
          }}
          style={styles.button}
          variant="outlined"
        />
        <AppButton
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
    backgroundColor: colors.primary,
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
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  button: {
    flex: 1,
  },
});
