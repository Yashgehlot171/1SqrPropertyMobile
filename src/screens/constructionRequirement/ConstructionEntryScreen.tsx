import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import { ROUTES } from '@/constants/routes';
import {useConstructionJourneyStore} from '@/store/constructionJourneyStore';
import {useAuthStore} from '@/store/authStore';
import type { ConstructionRequirementStackParamList } from '@/types';
import {canUseConstructionBuilder} from '@/utils/authCapabilities';
import { FlowPage, flow } from './FlowUI';

type Props = NativeStackScreenProps<
  ConstructionRequirementStackParamList,
  'ConstructionEntry'
>;
const benefits = [
  {
    icon: 'people-outline',
    title: 'Verified Builders',
    detail: 'Browse builders and plans in your area',
    tint: '#EAF3FF',
  },
  {
    icon: 'create-outline',
    title: 'Customized Requirements',
    detail: 'Tell builders exactly what you need',
    tint: '#E9F9F1',
  },
  {
    icon: 'document-text-outline',
    title: 'Transparent Quotations',
    detail: 'Compare scope, materials and quotes',
    tint: '#FFF7E6',
  },
  {
    icon: 'construct-outline',
    title: 'Construction Tracking',
    detail: 'Stay informed from planning to handover',
    tint: '#EDF3FF',
  },
];

export function ConstructionEntryScreen({ navigation }: Props) {
  const hasDraft = useConstructionJourneyStore(state => state.hasRequirementDraft);
  const user = useAuthStore(state => state.user);
  const canUseBuilderInbox = canUseConstructionBuilder(user);
  return (
    <FlowPage
      title="Construction"
      onBack={navigation.goBack}
      primary={{
        label: hasDraft ? 'Resume Draft' : 'Get Started',
        onPress: () =>
          navigation.navigate(
            ROUTES.constructionRequirement.projectRequirement,
          ),
      }}
      secondary={{
        label: 'My Construction Requests',
        onPress: () => navigation.navigate(ROUTES.constructionRequirement.myRfqs),
      }}
    >
      <View style={styles.intro}>
        <Text style={styles.heading}>Build Your Dream Home</Text>
        <Text style={styles.sub}>
          Plan your home requirements and get quotations from verified builders.
        </Text>
      </View>
      <Image
        source={require('@/assets/images/homeimage2.jpg')}
        style={styles.house}
        resizeMode="cover"
      />
      <View style={styles.benefits}>
        {benefits.map(item => (
          <View key={item.title} style={styles.benefit}>
            <View style={[styles.iconBox, { backgroundColor: item.tint }]}>
              <Icon name={item.icon} size={23} color={flow.blue} />
            </View>
            <View style={styles.copy}>
              <Text style={styles.benefitTitle}>{item.title}</Text>
              <Text style={styles.benefitDetail}>{item.detail}</Text>
            </View>
          </View>
        ))}
      </View>
      {canUseBuilderInbox ? <Pressable accessibilityRole="button" onPress={() => navigation.navigate(ROUTES.constructionRequirement.constructionBusinessDashboard)} style={styles.builderAction}><Icon name="briefcase-outline" size={20} color={flow.blue} /><View style={styles.copy}><Text style={styles.benefitTitle}>Construction Business</Text><Text style={styles.benefitDetail}>Manage incoming RFQs and Builder activity.</Text></View><Icon name="chevron-forward" size={19} color={flow.muted} /></Pressable> : null}
    </FlowPage>
  );
}

const styles = StyleSheet.create({
  intro: { gap: 5 },
  heading: { fontSize: 20, fontWeight: '800', color: flow.ink },
  sub: { fontSize: 13, lineHeight: 19, color: flow.muted },
  house: { width: '100%', height: 190, borderRadius: 8 },
  benefits: { gap: 16, paddingTop: 4 },
  benefit: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: {
    width: 45,
    height: 45,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: { flex: 1, gap: 3 },
  builderAction: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 10, borderWidth: 1, borderColor: '#D7E5F7', backgroundColor: '#F7FBFF', padding: 14 },
  benefitTitle: { fontSize: 14, color: flow.ink, fontWeight: '700' },
  benefitDetail: { fontSize: 11, color: flow.muted },
});
