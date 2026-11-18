import React, {useCallback, useEffect, useState} from 'react';
import {ActivityIndicator, FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View} from 'react-native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import {LocationMasterPicker} from '@/components/common/LocationMasterPicker';
import {colors} from '@/constants/colors';
import {ROUTES} from '@/constants/routes';
import {spacing} from '@/constants/spacing';
import {typography} from '@/constants/typography';
import {getMasterData, type MasterRecord} from '@/services/masterApi';
import {getAreasByCity} from '@/services/locationApi';
import {getBrokerLeadCrmLeads, type BrokerLeadCrmFilters, type BrokerLeadCrmStatus, type BrokerLeadCrmSummary} from '@/services/brokerLeadCrmApi';
import type {HomeStackParamList} from '@/types';

const statuses: {key: BrokerLeadCrmStatus | undefined; label: string}[] = [
  {key: undefined,label:'All'}, {key:'PURCHASED',label:'Purchased'}, {key:'CONTACTED',label:'Contacted'},
  {key:'INTERESTED',label:'Interested'}, {key:'SITE_VISIT',label:'Site Visit'}, {key:'NEGOTIATING',label:'Negotiating'},
  {key:'DEAL_CLOSED',label:'Closed'}, {key:'NOT_INTERESTED',label:'Not Interested'},
];
const statusLabels: Record<BrokerLeadCrmStatus,string> = {PURCHASED:'Purchased',CONTACTED:'Contacted',INTERESTED:'Interested',SITE_VISIT:'Site Visit',NEGOTIATING:'Negotiating',DEAL_CLOSED:'Deal Closed',NOT_INTERESTED:'Not Interested'};
const money = (value: string | null) => value ? `₹${Number(value).toLocaleString('en-IN')}` : '—';
const localDateTime = (value: string) => new Date(value).toLocaleString('en-IN',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'});

export function BrokerMyLeadsPanel({navigation}: {navigation: NativeStackNavigationProp<HomeStackParamList,'BrokerLeads'>}) {
  const [items,setItems]=useState<BrokerLeadCrmSummary[]>([]);
  const [loading,setLoading]=useState(true);const [refreshing,setRefreshing]=useState(false);const [error,setError]=useState('');
  const [page,setPage]=useState(1);const [total,setTotal]=useState(0);const [totalPages,setTotalPages]=useState(0);
  const [filters,setFilters]=useState<BrokerLeadCrmFilters>({page:1,limit:20});
  const [cities,setCities]=useState<MasterRecord[]>([]);const [types,setTypes]=useState<MasterRecord[]>([]);const [areas,setAreas]=useState<MasterRecord[]>([]);const [filterError,setFilterError]=useState('');
  useEffect(()=>{Promise.all([getMasterData('cities',{limit:100}),getMasterData('property-types',{limit:100})]).then(([cityRows,typeRows])=>{setCities(cityRows.items);setTypes(typeRows.items);}).catch(reason=>setFilterError(reason instanceof Error?reason.message:'Unable to load lead filters.'));},[]);
  const load=useCallback(async(isRefresh=false)=>{
    isRefresh?setRefreshing(true):setLoading(true);setError('');
    try{const result=await getBrokerLeadCrmLeads({...filters,page,limit:20});setItems(result.items);setTotal(result.pagination.total);setTotalPages(result.pagination.totalPages);}
    catch(reason){setError(reason instanceof Error?reason.message:'Unable to load purchased leads.');}
    finally{setLoading(false);setRefreshing(false);}
  },[filters,page]);
  useEffect(()=>{load();},[load]);
  const update=(next:Partial<BrokerLeadCrmFilters>)=>{setPage(1);setFilters(current=>({...current,...next,page:1}));};
  const selectCity=async(item:MasterRecord)=>{update({cityId:item.id,localityId:undefined});setAreas([]);try{setAreas((await getAreasByCity(item.id)).items);}catch{setFilterError('Unable to load localities for this city.');}};
  const renderItem=({item}:{item:BrokerLeadCrmSummary})=>{
    const overdue=Boolean(item.nextFollowUpAt&&new Date(item.nextFollowUpAt).getTime()<Date.now()&&!['DEAL_CLOSED','NOT_INTERESTED'].includes(item.status));
    return <Pressable testID={`broker-crm-lead-${item.id}`} accessibilityRole="button" onPress={()=>navigation.navigate(ROUTES.home.brokerLeadCrmDetail,{leadId:item.id,requirementId:item.requirementId})} style={styles.card}>
      <View style={styles.cardTop}><View style={styles.icon}><Icon name="people-outline" size={20} color={colors.primary}/></View><View style={styles.heading}><Text style={styles.title}>{item.propertyType} · {item.city??'City not specified'}</Text><Text style={styles.meta}>{item.localities.join(', ')||'Locality not specified'}</Text></View><Text style={styles.badge}>{statusLabels[item.status]}</Text></View>
      <View style={styles.row}><Text style={styles.value}>Buyer</Text><Text style={styles.value}>{money(item.budget.min)} – {money(item.budget.max)}</Text></View>
      <Text style={styles.meta}>Purchased {item.purchasedAt?localDateTime(item.purchasedAt):'date unavailable'}</Text>
      {item.nextFollowUpAt?<Text style={[styles.followUp,overdue&&styles.overdue]}>{overdue?'Overdue · ': 'Follow-up · '}{localDateTime(item.nextFollowUpAt)}</Text>:<Text style={styles.meta}>No follow-up scheduled</Text>}
    </Pressable>;
  };
  return <View style={styles.panel}>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
      <LocationMasterPicker label="City" value={cities.find(item=>item.id===filters.cityId)?.name??''} placeholder="Any city" items={cities} onSelect={selectCity}/>
      {filters.cityId?<LocationMasterPicker label="Locality" value={areas.find(item=>item.id===filters.localityId)?.name??''} placeholder="Any locality" items={areas} onSelect={item=>update({localityId:item.id})}/>:null}
      <LocationMasterPicker label="Property Type" value={types.find(item=>item.id===filters.propertyTypeId)?.name??''} placeholder="Any type" items={types} onSelect={item=>update({propertyTypeId:item.id})}/>
    </ScrollView>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
      {statuses.map(item=><Chip key={item.label} label={item.label} selected={filters.status===item.key} onPress={()=>update({status:item.key})}/>)}
      <Chip label="Follow-up Due" selected={filters.followUp==='DUE'} onPress={()=>update({followUp:filters.followUp==='DUE'?undefined:'DUE'})}/>
      <Chip label="Upcoming" selected={filters.followUp==='UPCOMING'} onPress={()=>update({followUp:filters.followUp==='UPCOMING'?undefined:'UPCOMING'})}/>
    </ScrollView>
    {filterError?<Text style={styles.error}>{filterError}</Text>:null}
    {loading&&!items.length?<View style={styles.state}><ActivityIndicator color={colors.primary}/><Text style={styles.meta}>Loading your purchased leads…</Text></View>:!items.length&&error?<View style={styles.state}><Text style={styles.error}>{error}</Text><Pressable onPress={()=>load()}><Text style={styles.retry}>Retry</Text></Pressable></View>:<>
      {error?<Text style={styles.error}>{error}</Text>:null}
      <FlatList data={items} keyExtractor={item=>item.id} renderItem={renderItem} contentContainerStyle={items.length?styles.list:styles.empty} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={()=>load(true)} tintColor={colors.primary}/>} ListEmptyComponent={<View style={styles.state}><Icon name="briefcase-outline" size={32} color={colors.textSecondary}/><Text style={styles.title}>No purchased leads yet</Text><Text style={styles.meta}>Successful purchases appear here for your follow-up.</Text></View>} ListFooterComponent={totalPages>1?<View style={styles.pagination}><Pressable disabled={page<=1} onPress={()=>setPage(value=>value-1)}><Text style={page<=1?styles.disabled:styles.retry}>Previous</Text></Pressable><Text style={styles.meta}>Page {page} of {totalPages} · {total} leads</Text><Pressable disabled={page>=totalPages} onPress={()=>setPage(value=>value+1)}><Text style={page>=totalPages?styles.disabled:styles.retry}>Next</Text></Pressable></View>:null}/>
    </>}
  </View>;
}

