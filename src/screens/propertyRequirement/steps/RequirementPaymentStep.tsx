import React from 'react';
import {Pressable, StyleSheet, Text, TextInput, View} from 'react-native';
import {usePropertyRequirementStore} from '@/store/propertyRequirementStore';

const paymentOptions = [
  {label:'Full Payment / Self Funded',value:'SELF_FUNDED'},
  {label:'Home Loan',value:'HOME_LOAN'},
  {label:'Part Loan + Own Funds',value:'PART_LOAN'},
  {label:'Not Decided',value:'NOT_DECIDED'},
] as const;
const occupations = [
  {label:'Salaried',value:'SALARIED'},
  {label:'Self-Employed / Business',value:'SELF_EMPLOYED'},
  {label:'Professional',value:'PROFESSIONAL'},
  {label:'Other',value:'OTHER'},
] as const;
const loanStatuses = [
  {label:'Not Applied',value:'NOT_APPLIED'},
  {label:'Planning to Apply',value:'PLANNING_TO_APPLY'},
  {label:'Pre-Approved',value:'PRE_APPROVED'},
  {label:'Approved',value:'APPROVED'},
] as const;

export function RequirementPaymentStep(){const {draft,setPayment,set}=usePropertyRequirementStore();const needsLoan=draft.paymentPreference==='HOME_LOAN'||draft.paymentPreference==='PART_LOAN';return <View style={s.container}><Text style={s.label}>How are you planning to purchase?</Text><View style={s.options}>{paymentOptions.map(x=><Choice key={x.value} label={x.label} selected={draft.paymentPreference===x.value} onPress={()=>setPayment(x.value)}/>)}</View>{needsLoan?<><Text style={s.label}>Occupation</Text><View style={s.options}>{occupations.map(x=><Choice key={x.value} label={x.label} selected={draft.occupation===x.value} onPress={()=>set({occupation:x.value})}/>)}</View><Text style={s.label}>Approx Loan Requirement</Text><TextInput value={draft.loanRequirement} onChangeText={loanRequirement=>set({loanRequirement:loanRequirement&&Number(loanRequirement)>=0?loanRequirement:undefined})} keyboardType="decimal-pad" placeholder="Amount in ₹ (optional)" style={s.input}/><Text style={s.label}>Loan Status</Text><View style={s.options}>{loanStatuses.map(x=><Choice key={x.value} label={x.label} selected={draft.loanStatus===x.value} onPress={()=>set({loanStatus:x.value})}/>)}</View></>:null}</View>}
function Choice({label,selected,onPress}:{label:string;selected:boolean;onPress:()=>void}){return <Pressable onPress={onPress} style={[s.choice,selected&&s.selected]}><Text style={selected?s.selectedText:s.text}>{label}</Text></Pressable>}
const s=StyleSheet.create({container:{gap:11},label:{fontSize:14,fontWeight:'700',color:'#1F2937'},options:{flexDirection:'row',flexWrap:'wrap',gap:8},choice:{borderWidth:1,borderColor:'#CBD5E1',borderRadius:18,paddingHorizontal:12,paddingVertical:9},selected:{borderColor:'#2563EB',backgroundColor:'#EFF6FF'},text:{color:'#374151'},selectedText:{color:'#1D4ED8',fontWeight:'700'},input:{borderWidth:1,borderColor:'#CBD5E1',borderRadius:8,padding:12,color:'#111827'}});
