import React, {useState} from 'react';
import {Pressable, StyleSheet, Text, TextInput, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useConstructionJourneyStore} from '@/store/constructionJourneyStore';
import type {ConstructionRequirementStackParamList} from '@/types';
import {FlowPage, FlowSection, flow} from './FlowUI';

type Props = NativeStackScreenProps<ConstructionRequirementStackParamList, 'HomeRequirement'>;
const choices = [{label: 'G+0', floors: 1, detail: 'Ground Floor'}, {label: 'G+1', floors: 2, detail: 'Ground + First'}, {label: 'G+2', floors: 3, detail: 'Ground + First + Second'}, {label: 'G+3', floors: 4, detail: 'Up to Third'}];

export function HomeRequirementScreen({navigation}: Props) {
  const journey = useConstructionJourneyStore();
  const [selected, setSelected] = useState(journey.floorCount <= 4 ? journey.floorCount : 0);
  const [custom, setCustom] = useState(journey.floorCount > 4 ? String(journey.floorCount) : '');
  const [error, setError] = useState('');
  const next = () => { const count = selected || Number(custom); if (!count || count < 1 || count > 10) return setError('Choose one to ten floors.'); journey.setFloorCount(count); navigation.navigate({name: 'BudgetTimeline', params: {}}); };
  return <FlowPage title="Floor Selection" step={2} totalSteps={6} onBack={navigation.goBack} primary={{label: 'Continue', onPress: next}}>
    <View style={styles.intro}><Text style={styles.heading}>How many floors do you want to construct?</Text><Text style={styles.hint}>Each floor can have its own rooms, parking and balconies.</Text></View>
    <View style={styles.grid}>{choices.map(item => <Pressable key={item.label} onPress={() => {setSelected(item.floors); setCustom(''); setError('');}} style={[styles.card, selected === item.floors && styles.selected]}><Text style={[styles.label, selected === item.floors && styles.selectedText]}>{item.label}</Text><Text style={styles.detail}>{item.detail}</Text></Pressable>)}</View>
    <FlowSection title="Custom"><Pressable onPress={() => setSelected(0)} style={[styles.customToggle, selected === 0 && styles.selected]}><Text style={styles.label}>Custom number of floors</Text></Pressable>{selected === 0 ? <TextInput value={custom} onChangeText={value => {setCustom(value.replace(/[^0-9]/g, '')); setError('');}} keyboardType="number-pad" placeholder="Enter 1 to 10" placeholderTextColor={flow.muted} style={styles.input} /> : null}</FlowSection>
    <Text style={styles.note}>Changing the floor count keeps the requirements for retained floors. Removed floors are kept only until you confirm a new floor count.</Text>{error ? <Text style={styles.error}>{error}</Text> : null}
  </FlowPage>;
}
const styles = StyleSheet.create({intro: {gap: 5}, heading: {fontSize: 17, color: flow.ink, fontWeight: '800'}, hint: {fontSize: 12, color: flow.muted, lineHeight: 18}, grid: {flexDirection: 'row', flexWrap: 'wrap', gap: 9}, card: {width: '47.8%', minHeight: 88, padding: 12, justifyContent: 'space-between', borderWidth: 1, borderRadius: 8, borderColor: flow.line, backgroundColor: flow.surface}, selected: {borderColor: flow.blue, backgroundColor: flow.blueSoft}, label: {fontSize: 15, color: flow.ink, fontWeight: '800'}, selectedText: {color: flow.blue}, detail: {fontSize: 10, color: flow.muted}, customToggle: {height: 45, justifyContent: 'center', paddingHorizontal: 11, borderWidth: 1, borderColor: flow.line, borderRadius: 7, backgroundColor: flow.surface}, input: {height: 45, borderWidth: 1, borderColor: flow.line, borderRadius: 7, paddingHorizontal: 11, color: flow.ink, backgroundColor: flow.surface}, note: {fontSize: 11, lineHeight: 16, color: flow.muted}, error: {fontSize: 12, color: flow.red}});
