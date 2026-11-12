import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  mockBuilders,
  mockConstructionPackages,
  mockConstructionPlans,
  mockMaterialSpecifications,
} from '@/data/mockConstructionRequirement';
import { useConstructionJourneyStore } from '@/store/constructionJourneyStore';
import type { ConstructionRequirementStackParamList } from '@/types';
import type { PlanTier } from '@/types/constructionRequirement.types';
import { formatCurrency } from '@/utils/formatCurrency';
import { FlowPage, FlowSection, flow } from './FlowUI';

type Props = NativeStackScreenProps<
  ConstructionRequirementStackParamList,
  'PackageComparison' | 'ComparePlans'
>;
const tiers: PlanTier[] = ['Silver', 'Gold', 'Premium'];
const highlights = [
  'RCC framed structure',
  'Branded TMT steel',
  'Branded tiles & fittings',
  'Modular kitchen (optional)',
  'False ceiling (optional)',
];
const categories = [
  { id: 'cat-steel', name: 'Steel' },
  { id: 'cat-cement', name: 'Cement' },
  { id: 'cat-tiles', name: 'Tiles' },
  { id: 'cat-modular-kitchen', name: 'Modular kitchen' },
];

export function PackageComparisonScreen({ navigation, route }: Props) {
  const currentRoute = useRoute();
  const compareMode = currentRoute.name === 'ComparePlans';
  const selectedPlan =
    mockConstructionPlans.find(item => item.id === route.params?.planId) ??
    mockConstructionPlans[0];
  const builder =
    mockBuilders.find(item => item.id === selectedPlan.builderId) ??
    mockBuilders[0];
  const [tier, setTier] = useState<PlanTier>(selectedPlan.tier);
  const [showComparison, setShowComparison] = useState(false);
  const viewDetails = () => {
    const journey = useConstructionJourneyStore.getState();
    journey.selectPlan(selectedPlan.id);
    journey.selectTier(tier);
    navigation.navigate(currentRoute.name === 'ComparePlans' ? 'RequestQuote' : 'PlanOverview');
  };
  return (
    <FlowPage
      title={compareMode ? 'Compare Plans' : 'Package Compare'}
      onBack={navigation.goBack}
      primary={{ label: compareMode ? `Select ${tier} Plan` : 'View Plan Details', onPress: viewDetails }}
      secondary={{
        label: showComparison ? 'Hide Comparison' : 'Compare All Plans',
        onPress: () => setShowComparison(!showComparison),
      }}
    >
      <View style={styles.builder}>
        <Image
          source={require('@/assets/images/homeimage2.jpg')}
          style={styles.builderImage}
        />
        <View style={styles.builderText}>
          <Text style={styles.builderName}>{builder.name}</Text>
          <Text style={styles.muted}>
            Verified builder · {builder.location}
          </Text>
        </View>
        <Icon name="checkmark-circle" color={flow.blue} size={20} />
      </View>
      <View style={styles.tiers}>
        {tiers.map(item => {
          const pack = mockConstructionPackages.find(p => p.tier === item)!;
          return (
            <Pressable
              accessibilityRole="radio"
              accessibilityState={{ selected: tier === item }}
              key={item}
              onPress={() => setTier(item)}
              style={[styles.tier, tier === item && styles.tierSelected]}
            >
              <Text style={styles.tierName}>{item}</Text>
              <Text style={styles.tierPrice}>
                {formatCurrency(pack.pricePerSqFt)}
              </Text>
              <Text style={styles.sqft}>per sq.ft.</Text>
            </Pressable>
          );
        })}
      </View>
      <FlowSection title="Key Highlights">
        {highlights.map(item => (
          <View style={styles.highlight} key={item}>
            <Icon name="checkmark-circle" color={flow.green} size={17} />
            <Text style={styles.highlightText}>{item}</Text>
          </View>
        ))}
      </FlowSection>
      {showComparison ? (
        <FlowSection title="Material comparison">
          {categories.map(category => (
            <View key={category.id} style={styles.compareCard}>
              <Text style={styles.compareTitle}>{category.name}</Text>
              <View style={styles.compareColumns}>
                {tiers.map(item => {
                  const value = mockMaterialSpecifications.find(
                    spec =>
                      spec.categoryId === category.id &&
                      spec.packageId === `package-${item.toLowerCase()}`,
                  );
                  return (
                    <View key={item} style={styles.compareColumn}>
                      <Text style={styles.compareTier}>{item}</Text>
                      <Text style={styles.compareValue}>
                        {value?.detail ?? value?.status ?? '—'}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          ))}
        </FlowSection>
      ) : null}
    </FlowPage>
  );
}

const styles = StyleSheet.create({
  builder: {
    backgroundColor: flow.surface,
    borderRadius: 7,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    padding: 8,
    borderWidth: 1,
    borderColor: flow.line,
  },
  builderImage: { width: 52, height: 53, borderRadius: 4 },
  builderText: { flex: 1, gap: 4 },
  builderName: { color: flow.ink, fontSize: 14, fontWeight: '700' },
  muted: { color: flow.muted, fontSize: 10 },
  tiers: { flexDirection: 'row', gap: 6 },
  tier: {
    flex: 1,
    minHeight: 94,
    borderWidth: 1,
    borderColor: flow.line,
    backgroundColor: flow.surface,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  tierSelected: { borderColor: '#D99C26', backgroundColor: '#FFF4D9' },
  tierName: { color: flow.ink, fontSize: 12, fontWeight: '700' },
  tierPrice: { color: flow.ink, fontSize: 17, fontWeight: '800' },
  sqft: { color: flow.muted, fontSize: 10 },
  highlight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  highlightText: { fontSize: 12, color: flow.ink },
  compareCard: {
    backgroundColor: flow.surface,
    borderWidth: 1,
    borderColor: flow.line,
    borderRadius: 7,
    padding: 10,
    gap: 9,
  },
  compareTitle: { fontSize: 12, fontWeight: '700', color: flow.ink },
  compareColumns: { flexDirection: 'row' },
  compareColumn: {
    flex: 1,
    paddingHorizontal: 5,
    borderRightWidth: 1,
    borderRightColor: flow.line,
  },
  compareTier: { fontSize: 10, color: flow.blue, fontWeight: '700' },
  compareValue: { fontSize: 10, color: flow.muted, lineHeight: 14 },
});
