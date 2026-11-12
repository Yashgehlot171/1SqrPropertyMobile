import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ROUTES} from '@/constants/routes';
import {useConstructionJourneyStore} from '@/store/constructionJourneyStore';
import type {ConstructionRequirementStackParamList} from '@/types';
import {FlowInfo, FlowPage, FlowSection, flow} from './FlowUI';

type Props = NativeStackScreenProps<ConstructionRequirementStackParamList, 'AreaBudgetSummary'>;
export function AreaBudgetSummaryScreen({navigation}: Props) {
  const journey = useConstructionJourneyStore();
  const plotArea = journey.plotWidthFt * journey.plotLengthFt;
  const balconies = journey.floorRequirements.flatMap(floor => floor.balconies.filter(item => item.enabled).map(item => ({...item, floor: floor.name, area: item.lengthFt * item.projectionFt})));
  const frontArea = balconies.filter(item => item.type === 'FRONT').reduce((sum, item) => sum + item.area, 0);
  const sideArea = balconies.filter(item => item.type === 'SIDE').reduce((sum, item) => sum + item.area, 0);
  const balconyArea = frontArea + sideArea;
  return <FlowPage title="Area & Budget" step={4} totalSteps={6} onBack={navigation.goBack} primary={{label: 'Continue', onPress: () => navigation.navigate(ROUTES.constructionRequirement.additionalPreferences)}}>
    <FlowSection title="Plot"><View style={styles.card}><FlowInfo label="Plot size" value={`${journey.plotWidthFt} ft × ${journey.plotLengthFt} ft`} /><FlowInfo label="Plot area" value={`${plotArea.toLocaleString('en-IN')} sq.ft.`} strong /><FlowInfo label="Selected floors" value={journey.floorCount === 1 ? 'G+0' : `G+${journey.floorCount - 1}`} /></View></FlowSection>
    <FlowSection title="Floor Requirements"><View style={styles.card}>{journey.floorRequirements.map(floor => <View key={floor.id} style={styles.floor}><Text style={styles.floorName}>{floor.name}</Text><Text style={styles.floorText}>{floor.bedrooms} rooms · {floor.halls} halls · {floor.kitchens} kitchens · {floor.bathrooms} bathrooms · {floor.parking} parking</Text>{floor.additionalSpaces.length ? <Text style={styles.floorText}>{floor.additionalSpaces.map(item => `${item.quantity} ${item.name}`).join(', ')}</Text> : null}</View>)}</View></FlowSection>
    <FlowSection title="Area Summary"><View style={styles.card}><FlowInfo label="Plot area" value={`${plotArea.toLocaleString('en-IN')} sq.ft.`} /><FlowInfo label="Proposed / Indicative Covered Area" value="Pending plan confirmation" /><FlowInfo label="Front balcony area" value={`${frontArea.toLocaleString('en-IN')} sq.ft.`} /><FlowInfo label="Side balcony area" value={`${sideArea.toLocaleString('en-IN')} sq.ft.`} /><FlowInfo label="Total proposed balcony area" value={`${balconyArea.toLocaleString('en-IN')} sq.ft.`} strong /><FlowInfo label="Proposed construction area" value="Pending covered-area confirmation" /><FlowInfo label="Builder confirmed billable area" value="Pending Builder Confirmation" /></View><Text style={styles.hint}>Balcony figures are proposed measurements. A builder confirms any overlap, permissible area and billable area after review.</Text></FlowSection>
    <FlowSection title="Indicative Budget"><View style={styles.notice}><Text style={styles.noticeTitle}>Estimate available after builder scope review</Text><Text style={styles.noticeText}>No verified construction-rate source is configured for this journey, so no market rate or final price is shown.</Text><Text style={styles.noticeText}>Final cost may change based on builder quotation, specifications, site assessment, approved construction area and selected upgrades.</Text></View></FlowSection>
  </FlowPage>;
}
const styles = StyleSheet.create({card: {borderWidth: 1, borderColor: flow.line, borderRadius: 8, paddingHorizontal: 12, backgroundColor: flow.surface}, floor: {paddingVertical: 9, gap: 3, borderBottomWidth: 1, borderBottomColor: flow.line}, floorName: {fontSize: 12, fontWeight: '800', color: flow.ink}, floorText: {fontSize: 11, lineHeight: 16, color: flow.muted}, hint: {fontSize: 11, lineHeight: 16, color: flow.muted}, notice: {padding: 13, borderRadius: 8, backgroundColor: '#FFF7E6', gap: 7}, noticeTitle: {fontSize: 13, fontWeight: '800', color: flow.ink}, noticeText: {fontSize: 11, lineHeight: 16, color: flow.muted}});
