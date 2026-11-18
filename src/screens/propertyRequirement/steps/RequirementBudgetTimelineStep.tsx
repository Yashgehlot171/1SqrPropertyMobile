import React from 'react';
import {Pressable, StyleSheet, Text, TextInput, View} from 'react-native';
import {usePropertyRequirementStore} from '@/store/propertyRequirementStore';

const timelines = [
  {label: 'Immediately', value: 'IMMEDIATELY'},
  {label: 'Within 1 Month', value: 'WITHIN_1_MONTH'},
  {label: '1–3 Months', value: 'WITHIN_3_MONTHS'},
  {label: '3–6 Months', value: 'WITHIN_6_MONTHS'},
  {label: '6+ Months', value: 'OVER_6_MONTHS'},
];

export function RequirementBudgetTimelineStep() {
  const {draft, set} = usePropertyRequirementStore();
  const min = draft.budgetMin ? Number(draft.budgetMin) : undefined;
  const max = draft.budgetMax ? Number(draft.budgetMax) : undefined;
  const invalid = (min !== undefined && min <= 0) || (max !== undefined && max <= 0) || (min !== undefined && max !== undefined && min > max);

  return <View style={styles.container}>
    <Text style={styles.label}>Minimum Budget</Text>
    <TextInput value={draft.budgetMin} onChangeText={budgetMin => set({budgetMin})} keyboardType="decimal-pad" placeholder="Enter minimum amount in ₹" style={styles.input}/>
    <Text style={styles.label}>Maximum Budget</Text>
    <TextInput value={draft.budgetMax} onChangeText={budgetMax => set({budgetMax})} keyboardType="decimal-pad" placeholder="Enter maximum amount in ₹" style={styles.input}/>
    {invalid ? <Text style={styles.error}>Enter positive amounts and ensure the minimum does not exceed the maximum.</Text> : null}
    <Text style={styles.label}>When are you planning to purchase?</Text>
    <View style={styles.options}>{timelines.map(option => <Pressable key={option.value} onPress={() => set({purchaseTimeline: option.value})} style={[styles.option, draft.purchaseTimeline === option.value && styles.selected]}><Text style={draft.purchaseTimeline === option.value ? styles.selectedText : styles.optionText}>{option.label}</Text></Pressable>)}</View>
  </View>;
}

const styles=StyleSheet.create({container:{gap:10},label:{fontSize:14,fontWeight:'700',color:'#1F2937'},input:{borderWidth:1,borderColor:'#CBD5E1',borderRadius:8,padding:12,color:'#111827'},options:{flexDirection:'row',flexWrap:'wrap',gap:8},option:{borderWidth:1,borderColor:'#CBD5E1',borderRadius:18,paddingHorizontal:12,paddingVertical:9},selected:{borderColor:'#2563EB',backgroundColor:'#EFF6FF'},optionText:{color:'#374151'},selectedText:{color:'#1D4ED8',fontWeight:'700'},error:{color:'#B91C1C',fontSize:12}});
