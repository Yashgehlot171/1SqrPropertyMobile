import React, {useState} from 'react';
import {Pressable, StyleSheet, Text, TextInput, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import {ROUTES} from '@/constants/routes';
import {useConstructionJourneyStore} from '@/store/constructionJourneyStore';
import type {ConstructionRequirementStackParamList} from '@/types';
import {FlowPage, FlowSection, flow} from './FlowUI';

type Props = NativeStackScreenProps<ConstructionRequirementStackParamList, 'AdditionalPreferences'>;
const options = [{id: 'kitchen', label: 'Modular Kitchen', icon: 'restaurant-outline'}, {id: 'home-theatre', label: 'Home Theatre', icon: 'tv-outline'}, {id: 'solar', label: 'Solar Panel', icon: 'sunny-outline'}, {id: 'lift', label: 'Lift', icon: 'swap-vertical-outline'}, {id: 'garden', label: 'Garden / Landscape', icon: 'leaf-outline'}, {id: 'parking', label: 'Extra Parking', icon: 'car-outline'}, {id: 'ceiling', label: 'False Ceiling', icon: 'layers-outline'}, {id: 'rainwater', label: 'Rainwater Harvesting', icon: 'water-outline'}];

export function AdditionalPreferencesScreen({navigation}: Props) {
  const journey = useConstructionJourneyStore();
  const [selected, setSelected] = useState(journey.additionalPreferences);
  const [notes, setNotes] = useState(journey.notes);
  const [quality, setQuality] = useState(journey.quality);
  const toggle = (id: string) => setSelected(items => items.includes(id) ? items.filter(item => item !== id) : [...items, id]);
  const next = () => { journey.setPreferences({quality, additionalPreferences: selected, notes}); journey.setRequirementDraft(); navigation.navigate(ROUTES.constructionRequirement.reviewRequirement); };
  return <FlowPage title="Additional Preferences" step={5} totalSteps={6} onBack={navigation.goBack} primary={{label: 'Review Requirement', onPress: next}}>
    <FlowSection title="Construction Quality"><View style={styles.qualityRow}>{(['Standard', 'Premium', 'Luxury'] as const).map(item => <Pressable key={item} onPress={() => setQuality(item)} style={[styles.quality, quality === item && styles.selected]}><Text style={styles.label}>{item}</Text></Pressable>)}</View></FlowSection>
    <FlowSection title="Additional Requirements (Optional)"><View style={styles.grid}>{options.map(item => <Pressable key={item.id} onPress={() => toggle(item.id)} style={[styles.option, selected.includes(item.id) && styles.selected]}><Icon name={item.icon} size={21} color={selected.includes(item.id) ? flow.blue : flow.muted} /><Text style={styles.label}>{item.label}</Text>{selected.includes(item.id) ? <Icon name="checkmark-circle" size={16} color={flow.blue} /> : null}</Pressable>)}</View></FlowSection>
    <FlowSection title="Other Preferences"><TextInput value={notes} onChangeText={setNotes} multiline maxLength={500} placeholder="Any specific requirement? e.g. more balcony, pooja room, etc." placeholderTextColor={flow.muted} style={styles.notes} /><Text style={styles.counter}>{notes.length}/500</Text></FlowSection>
  </FlowPage>;
}
const styles = StyleSheet.create({grid: {gap: 8}, qualityRow: {flexDirection: 'row', gap: 8}, quality: {flex: 1, minHeight: 43, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: flow.line, borderRadius: 7, backgroundColor: flow.surface}, option: {minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 9, borderWidth: 1, borderColor: flow.line, borderRadius: 7, paddingHorizontal: 11, backgroundColor: flow.surface}, selected: {borderColor: flow.blue, backgroundColor: flow.blueSoft}, label: {flex: 1, fontSize: 12, color: flow.ink}, notes: {height: 110, borderWidth: 1, borderColor: flow.line, borderRadius: 7, padding: 11, color: flow.ink, textAlignVertical: 'top'}, counter: {textAlign: 'right', color: flow.muted, fontSize: 10}});
