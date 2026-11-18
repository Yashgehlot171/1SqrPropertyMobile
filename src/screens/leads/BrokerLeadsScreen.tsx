import React, {useCallback, useState} from 'react';
import {ActivityIndicator, FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';

import {LocationMasterPicker} from '@/components/common/LocationMasterPicker';
import {colors} from '@/constants/colors';
import {ROUTES} from '@/constants/routes';
import {spacing} from '@/constants/spacing';
import {typography} from '@/constants/typography';
import {getAreasByCity} from '@/services/locationApi';
import {getMasterData, type MasterRecord} from '@/services/masterApi';
import {getBrokerBuyerLeads, type BrokerBuyerLead, type BrokerLeadFilters} from '@/services/propertyLeadDiscoveryApi';
import {BrokerMyLeadsPanel} from '@/screens/leads/BrokerMyLeadsPanel';
import type {HomeStackParamList} from '@/types';

type Props = NativeStackScreenProps<HomeStackParamList, 'BrokerLeads'>;
const timelines = [['IMMEDIATELY','Immediately'],['WITHIN_1_MONTH','Within 1 month'],['WITHIN_3_MONTHS','Within 3 months'],['WITHIN_6_MONTHS','Within 6 months'],['OVER_6_MONTHS','Over 6 months']];
const payments = [['SELF_FUNDED','Self funded'],['HOME_LOAN','Home loan'],['PART_LOAN','Part loan'],['NOT_DECIDED','Not decided']];
const money = (n: string | null) => n ? `₹${Number(n).toLocaleString('en-IN')}` : null;
const timelineLabel = (value: string | null) => timelines.find(([key]) => key === value)?.[1] ?? 'Timeline not specified';
const paymentLabel = (value: string | null) => payments.find(([key]) => key === value)?.[1] ?? 'Payment not specified';

export function BrokerLeadsScreen({navigation}: Props) {
  const [items, setItems] = useState<BrokerBuyerLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [configurationMessage, setConfigurationMessage] = useState('');
  const [filters, setFilters] = useState<BrokerLeadFilters>({page: 1, limit: 20});
  const [cities, setCities] = useState<MasterRecord[]>([]);
  const [types, setTypes] = useState<MasterRecord[]>([]);
  const [areas, setAreas] = useState<MasterRecord[]>([]);
  const [filterError, setFilterError] = useState('');
  const [tab, setTab] = useState<'AVAILABLE'|'MY_LEADS'>('AVAILABLE');
  const update = (key: keyof BrokerLeadFilters, value?: string | number) => setFilters(current => ({...current, page: 1, [key]: value || undefined}));
  const loadFilters = useCallback(async () => {
    try {
      const [cityResult, typeResult] = await Promise.all([getMasterData('cities', {limit: 100}), getMasterData('property-types', {limit: 100})]);
      setCities(cityResult.items); setTypes(typeResult.items); setFilterError('');
    } catch (e) { setFilterError(e instanceof Error ? e.message : 'Could not load filters.'); }
  }, []);
  const load = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    setError('');
    try {
      const result = await getBrokerBuyerLeads(filters);
      setItems(result.items); setConfigurationMessage(result.configurationMessage ?? '');
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to load Buyer requirements.'); }
    finally {setLoading(false); setRefreshing(false);}
  }, [filters]);
  useFocusEffect(useCallback(() => {loadFilters(); if(tab==='AVAILABLE') load();}, [tab,load,loadFilters]));
  const selectCity = async (item: MasterRecord) => {
    update('cityId', item.id); update('localityId'); setAreas([]);
    try {setAreas((await getAreasByCity(item.id)).items);} catch {setFilterError('Could not load localities for this city.');}
  };
  const renderLead = ({item}: {item: BrokerBuyerLead}) => <Pressable onPress={() => navigation.navigate(ROUTES.home.brokerBuyerLeadDetail, {requirementId: item.requirementId})} style={styles.card}>
    <View style={styles.cardTop}><View style={styles.typeIcon}><Icon name="home-outline" size={20} color={colors.primary}/></View><View style={styles.cardHeading}><Text style={styles.cardTitle}>{item.propertyType?.name ?? 'Property requirement'}</Text><Text style={styles.meta}>{item.city?.name ?? 'City not specified'} · {item.localities.map(area => area.name).join(', ') || 'Locality not specified'}</Text></View></View>
    <View style={styles.facts}><Fact label="Budget" value={`${money(item.budget.min) ?? '—'} – ${money(item.budget.max) ?? '—'}`}/><Fact label="Area" value={`${item.area.min ?? '—'} – ${item.area.max ?? '—'} ${item.area.unit ?? ''}`.trim()}/>{item.preferences.bhk ? <Fact label="BHK" value={String(item.preferences.bhk)}/> : null}</View>
    <Text style={styles.meta}>{timelineLabel(item.purchaseTimeline)} · {paymentLabel(item.paymentPreference)}</Text>
    {item.nearbyLocalityAccepted ? <Text style={styles.nearby}>Nearby locality acceptable</Text> : null}
    {item.purchase?.isPurchased ? <Text style={styles.purchaseStatus}>Lead Purchased</Text> : item.purchase?.purchaseStatus === 'PENDING' ? <Text style={styles.pendingStatus}>Payment Pending</Text> : item.purchase?.remainingSlots === 0 ? <Text style={styles.pendingStatus}>Sold Out</Text> : item.purchase?.buyerLeadPrice !== null && item.purchase?.buyerLeadPrice !== undefined ? <Text style={styles.purchasePrice}>{item.purchase.currency} {Number(item.purchase.buyerLeadPrice).toLocaleString('en-IN')} · {item.purchase.remainingSlots ?? '—'} slots left</Text> : null}
    <Text style={styles.meta}>Posted {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : 'recently'}</Text>
    <View style={styles.lock}><Icon name="lock-closed-outline" size={14} color={colors.textSecondary}/><Text style={styles.lockText}>Contact details available after lead unlock</Text></View>
  </Pressable>;
  return <View style={styles.page}>
    <View style={styles.header}><Pressable onPress={() => navigation.goBack()}><Icon name="arrow-back" size={24} color={colors.textPrimary}/></Pressable><View><Text style={styles.title}>Leads</Text><Text style={styles.subtitle}>Available requirements and your purchased leads</Text></View></View>
    <View style={styles.tabs}><Tab label="Available" selected={tab==='AVAILABLE'} onPress={()=>setTab('AVAILABLE')}/><Tab label="My Leads" selected={tab==='MY_LEADS'} onPress={()=>setTab('MY_LEADS')}/></View>
    {tab==='AVAILABLE' ? <>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
      <LocationMasterPicker label="City" value={cities.find(item => item.id === filters.cityId)?.name ?? ''} placeholder="Any covered city" items={cities} onSelect={selectCity}/>
      {filters.cityId ? <LocationMasterPicker label="Locality" value={areas.find(item => item.id === filters.localityId)?.name ?? ''} placeholder="Any locality" items={areas} onSelect={item => update('localityId', item.id)}/> : null}
      <LocationMasterPicker label="Property Type" value={types.find(item => item.id === filters.propertyTypeId)?.name ?? ''} placeholder="Any type" items={types} onSelect={item => update('propertyTypeId', item.id)}/>
      <View style={styles.textFilter}><Text style={styles.filterLabel}>Min budget</Text><TextInput keyboardType="numeric" value={filters.budgetMin ?? ''} onChangeText={value => update('budgetMin', value)} placeholder="₹" placeholderTextColor={colors.textSecondary} style={styles.input}/></View>
      <View style={styles.textFilter}><Text style={styles.filterLabel}>Max budget</Text><TextInput keyboardType="numeric" value={filters.budgetMax ?? ''} onChangeText={value => update('budgetMax', value)} placeholder="₹" placeholderTextColor={colors.textSecondary} style={styles.input}/></View>
    </ScrollView>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
      {timelines.map(([key,label]) => <Chip key={key} label={label} selected={filters.purchaseTimeline === key} onPress={() => update('purchaseTimeline', filters.purchaseTimeline === key ? undefined : key)}/>)}
      {payments.map(([key,label]) => <Chip key={key} label={label} selected={filters.paymentPreference === key} onPress={() => update('paymentPreference', filters.paymentPreference === key ? undefined : key)}/>)}
      {['1 BHK','2 BHK','3 BHK','4 BHK','5+ BHK'].map(value => <Chip key={value} label={value} selected={filters.bhk === value} onPress={() => update('bhk', filters.bhk === value ? undefined : value)}/>)}
    </ScrollView>
    {filterError ? <Text style={styles.errorText}>{filterError}</Text> : null}
    {loading ? <View style={styles.state}><ActivityIndicator color={colors.primary}/><Text style={styles.stateText}>Finding Buyer requirements…</Text></View> : error ? <View style={styles.state}><Text style={styles.errorText}>{error}</Text><Pressable onPress={() => load()}><Text style={styles.retry}>Retry</Text></Pressable></View> : configurationMessage ? <View style={styles.state}><Icon name="location-outline" size={32} color={colors.primary}/><Text style={styles.emptyTitle}>Set your service area</Text><Text style={styles.stateText}>{configurationMessage}</Text></View> : <FlatList data={items} keyExtractor={item => item.requirementId} renderItem={renderLead} contentContainerStyle={items.length ? styles.list : styles.emptyList} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={colors.primary}/>} ListEmptyComponent={<View style={styles.state}><Icon name="search-outline" size={32} color={colors.textSecondary}/><Text style={styles.emptyTitle}>No matching Buyer requirements</Text><Text style={styles.stateText}>New published requirements in your service area will appear here.</Text></View>}/>}
    </> : <BrokerMyLeadsPanel navigation={navigation}/>}
  </View>;
}

