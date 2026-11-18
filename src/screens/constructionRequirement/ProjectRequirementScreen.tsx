import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {BottomSheet} from '@/components';
import {ROUTES} from '@/constants/routes';
import {getAreasByCity, getCitiesByState, getStates} from '@/services/locationApi';
import type {MasterRecord} from '@/services/masterApi';
import {useConstructionJourneyStore} from '@/store/constructionJourneyStore';
import type {ConstructionRequirementStackParamList} from '@/types';
import {FlowPage, FlowSection, flow} from './FlowUI';

type Props = NativeStackScreenProps<ConstructionRequirementStackParamList, 'ProjectRequirement'>;
type PickerKind = 'state' | 'city' | 'area';
const directions = ['North', 'South', 'East', 'West', 'North-East', 'North-West', 'South-East', 'South-West'];

export function ProjectRequirementScreen({navigation}: Props) {
  const journey = useConstructionJourneyStore();
  const [width, setWidth] = useState(String(journey.plotWidthFt || ''));
  const [length, setLength] = useState(String(journey.plotLengthFt || ''));
  const [facing, setFacing] = useState(journey.facing);
  const [corner, setCorner] = useState<boolean | null>(journey.isCornerPlot ? true : null);
  const [location, setLocation] = useState({state: journey.locationState, stateId: journey.locationStateId, city: journey.locationCity, cityId: journey.locationCityId, area: journey.locationArea, areaId: journey.locationAreaId, address: journey.locationAddress, landmark: journey.locationLandmark});
  const [states, setStates] = useState<MasterRecord[]>([]);
  const [cities, setCities] = useState<MasterRecord[]>([]);
  const [areas, setAreas] = useState<MasterRecord[]>([]);
  const [picker, setPicker] = useState<PickerKind | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const plotArea = (Number(width) || 0) * (Number(length) || 0);
  const selectedState = useMemo(() => states.find(item => item.id === location.stateId), [states, location.stateId]);
  const selectedCity = useMemo(() => cities.find(item => item.id === location.cityId), [cities, location.cityId]);
  const loadStates = useCallback(async () => { setLoading(true); try { setStates((await getStates()).items); } catch { setError('Unable to load locations. Please try again.'); } finally { setLoading(false); } }, []);
  useEffect(() => { loadStates(); }, [loadStates]);
  useEffect(() => {
    let active = true;
    if (!selectedState) { setCities([]); return () => { active = false; }; }
    setCities([]);
    getCitiesByState(selectedState.id).then(result => { if (active) setCities(result.items); }).catch(() => { if (active) setError('Unable to load cities.'); });
    return () => { active = false; };
  }, [selectedState]);
  useEffect(() => {
    let active = true;
    if (!selectedCity) { setAreas([]); return () => { active = false; }; }
    setAreas([]);
    getAreasByCity(selectedCity.id).then(result => { if (active) setAreas(result.items); }).catch(() => { if (active) setError('Unable to load localities.'); });
    return () => { active = false; };
  }, [selectedCity]);
  const openPicker = (kind: PickerKind) => { if (kind === 'city' && !selectedState) { setError('Select a state first.'); return; } if (kind === 'area' && !selectedCity) { setError('Select a city first.'); return; } setPicker(kind); };
  const selectLocation = (item: MasterRecord) => { if (picker === 'state') setLocation(current => ({...current, state: item.name, stateId: item.id, city: '', cityId: undefined, area: '', areaId: undefined})); if (picker === 'city') setLocation(current => ({...current, city: item.name, cityId: item.id, area: '', areaId: undefined})); if (picker === 'area') setLocation(current => ({...current, area: item.name, areaId: item.id})); setPicker(null); setError(''); };
  const next = () => { const parsedWidth = Number(width); const parsedLength = Number(length); if (!parsedWidth || !parsedLength || parsedWidth <= 0 || parsedLength <= 0) return setError('Enter valid plot width and length.'); if (!location.state || !isPositiveMasterId(location.stateId) || !location.city || !isPositiveMasterId(location.cityId) || !location.area || !isPositiveMasterId(location.areaId) || !location.address.trim()) return setError('Select State, City and Locality, then enter the plot address.'); if (!states.some(item => item.id === location.stateId) || !cities.some(item => item.id === location.cityId) || !areas.some(item => item.id === location.areaId)) return setError('Your plot location is out of date. Select the State, City and Locality again.'); if (!facing || corner === null) return setError('Select the plot facing and corner-plot status.'); journey.setPropertyDetails({hasPlot: true, plotWidthFt: parsedWidth, plotLengthFt: parsedLength, facing, isCornerPlot: corner, location: [location.area, location.city].filter(Boolean).join(', ')}); journey.setPlotLocation(location); const committed = useConstructionJourneyStore.getState(); if (__DEV__) console.info('[PLOT_LOCATION_COMMIT]', {stateId: committed.locationStateId, cityId: committed.locationCityId, areaId: committed.locationAreaId, stateName: committed.locationState, cityName: committed.locationCity, areaName: committed.locationArea}); navigation.navigate(ROUTES.constructionRequirement.homeRequirement); };
  const options = picker === 'state' ? states : picker === 'city' ? cities : areas;
  return <FlowPage title="Plot Details" step={1} totalSteps={6} onBack={navigation.goBack} primary={{label: 'Continue', onPress: next}}>
    <FlowSection title="Plot Dimensions"><View style={styles.dimensions}><NumberInput label="Plot Width" value={width} onChangeText={setWidth} /><Text style={styles.times}>×</Text><NumberInput label="Plot Length" value={length} onChangeText={setLength} /></View><View style={styles.area}><Text style={styles.areaLabel}>Plot Area (read only)</Text><Text style={styles.areaValue}>{plotArea > 0 ? `${plotArea.toLocaleString('en-IN')} sq.ft.` : 'Enter dimensions'}</Text></View></FlowSection>
    <FlowSection title="Plot Location"><Select label="State" value={location.state} onPress={() => openPicker('state')} /><Select label="City" value={location.city} onPress={() => openPicker('city')} /><Select label="Area / Locality" value={location.area} onPress={() => openPicker('area')} /><TextInput value={location.address} onChangeText={address => setLocation(value => ({...value, address}))} placeholder="Full address" placeholderTextColor={flow.muted} style={styles.input} /><TextInput value={location.landmark} onChangeText={landmark => setLocation(value => ({...value, landmark}))} placeholder="Landmark (optional)" placeholderTextColor={flow.muted} style={styles.input} /></FlowSection>
    <FlowSection title="Facing Direction"><View style={styles.chips}>{directions.map(direction => <Choice key={direction} label={direction} selected={facing === direction} onPress={() => setFacing(direction)} />)}</View></FlowSection>
    <FlowSection title="Is this a Corner Plot?"><View style={styles.chips}><Choice label="No — Standard Plot" selected={corner === false} onPress={() => setCorner(false)} /><Choice label="Yes — Corner Plot" selected={corner === true} onPress={() => setCorner(true)} /></View><Text style={styles.hint}>Corner-plot status only makes side-balcony options available; it does not add a balcony.</Text></FlowSection>
    {error ? <Text style={styles.error}>{error}</Text> : null}
    <BottomSheet visible={Boolean(picker)} onClose={() => setPicker(null)}><Text style={styles.sheetTitle}>Select {picker === 'area' ? 'Locality' : picker}</Text>{loading ? <ActivityIndicator color={flow.blue} /> : <FlatList data={options} keyExtractor={item => String(item.id)} style={styles.list} renderItem={({item}) => <Pressable style={styles.row} onPress={() => selectLocation(item)}><Text style={styles.rowText}>{item.name}</Text><Icon name="chevron-forward" color={flow.muted} size={18} /></Pressable>} ListEmptyComponent={<Text style={styles.hint}>No options available.</Text>} />}</BottomSheet>
  </FlowPage>;
}
function NumberInput({label, value, onChangeText}: {label: string; value: string; onChangeText: (value: string) => void}) { return <View style={styles.dimensionField}><Text style={styles.dimensionLabel}>{label}</Text><TextInput value={value} onChangeText={nextValue => onChangeText(nextValue.replace(/[^0-9.]/g, ''))} keyboardType="decimal-pad" placeholder="0" placeholderTextColor={flow.muted} style={styles.input} /><Text style={styles.unit}>ft</Text></View>; }
function isPositiveMasterId(value: unknown): value is number { return typeof value === 'number' && Number.isSafeInteger(value) && value > 0; }
function Select({label, value, onPress}: {label: string; value: string; onPress: () => void}) { return <Pressable onPress={onPress} style={styles.select}><Text style={value ? styles.selectValue : styles.selectPlaceholder}>{value || `Select ${label}`}</Text><Icon name="chevron-down" color={flow.muted} size={18} /></Pressable>; }
function Choice({label, selected, onPress}: {label: string; selected: boolean; onPress: () => void}) { return <Pressable onPress={onPress} style={[styles.choice, selected && styles.selected]}><Text style={[styles.choiceText, selected && styles.selectedText]}>{label}</Text></Pressable>; }
const styles = StyleSheet.create({dimensions: {flexDirection: 'row', alignItems: 'flex-end', gap: 8}, dimensionField: {flex: 1, gap: 5}, dimensionLabel: {fontSize: 11, color: flow.muted}, times: {paddingBottom: 12, color: flow.muted, fontSize: 18}, input: {height: 46, borderRadius: 7, borderWidth: 1, borderColor: flow.line, paddingHorizontal: 11, color: flow.ink, backgroundColor: flow.surface}, unit: {position: 'absolute', right: 10, bottom: 14, fontSize: 11, color: flow.muted}, area: {padding: 12, borderRadius: 7, backgroundColor: flow.blueSoft, gap: 3}, areaLabel: {fontSize: 11, color: flow.muted}, areaValue: {fontSize: 17, fontWeight: '800', color: flow.blue}, select: {height: 46, borderRadius: 7, borderWidth: 1, borderColor: flow.line, paddingHorizontal: 11, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: flow.surface}, selectValue: {fontSize: 12, color: flow.ink}, selectPlaceholder: {fontSize: 12, color: flow.muted}, chips: {flexDirection: 'row', flexWrap: 'wrap', gap: 8}, choice: {minHeight: 40, paddingHorizontal: 11, justifyContent: 'center', borderRadius: 7, borderWidth: 1, borderColor: flow.line, backgroundColor: flow.surface}, selected: {borderColor: flow.blue, backgroundColor: flow.blueSoft}, choiceText: {fontSize: 11, color: flow.ink}, selectedText: {color: flow.blue, fontWeight: '700'}, hint: {fontSize: 11, lineHeight: 16, color: flow.muted}, error: {fontSize: 12, color: flow.red}, sheetTitle: {fontSize: 16, fontWeight: '700', color: flow.ink, marginBottom: 8, textTransform: 'capitalize'}, list: {maxHeight: 350}, row: {minHeight: 47, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: flow.line}, rowText: {fontSize: 13, color: flow.ink}});
