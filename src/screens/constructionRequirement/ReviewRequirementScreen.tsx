import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ROUTES} from '@/constants/routes';
import {useConstructionJourneyStore} from '@/store/constructionJourneyStore';
import type {ConstructionRequirementStackParamList} from '@/types';
import {FlowPage, FlowSection, flow} from './FlowUI';

type Props = NativeStackScreenProps<ConstructionRequirementStackParamList, 'ReviewRequirement'>;
export function ReviewRequirementScreen({navigation}: Props) {
  const journey = useConstructionJourneyStore();
  const plotArea = journey.plotWidthFt * journey.plotLengthFt;
  const edit = (route: keyof ConstructionRequirementStackParamList) => navigation.navigate(route as never);
  return <FlowPage title="Review Requirement" step={6} totalSteps={6} onBack={navigation.goBack} primary={{label: 'Find Builders', onPress: () => navigation.navigate(ROUTES.constructionRequirement.matchingBuilders, {location: [journey.locationArea, journey.locationCity].filter(Boolean).join(', '), buildType: journey.buildType})}}>
    <Text style={styles.intro}>Check the details before you look for builders. You can edit any section without losing the other selections.</Text>
    <ReviewSection title="Plot Details" onEdit={() => edit('ProjectRequirement')}><Line label="Dimensions" value={`${journey.plotWidthFt} × ${journey.plotLengthFt} ft`} /><Line label="Plot area" value={`${plotArea.toLocaleString('en-IN')} sq.ft.`} /><Line label="Location" value={[journey.locationAddress, journey.locationArea, journey.locationCity, journey.locationState].filter(Boolean).join(', ')} /><Line label="Facing" value={journey.facing} /><Line label="Corner plot" value={journey.isCornerPlot ? 'Yes' : 'No'} /></ReviewSection>
    <ReviewSection title="Floor Requirements" onEdit={() => edit('BudgetTimeline')}>{journey.floorRequirements.map(floor => <View key={floor.id} style={styles.floor}><Text style={styles.floorName}>{floor.name}</Text><Text style={styles.value}>{floor.bedrooms} rooms · {floor.halls} halls · {floor.kitchens} kitchens · {floor.bathrooms} bathrooms · {floor.parking} parking</Text>{floor.additionalSpaces.length ? <Text style={styles.value}>{floor.additionalSpaces.map(item => `${item.quantity} ${item.name}`).join(', ')}</Text> : null}{floor.balconies.filter(item => item.enabled).map(item => <Text key={item.type} style={styles.value}>{item.type === 'FRONT' ? 'Front' : 'Side'} balcony: {item.lengthFt} × {item.projectionFt} ft = {(item.lengthFt * item.projectionFt).toLocaleString('en-IN')} sq.ft.</Text>)}</View>)}</ReviewSection>
    <ReviewSection title="Area Summary" onEdit={() => edit('AreaBudgetSummary')}><Line label="Plot area" value={`${plotArea.toLocaleString('en-IN')} sq.ft.`} /><Line label="Proposed covered area" value="Pending plan confirmation" /><Line label="Builder billable area" value="Pending Builder Confirmation" /></ReviewSection>
    <ReviewSection title="Preferences" onEdit={() => edit('AdditionalPreferences')}><Line label="Construction quality" value={journey.quality} /><Line label="Optional features" value={journey.additionalPreferences.length ? journey.additionalPreferences.join(', ') : 'None selected'} /><Line label="Special requirement" value={journey.notes || 'None'} /></ReviewSection>
  </FlowPage>;
}
function ReviewSection({title, onEdit, children}: {title: string; onEdit: () => void; children: React.ReactNode}) { return <FlowSection title={title}><View style={styles.card}><Pressable onPress={onEdit} style={styles.edit}><Text style={styles.editText}>EDIT</Text></Pressable>{children}</View></FlowSection>; }
function Line({label, value}: {label: string; value: string}) { return <View style={styles.line}><Text style={styles.label}>{label}</Text><Text style={styles.value}>{value}</Text></View>; }
const styles = StyleSheet.create({intro: {fontSize: 12, lineHeight: 18, color: flow.muted}, card: {position: 'relative', padding: 12, gap: 7, borderWidth: 1, borderColor: flow.line, borderRadius: 8, backgroundColor: flow.surface}, edit: {position: 'absolute', right: 11, top: 9, padding: 4}, editText: {fontSize: 10, color: flow.blue, fontWeight: '800'}, line: {gap: 2, paddingRight: 42}, label: {fontSize: 10, color: flow.muted}, value: {fontSize: 12, lineHeight: 17, color: flow.ink}, floor: {paddingRight: 42, gap: 3, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: flow.line}, floorName: {fontSize: 12, color: flow.ink, fontWeight: '800'}});