function Chip({label,selected,onPress}:{label:string;selected:boolean;onPress:()=>void}){return <Pressable accessibilityRole="button" onPress={onPress} style={[styles.chip,selected&&styles.chipSelected]}><Text style={[styles.chipText,selected&&styles.chipTextSelected]}>{label}</Text></Pressable>;}
const styles=StyleSheet.create({panel:{flex:1},filters:{padding:spacing.md,gap:spacing.sm,alignItems:'flex-end'},chips:{paddingHorizontal:spacing.md,paddingBottom:spacing.md,gap:spacing.sm},chip:{borderWidth:1,borderColor:colors.border,borderRadius:20,paddingHorizontal:spacing.md,paddingVertical:8,backgroundColor:colors.surface},chipSelected:{backgroundColor:colors.primarySoft,borderColor:colors.primary},chipText:{fontSize:typography.fontSize.xs,color:colors.textSecondary},chipTextSelected:{color:colors.primary,fontWeight:typography.fontWeight.bold},list:{padding:spacing.md,paddingTop:0,gap:spacing.md},empty:{flexGrow:1,justifyContent:'center',padding:spacing.xl},card:{backgroundColor:colors.surface,borderColor:colors.border,borderWidth:1,borderRadius:spacing.radiusLg,padding:spacing.md,gap:spacing.sm},cardTop:{flexDirection:'row',alignItems:'center',gap:spacing.sm},icon:{width:40,height:40,borderRadius:13,alignItems:'center',justifyContent:'center',backgroundColor:colors.primarySoft},heading:{flex:1,gap:3},title:{fontSize:typography.fontSize.sm,fontWeight:typography.fontWeight.bold,color:colors.textPrimary},meta:{fontSize:typography.fontSize.xs,color:colors.textSecondary},badge:{fontSize:typography.fontSize.xs,fontWeight:typography.fontWeight.bold,color:colors.primary},row:{flexDirection:'row',justifyContent:'space-between',gap:spacing.sm},value:{fontSize:typography.fontSize.sm,color:colors.textPrimary,fontWeight:typography.fontWeight.semiBold},followUp:{fontSize:typography.fontSize.xs,color:colors.primary,fontWeight:typography.fontWeight.bold},overdue:{color:colors.error},state:{flex:1,alignItems:'center',justifyContent:'center',padding:spacing.xl,gap:spacing.md},error:{color:colors.error,textAlign:'center'},retry:{color:colors.primary,fontWeight:typography.fontWeight.bold},disabled:{color:colors.textSecondary,opacity:.5},pagination:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingVertical:spacing.lg}});
