import React, {useCallback, useState} from 'react';
import {ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import {colors} from '@/constants/colors';
import {spacing} from '@/constants/spacing';
import {typography} from '@/constants/typography';
import {getPurchasedBuyerContact, type PurchasedBuyerContact} from '@/services/propertyLeadDiscoveryApi';
import {addBrokerLeadCrmNote, getBrokerLeadCrmDetail, updateBrokerLeadCrmStatus, setBrokerLeadCrmFollowUp, type BrokerLeadCrmDetail, type BrokerLeadCrmStatus} from '@/services/brokerLeadCrmApi';
import {callPurchasedLeadBuyer, openPurchasedLeadWhatsApp} from '@/utils/purchasedLeadContactActions';
import {localDateKey, localTimeKey, scheduleDate} from '@/utils/dateTime';
import {SchedulePickerFields} from '@/screens/constructionRequirement/SchedulePickerFields';
import type {HomeStackParamList} from '@/types';

type Props=NativeStackScreenProps<HomeStackParamList,'BrokerLeadCrmDetail'>;
const labels:Record<BrokerLeadCrmStatus,string>={PURCHASED:'Purchased',CONTACTED:'Contacted',INTERESTED:'Interested',SITE_VISIT:'Site Visit',NEGOTIATING:'Negotiating',DEAL_CLOSED:'Deal Closed',NOT_INTERESTED:'Not Interested'};
const money=(value:string|null)=>value?`₹${Number(value).toLocaleString('en-IN')}`:'—';
const localDateTime=(value:string)=>new Date(value).toLocaleString('en-IN',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'});

export function BrokerLeadCrmDetailScreen({route,navigation}:Props){
  const [lead,setLead]=useState<BrokerLeadCrmDetail>();const [contact,setContact]=useState<PurchasedBuyerContact>();
  const [loading,setLoading]=useState(true);const [error,setError]=useState('');const [contactError,setContactError]=useState('');const [working,setWorking]=useState(false);const [note,setNote]=useState('');
  const [followDate,setFollowDate]=useState('');const [followTime,setFollowTime]=useState('');const [actionError,setActionError]=useState('');
  const load=useCallback(async()=>{
    setLoading(true);setError('');setContact(undefined);setContactError('');
    try{
      const result=await getBrokerLeadCrmDetail(route.params.leadId);setLead(result);
      if(result.nextFollowUpAt){const date=new Date(result.nextFollowUpAt);setFollowDate(localDateKey(date));setFollowTime(localTimeKey(date));}else{setFollowDate('');setFollowTime('');}
      if(result.contactEntitlementAvailable){try{setContact(await getPurchasedBuyerContact(route.params.requirementId));}catch(reason){setContactError(reason instanceof Error?reason.message:'Purchased contact is unavailable.');}}
    }catch(reason){setError(reason instanceof Error?reason.message:'Unable to load this purchased lead.');}
    finally{setLoading(false);}
  },[route.params.leadId,route.params.requirementId]);
  useFocusEffect(useCallback(()=>{load();},[load]));
  const run=async(action:()=>Promise<BrokerLeadCrmDetail>)=>{setWorking(true);setActionError('');try{setLead(await action());}catch(reason){setActionError(reason instanceof Error?reason.message:'Could not save this CRM update.');}finally{setWorking(false);}};
  const changeStatus=(status:BrokerLeadCrmStatus)=>run(()=>updateBrokerLeadCrmStatus(route.params.leadId,status));
  const saveNote=async()=>{if(!note.trim())return;const text=note.trim();await run(async()=>{const result=await addBrokerLeadCrmNote(route.params.leadId,text);setNote('');return result;});};
  const saveFollowUp=()=>{
    if(!followDate||!followTime)return;
    const value=scheduleDate(followDate,followTime);
    if(value.getTime()<=Date.now()){setActionError('Choose a future follow-up time.');return;}
    return run(()=>setBrokerLeadCrmFollowUp(route.params.leadId,value.toISOString()));
  };
  const clearFollowUp=()=>Alert.alert('Clear follow-up?','This will be recorded in this lead’s activity history.',[{text:'Cancel',style:'cancel'},{text:'Clear',style:'destructive',onPress:()=>run(()=>setBrokerLeadCrmFollowUp(route.params.leadId,null))}]);
  const terminal=lead?['DEAL_CLOSED','NOT_INTERESTED'].includes(lead.status):false;
  if(loading&&!lead)return <View style={styles.state}><ActivityIndicator color={colors.primary}/><Text style={styles.muted}>Loading purchased lead…</Text></View>;
  if(!lead)return <View style={styles.state}><Text style={styles.error}>{error}</Text><Pressable onPress={()=>load()}><Text style={styles.link}>Retry</Text></Pressable></View>;
  return <ScrollView contentContainerStyle={styles.page}>
    <View style={styles.header}><Pressable onPress={()=>navigation.goBack()}><Icon name="arrow-back" size={24} color={colors.textPrimary}/></Pressable><View style={styles.heading}><Text style={styles.title}>My Lead</Text><Text style={styles.muted}>{labels[lead.status]}</Text></View><Pressable accessibilityRole="button" onPress={()=>load()}><Icon name="refresh-outline" size={22} color={colors.primary}/></Pressable></View>
    {actionError?<Text style={styles.error}>{actionError}</Text>:null}
    <View style={styles.card}><Text style={styles.sectionTitle}>Buyer</Text>{contact?<><Text style={styles.value}>{contact.buyerName}</Text><Text style={styles.value}>{contact.mobile}</Text><View style={styles.actions}>{contact.canCall?<Action label="Call" onPress={()=>{callPurchasedLeadBuyer(contact.mobile).catch(()=>undefined);}}/>:null}{contact.canWhatsApp?<Action label="WhatsApp" onPress={()=>{openPurchasedLeadWhatsApp(contact.buyerName,contact.mobile).catch(()=>undefined);}} whatsapp/>:null}</View></>:<Text style={styles.muted}>{contactError||'Loading purchased contact…'}</Text>}</View>
    <View style={styles.card}><Text style={styles.sectionTitle}>Requirement</Text><Text style={styles.value}>{lead.propertyType} · {lead.city??'City not specified'}</Text><Text style={styles.muted}>{lead.localities.join(', ')||'Locality not specified'}</Text><Text style={styles.value}>Budget {money(lead.budget.min)} – {money(lead.budget.max)}</Text>{lead.area.min||lead.area.max?<Text style={styles.muted}>Area {lead.area.min??'—'} – {lead.area.max??'—'} {lead.area.unit??''}</Text>:null}<Text style={styles.muted}>Purchased {lead.purchasedAt?localDateTime(lead.purchasedAt):'date unavailable'}</Text></View>
    <View style={styles.card}><Text style={styles.sectionTitle}>CRM · {labels[lead.status]}</Text>{terminal?<Text style={styles.muted}>This lead is closed. CRM updates are no longer available.</Text>:<><Text style={styles.label}>Next status</Text><View style={styles.statuses}>{lead.allowedNextStatuses.map(status=><Action key={status} label={labels[status]} disabled={working} onPress={()=>changeStatus(status)}/>)}</View></>}</View>
    <View style={styles.card}><Text style={styles.sectionTitle}>Next Follow-up</Text>{lead.nextFollowUpAt?<Text style={[styles.followText,new Date(lead.nextFollowUpAt).getTime()<Date.now()&&!terminal&&styles.overdue]}> {new Date(lead.nextFollowUpAt).getTime()<Date.now()&&!terminal?'Overdue · ':''}{localDateTime(lead.nextFollowUpAt)}</Text>:<Text style={styles.muted}>No follow-up scheduled</Text>}{!terminal?<><SchedulePickerFields date={followDate} time={followTime} onDateChange={setFollowDate} onTimeChange={setFollowTime} dateLabel="Follow-up date" timeLabel="Follow-up time"/><View style={styles.actions}><Action label={lead.nextFollowUpAt?'Reschedule':'Schedule'} onPress={saveFollowUp} disabled={working||!followDate||!followTime}/>{lead.nextFollowUpAt?<Action label="Clear" onPress={clearFollowUp} disabled={working} danger/>:null}</View></>:null}</View>
    <View style={styles.card}><Text style={styles.sectionTitle}>Private Notes</Text>{!terminal?<><TextInput accessibilityLabel="Private Broker note" multiline maxLength={2000} value={note} onChangeText={setNote} placeholder="Add a private note about this Buyer…" placeholderTextColor={colors.textSecondary} style={styles.noteInput}/><Action label="Add Note" onPress={saveNote} disabled={working||!note.trim()}/></>:null}{lead.notes.length?lead.notes.map(item=><View key={item.id} style={styles.note}><Text style={styles.value}>{item.note}</Text><Text style={styles.muted}>{localDateTime(item.createdAt)}</Text></View>):<Text style={styles.muted}>No notes yet.</Text>}</View>
    <View style={styles.card}><Text style={styles.sectionTitle}>Activity History</Text>{lead.activities.map(item=><View key={item.id} style={styles.activity}><Text style={styles.value}>{activityLabel(item.type,item.previousValue,item.newValue)}</Text><Text style={styles.muted}>{localDateTime(item.createdAt)}</Text></View>)}{lead.historyTruncated?<Text style={styles.muted}>Showing the most recent activity and notes.</Text>:null}</View>
  </ScrollView>;
}

function activityLabel(type:string,previous:string|null,next:string|null){if(type==='INITIALIZED')return 'Lead purchased';if(type==='STATUS_CHANGED')return `${previous?labels[previous as BrokerLeadCrmStatus]??previous:'Status'} → ${next?labels[next as BrokerLeadCrmStatus]??next:'Status'}`;if(type==='NOTE_ADDED')return 'Private note added';if(type==='FOLLOW_UP_SCHEDULED')return 'Follow-up scheduled';if(type==='FOLLOW_UP_RESCHEDULED')return 'Follow-up rescheduled';if(type==='FOLLOW_UP_CLEARED')return 'Follow-up cleared';return 'Lead updated';}
function Action({label,onPress,disabled,danger,whatsapp}:{label:string;onPress:()=>void;disabled?:boolean;danger?:boolean;whatsapp?:boolean}){return <Pressable testID={`broker-crm-action-${label.toLowerCase().replace(/[^a-z0-9]+/g,'-')}`} accessibilityRole="button" disabled={disabled} onPress={onPress} style={[styles.action,disabled&&styles.disabled,danger&&styles.danger,whatsapp&&styles.whatsapp]}><Text style={styles.actionText}>{label}</Text></Pressable>;}
const styles=StyleSheet.create({page:{padding:spacing.lg,gap:spacing.md,backgroundColor:colors.background},header:{flexDirection:'row',alignItems:'center',gap:spacing.md},heading:{flex:1},title:{fontSize:typography.fontSize.lg,fontWeight:typography.fontWeight.bold,color:colors.textPrimary},card:{backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border,borderRadius:spacing.radiusLg,padding:spacing.md,gap:spacing.sm},sectionTitle:{fontSize:typography.fontSize.md,fontWeight:typography.fontWeight.bold,color:colors.textPrimary},label:{fontSize:typography.fontSize.xs,fontWeight:typography.fontWeight.bold,color:colors.textSecondary},value:{fontSize:typography.fontSize.sm,color:colors.textPrimary},muted:{fontSize:typography.fontSize.xs,color:colors.textSecondary},actions:{flexDirection:'row',flexWrap:'wrap',gap:spacing.sm},statuses:{flexDirection:'row',flexWrap:'wrap',gap:spacing.sm},action:{minHeight:42,justifyContent:'center',alignItems:'center',backgroundColor:colors.primary,borderRadius:spacing.radiusMd,paddingHorizontal:spacing.md},actionText:{fontSize:typography.fontSize.xs,fontWeight:typography.fontWeight.bold,color:colors.white},whatsapp:{backgroundColor:'#25D366'},danger:{backgroundColor:colors.error},disabled:{opacity:.5},followText:{fontSize:typography.fontSize.sm,color:colors.textPrimary,fontWeight:typography.fontWeight.bold},overdue:{color:colors.error},noteInput:{minHeight:88,maxHeight:160,borderWidth:1,borderColor:colors.border,borderRadius:spacing.radiusMd,padding:spacing.md,color:colors.textPrimary,textAlignVertical:'top'},note:{borderTopWidth:1,borderColor:colors.border,paddingTop:spacing.sm,gap:4},activity:{borderTopWidth:1,borderColor:colors.border,paddingTop:spacing.sm,gap:4},state:{flex:1,alignItems:'center',justifyContent:'center',gap:spacing.md},error:{color:colors.error,textAlign:'center'},link:{color:colors.primary,fontWeight:typography.fontWeight.bold}});
