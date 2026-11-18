import React, {useCallback, useEffect, useRef, useState} from 'react';
import {ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ROUTES} from '@/constants/routes';
import {listEligibleConstructionBuilders} from '@/services/constructionJourneyApi';
import {useConstructionJourneyStore} from '@/store/constructionJourneyStore';
import type {ConstructionRequirementStackParamList} from '@/types';
import {FlowPage, flow} from './FlowUI';

type Props = NativeStackScreenProps<ConstructionRequirementStackParamList, 'MatchingBuilders'>;
export function MatchingBuildersScreen({navigation}: Props) {
  const journey = useConstructionJourneyStore();
  const [builders, setBuilders] = useState<Awaited<ReturnType<typeof listEligibleConstructionBuilders>>['items']>([]);
  const [selected, setSelected] = useState(journey.selectedBuilders.map(item => item.id));
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const requestSequence = useRef(0);
  const load = useCallback(async () => {
    const requestId = ++requestSequence.current;
    const cityId = normalizePositiveId(journey.locationCityId);
    const areaId = normalizePositiveId(journey.locationAreaId);
    if (__DEV__) console.info('[MATCHING_BUILDERS_LOCATION]', {stateId: journey.locationStateId, cityId, areaId, stateName: journey.locationState, cityName: journey.locationCity, areaName: journey.locationArea});
    if (cityId === undefined || areaId === undefined) {
      setError('Plot City or Locality is missing. Go back to Plot Details and select them again.'); setLoading(false); setBuilders([]); return;
    }
    setLoading(true); setError('');
    if (__DEV__) console.info('[MATCHING_BUILDERS_API]', {cityId, areaId});
    try {const result = await listEligibleConstructionBuilders({cityId, areaId, search}); if (requestSequence.current === requestId) setBuilders(result.items);}
    catch {if (requestSequence.current === requestId) setError('Unable to load builders right now. Please try again.');}
    finally {if (requestSequence.current === requestId) setLoading(false);}
  }, [journey.locationAreaId, journey.locationCityId, journey.locationArea, journey.locationCity, journey.locationStateId, journey.locationState, search]);
  useEffect(() => {load();}, [load]);
  const toggle = (builder: (typeof builders)[number]) => setSelected(items => {
    const nextIds = items.includes(builder.id) ? items.filter(item => item !== builder.id) : [...items, builder.id];
    const known = [...journey.selectedBuilders, ...builders].filter((item, index, all) => all.findIndex(candidate => candidate.id === item.id) === index);
    journey.setSelectedBuilders(known.filter(item => nextIds.includes(item.id)));
    return nextIds;
  });
  const next = () => {const known = [...journey.selectedBuilders, ...builders].filter((item, index, all) => all.findIndex(candidate => candidate.id === item.id) === index); journey.setSelectedBuilders(known.filter(builder => selected.includes(builder.id))); navigation.navigate(ROUTES.constructionRequirement.reviewRfq);};
  const cityName = journey.locationCity.trim();
  const areaName = journey.locationArea.trim();
  return <FlowPage title="Matching Builders" onBack={navigation.goBack} primary={{label: selected.length ? `Continue with ${selected.length} Builder${selected.length === 1 ? '' : 's'}` : 'Select Builders', disabled: !selected.length, onPress: next}}>
    <Text style={styles.heading}>{areaName ? `Builders serving ${areaName}` : 'Matching Builders'}</Text>
    <Text style={styles.sub}>{cityName ? `Select verified, active builders in ${cityName}. Locality matches are shown first.` : 'Select verified, active Builders for this plot. Locality matches are shown first.'}</Text>
    <View style={styles.search}><Icon name="search" size={18} color={flow.muted}/><TextInput value={search} onChangeText={setSearch} onSubmitEditing={load} placeholder="Search builder" placeholderTextColor={flow.muted} style={styles.searchInput}/></View>
    <View style={styles.count}><Text style={styles.countText}>{selected.length} Builder{selected.length === 1 ? '' : 's'} Selected</Text></View>
    {loading ? <View style={styles.state}><ActivityIndicator color={flow.blue}/><Text style={styles.sub}>Finding eligible builders…</Text></View> : error ? <View style={styles.state}><Text style={styles.error}>{error}</Text><Pressable onPress={load} style={styles.retry}><Text style={styles.retryText}>Retry</Text></Pressable></View> : !builders.length ? <View style={styles.state}><Icon name="people-outline" color={flow.muted} size={36}/><Text style={styles.emptyTitle}>No builders available for this location yet.</Text><Text style={styles.sub}>You can go back and change the plot location or try again later.</Text></View> : <View style={styles.list}>{builders.map((builder, index) => {
      const isSelected = selected.includes(builder.id);
      const localityMatch = builder.matchLevel === 'LOCALITY_MATCH';
      const showCityGroup = !localityMatch && (index === 0 || builders[index - 1].matchLevel === 'LOCALITY_MATCH');
      return <React.Fragment key={builder.id}>
        {showCityGroup ? <Text style={styles.groupTitle}>Other builders in {cityName || 'your city'}</Text> : null}
        <View style={[styles.card, isSelected && styles.selected]}>
          <Pressable accessibilityLabel={`${isSelected ? 'Deselect' : 'Select'} ${builder.name}`} onPress={() => toggle(builder)} style={[styles.checkbox, isSelected && styles.checkboxOn]}>{isSelected ? <Icon name="checkmark" size={15} color={flow.surface}/> : null}</Pressable>
          <View style={styles.cardBody}><View style={styles.nameRow}><Text style={styles.name}>{builder.name}</Text><View style={[styles.matchBadge, localityMatch ? styles.localityBadge : styles.cityBadge]}><Text style={[styles.badgeText, localityMatch && styles.localityBadgeText]}>{localityMatch ? 'Serves your locality' : `Serves ${cityName || 'your city'}`}</Text></View>{builder.isVerified ? <View style={styles.verifiedBadge}><Icon name="checkmark-circle" size={13} color={flow.blue}/><Text style={styles.verifiedText}>Verified</Text></View> : null}</View>
            {builder.experienceYears !== null && builder.experienceYears !== undefined ? <Text style={styles.meta}>{builder.experienceYears} years experience</Text> : null}
            {builder.minPrice ? <Text style={styles.meta}>Starting rate: ₹{Number(builder.minPrice).toLocaleString('en-IN')} / sq.ft.</Text> : null}
            <View style={styles.cardActions}><Pressable onPress={() => navigation.navigate(ROUTES.constructionRequirement.builderProfile, {builderId: builder.id, cityId: Number(journey.locationCityId), areaId: Number(journey.locationAreaId)})} style={styles.profileButton}><Text style={styles.profileText}>View Profile</Text></Pressable><Pressable onPress={() => toggle(builder)} style={[styles.selectButton, isSelected && styles.selectButtonOn]}><Text style={[styles.selectText, isSelected && styles.selectTextOn]}>{isSelected ? 'Selected' : 'Select Builder'}</Text></Pressable></View>
          </View>
        </View>
      </React.Fragment>;
    })}</View>}
  </FlowPage>;
}
function normalizePositiveId(value: unknown): number | undefined {
  const normalized = typeof value === 'number' ? value : typeof value === 'string' && value.trim() ? Number(value) : Number.NaN;
  return Number.isSafeInteger(normalized) && normalized > 0 ? normalized : undefined;
}
const styles = StyleSheet.create({heading: {fontSize: 16, color: flow.ink, fontWeight: '800'}, sub: {fontSize: 11, lineHeight: 17, color: flow.muted}, search: {height: 45, paddingHorizontal: 11, flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: flow.line, borderRadius: 7, backgroundColor: flow.surface}, searchInput: {flex: 1, color: flow.ink, fontSize: 12}, count: {paddingVertical: 9, paddingHorizontal: 11, borderRadius: 7, backgroundColor: flow.blueSoft}, countText: {fontSize: 12, color: flow.blue, fontWeight: '800'}, state: {minHeight: 170, padding: 22, alignItems: 'center', justifyContent: 'center', gap: 10, borderWidth: 1, borderColor: flow.line, borderRadius: 8, backgroundColor: flow.surface}, emptyTitle: {fontSize: 14, fontWeight: '800', color: flow.ink, textAlign: 'center'}, error: {fontSize: 12, color: flow.red, textAlign: 'center'}, retry: {paddingVertical: 8, paddingHorizontal: 16, borderRadius: 6, backgroundColor: flow.blue}, retryText: {fontSize: 12, color: flow.surface, fontWeight: '700'}, list: {gap: 9}, groupTitle: {marginTop: 7, fontSize: 12, fontWeight: '800', color: flow.muted}, card: {padding: 12, flexDirection: 'row', gap: 10, borderWidth: 1, borderColor: flow.line, borderRadius: 8, backgroundColor: flow.surface}, selected: {borderColor: flow.blue, backgroundColor: flow.blueSoft}, checkbox: {width: 22, height: 22, marginTop: 1, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: flow.muted, borderRadius: 5, backgroundColor: flow.surface}, checkboxOn: {borderColor: flow.blue, backgroundColor: flow.blue}, cardBody: {flex: 1, gap: 4}, nameRow: {flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 7}, name: {fontSize: 14, color: flow.ink, fontWeight: '800'}, matchBadge: {paddingHorizontal: 6, paddingVertical: 3, borderRadius: 10}, localityBadge: {backgroundColor: flow.blueSoft}, cityBadge: {backgroundColor: '#F1F3F6'}, localityBadgeText: {color: flow.blue}, badgeText: {fontSize: 10, color: flow.muted, fontWeight: '700'}, verifiedBadge: {flexDirection: 'row', alignItems: 'center', gap: 3}, verifiedText: {fontSize: 10, color: flow.blue, fontWeight: '700'}, meta: {fontSize: 11, color: flow.muted}, cardActions: {marginTop: 6, flexDirection: 'row', flexWrap: 'wrap', gap: 7}, profileButton: {minHeight: 36, flex: 1, minWidth: 100, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: flow.blue, borderRadius: 7}, profileText: {fontSize: 10, fontWeight: '800', color: flow.blue}, selectButton: {minHeight: 36, flex: 1, minWidth: 100, alignItems: 'center', justifyContent: 'center', borderRadius: 7, backgroundColor: flow.blueSoft}, selectButtonOn: {backgroundColor: flow.blue}, selectText: {fontSize: 10, fontWeight: '800', color: flow.blue}, selectTextOn: {color: flow.surface}});