function Fact({label, value}: {label: string; value: string}) {return <View style={styles.fact}><Text style={styles.factLabel}>{label}</Text><Text style={styles.factValue}>{value}</Text></View>;}
function Chip({label, selected, onPress}: {label: string; selected: boolean; onPress: () => void}) {return <Pressable onPress={onPress} style={[styles.chip, selected && styles.chipSelected]}><Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text></Pressable>;}
function Tab({label,selected,onPress}:{label:string;selected:boolean;onPress:()=>void}){return <Pressable accessibilityRole="tab" accessibilityState={{selected}} onPress={onPress} style={[styles.tab,selected&&styles.tabSelected]}><Text style={[styles.tabText,selected&&styles.tabTextSelected]}>{label}</Text></Pressable>;}

const styles = StyleSheet.create({page:{flex:1,backgroundColor:colors.background},header:{padding:spacing.lg,flexDirection:'row',alignItems:'center',gap:spacing.md,backgroundColor:colors.surface},tabs:{flexDirection:'row',paddingHorizontal:spacing.md,paddingTop:spacing.md,gap:spacing.sm},tab:{flex:1,alignItems:'center',paddingVertical:spacing.sm,borderBottomWidth:2,borderColor:'transparent'},tabSelected:{borderColor:colors.primary},tabText:{fontSize:typography.fontSize.sm,color:colors.textSecondary},tabTextSelected:{color:colors.primary,fontWeight:typography.fontWeight.bold},title:{fontSize:typography.fontSize.lg,fontWeight:typography.fontWeight.bold,color:colors.textPrimary},subtitle:{fontSize:typography.fontSize.xs,color:colors.textSecondary,marginTop:2},filters:{padding:spacing.md,gap:spacing.sm,alignItems:'flex-end'},chips:{paddingHorizontal:spacing.md,paddingBottom:spacing.md,gap:spacing.sm},chip:{borderWidth:1,borderColor:colors.border,borderRadius:20,paddingHorizontal:spacing.md,paddingVertical:8,backgroundColor:colors.surface},chipSelected:{backgroundColor:colors.primarySoft,borderColor:colors.primary},chipText:{fontSize:typography.fontSize.xs,color:colors.textSecondary},chipTextSelected:{color:colors.primary,fontWeight:typography.fontWeight.bold},textFilter:{width:120,gap:4},filterLabel:{fontSize:typography.fontSize.xs,color:colors.textSecondary},input:{height:45,borderWidth:1,borderColor:colors.border,borderRadius:spacing.radiusMd,paddingHorizontal:spacing.sm,color:colors.textPrimary,backgroundColor:colors.surface},list:{padding:spacing.md,paddingTop:0,gap:spacing.md},card:{backgroundColor:colors.surface,borderColor:colors.border,borderWidth:1,borderRadius:spacing.radiusLg,padding:spacing.md,gap:spacing.md},cardTop:{flexDirection:'row',gap:spacing.md,alignItems:'center'},typeIcon:{width:42,height:42,borderRadius:14,backgroundColor:colors.primarySoft,alignItems:'center',justifyContent:'center'},cardHeading:{flex:1,gap:4},cardTitle:{fontSize:typography.fontSize.md,fontWeight:typography.fontWeight.bold,color:colors.textPrimary},meta:{fontSize:typography.fontSize.xs,color:colors.textSecondary},facts:{flexDirection:'row',gap:spacing.xl},fact:{gap:3},factLabel:{fontSize:typography.fontSize.xs,color:colors.textSecondary},factValue:{fontSize:typography.fontSize.sm,fontWeight:typography.fontWeight.semiBold,color:colors.textPrimary},nearby:{fontSize:typography.fontSize.xs,color:colors.info},purchasePrice:{fontSize:typography.fontSize.sm,fontWeight:typography.fontWeight.bold,color:colors.primary},purchaseStatus:{fontSize:typography.fontSize.sm,fontWeight:typography.fontWeight.bold,color:colors.success},pendingStatus:{fontSize:typography.fontSize.sm,fontWeight:typography.fontWeight.bold,color:colors.warning},lock:{flexDirection:'row',alignItems:'center',gap:6,borderTopWidth:1,borderColor:colors.border,paddingTop:spacing.sm},lockText:{fontSize:typography.fontSize.xs,color:colors.textSecondary},emptyList:{flexGrow:1,justifyContent:'center',padding:spacing.xl},state:{flex:1,alignItems:'center',justifyContent:'center',padding:spacing.xl,gap:spacing.md},emptyTitle:{fontSize:typography.fontSize.md,fontWeight:typography.fontWeight.bold,color:colors.textPrimary},stateText:{textAlign:'center',color:colors.textSecondary,fontSize:typography.fontSize.sm},errorText:{color:colors.error,textAlign:'center',padding:spacing.sm},retry:{color:colors.primary,fontWeight:typography.fontWeight.bold},filterError:{color:colors.error}});
