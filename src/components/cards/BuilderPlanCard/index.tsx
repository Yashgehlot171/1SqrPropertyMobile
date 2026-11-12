import React from 'react';
import {
  Image,
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import type {
  Builder,
  ConstructionPlan,
} from '@/types/constructionRequirement.types';
import { formatCurrency } from '@/utils/formatCurrency';

const blue = '#0867E8';
const houses: ImageSourcePropType[] = [
  require('@/assets/images/homeimage2.jpg'),
  require('@/assets/images/home1.jpg'),
  require('@/assets/images/homeimage3.jpg'),
];
export function BuilderPlanCard({
  builder,
  plan,
  onViewPlan,
}: {
  builder: Builder;
  plan: ConstructionPlan;
  onViewPlan: () => void;
  onCompare?: () => void;
}) {
  const index =
    plan.builderId === 'builder-abc'
      ? 0
      : plan.builderId === 'builder-shree'
      ? 1
      : 2;
  return (
    <View style={styles.card}>
      <Image source={houses[index]} style={styles.image} />
      <View style={styles.content}>
        <Text style={styles.name}>{builder.name}</Text>
        <View style={styles.rating}>
          <Icon name="star" size={12} color="#F3AE22" />
          <Text style={styles.meta}>
            {builder.rating?.toFixed(1) ?? '4.5'} · Verified builder
          </Text>
        </View>
        <Text style={styles.meta}>{builder.location}</Text>
        <Text style={styles.meta}>
          {plan.planName} · {formatCurrency(plan.pricePerSqFt)}/sq.ft.
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={onViewPlan}
          style={styles.button}
        >
          <Text style={styles.buttonText}>View Plans</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E3EAF2',
    borderRadius: 8,
    padding: 9,
    flexDirection: 'row',
    gap: 10,
  },
  image: { width: 88, height: 115, borderRadius: 5 },
  content: { flex: 1, gap: 3 },
  name: { fontSize: 14, fontWeight: '700', color: '#0E1B32' },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  meta: { fontSize: 11, color: '#52627A' },
  button: {
    height: 31,
    backgroundColor: blue,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 3,
  },
  buttonText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
});
