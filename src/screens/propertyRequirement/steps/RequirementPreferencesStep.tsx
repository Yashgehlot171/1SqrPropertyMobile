import React from 'react';
import {StyleSheet, Text, TextInput, View} from 'react-native';
import {usePropertyRequirementStore} from '@/store/propertyRequirementStore';

export function RequirementPreferencesStep(){const {draft,set}=usePropertyRequirementStore();return <View style={styles.container}><Text style={styles.label}>Additional Requirement</Text><Text style={styles.helper}>Tell us anything else you are looking for in the property.</Text><TextInput value={draft.additionalRequirement??''} onChangeText={additionalRequirement=>set({additionalRequirement})} multiline maxLength={5000} placeholder="Share any other preferences" style={styles.input}/></View>}
const styles=StyleSheet.create({container:{gap:9},label:{fontSize:14,fontWeight:'700',color:'#1F2937'},helper:{fontSize:12,color:'#64748B'},input:{minHeight:120,borderWidth:1,borderColor:'#CBD5E1',borderRadius:8,padding:12,textAlignVertical:'top',color:'#111827'}});
