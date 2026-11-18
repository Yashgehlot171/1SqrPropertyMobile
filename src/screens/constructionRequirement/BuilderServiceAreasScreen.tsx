import React, {useCallback, useState} from 'react';
import {ActivityIndicator, Pressable, StyleSheet, Text, View} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import {getAreasByCity} from '@/services/locationApi';
import {getMyBuilderServiceAreas, updateMyBuilderServiceAreas} from '@/services/builderServiceAreaApi';
import type {MasterRecord} from '@/services/masterApi';
import type {ConstructionRequirementStackParamList} from '@/types';
import {FlowPage, flow} from './FlowUI';

type Props = NativeStackScreenProps<ConstructionRequirementStackParamList, 'BuilderServiceAreas'>;
export function BuilderServiceAreasScreen({navigation}: Props) {
  const [areas, setAreas] = useState<MasterRecord[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [cityName, setCityName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const load = useCallback(async () => {
    setLoading(true); setError(''); setMessage('');
    try {
      const profile = await getMyBuilderServiceAreas();
      const locationAreas = await getAreasByCity(profile.cityId);
      setAreas(locationAreas.items);
      setSelected(profile.serviceAreas.map(area => area.id));
      setCityName(profile.cityName);
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to load Builder service areas.'); }
    finally { setLoading(false); }
  }, []);
  useFocusEffect(useCallback(() => {load();}, [load]));
  const toggle = (id: number) => setSelected(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id]);
  const save = async () => {
    setSaving(true); setError(''); setMessage('');
    try {const result = await updateMyBuilderServiceAreas(selected); setSelected(result.serviceAreas.map(area => area.id)); setMessage('Service areas saved.');}
    catch (reason) {setError(reason instanceof Error ? reason.message : 'Unable to save service areas.');}
    finally {setSaving(false);}
  };
  return <FlowPage title="Builder Service Areas" onBack={navigation.goBack} primary={{label: saving ? 'Saving…' : 'Save Service Areas', disabled: loading || saving, onPress: save}}>
    <Text style={styles.heading}>Choose the localities you serve</Text>
    <Text style={styles.city}>City: {cityName || 'Loading'}</Text>
    <Text style={styles.copy}>Service coverage is limited to your registered city. Builders outside a customer’s locality can still appear for the same city.</Text>
    {loading ? <View style={styles.state}><ActivityIndicator color={flow.blue}/><Text style={styles.copy}>Loading locations…</Text></View> : error ? <View style={styles.state}><Text style={styles.error}>{error}</Text><Pressable onPress={load}><Text style={styles.link}>Try again</Text></Pressable></View> : !areas.length ? <View style={styles.state}><Text style={styles.copy}>No active localities are available for your registered city.</Text></View> : <View style={styles.list}>{areas.map(area => {const checked = selected.includes(area.id); return <Pressable key={area.id} onPress={() => toggle(area.id)} style={styles.row}><View style={[styles.checkbox, checked && styles.checkboxSelected]}>{checked ? <Icon name="checkmark" size={15} color={flow.surface}/> : null}</View><Text style={styles.areaName}>{area.name}</Text></Pressable>;})}</View>}
    {message ? <Text style={styles.success}>{message}</Text> : null}
  </FlowPage>;
}
const styles = StyleSheet.create({heading: {fontSize: 17, fontWeight: '800', color: flow.ink}, city: {fontSize: 13, fontWeight: '700', color: flow.blue}, copy: {fontSize: 12, lineHeight: 18, color: flow.muted}, state: {minHeight: 180, alignItems: 'center', justifyContent: 'center', gap: 12}, list: {borderWidth: 1, borderColor: flow.line, borderRadius: 10, overflow: 'hidden', backgroundColor: flow.surface}, row: {minHeight: 50, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', gap: 11, borderBottomWidth: 1, borderBottomColor: flow.line}, checkbox: {width: 22, height: 22, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: flow.muted, borderRadius: 5}, checkboxSelected: {borderColor: flow.blue, backgroundColor: flow.blue}, areaName: {flex: 1, fontSize: 13, color: flow.ink}, error: {fontSize: 12, textAlign: 'center', color: flow.red}, link: {fontSize: 12, color: flow.blue, fontWeight: '800'}, success: {fontSize: 12, color: '#087A3D', fontWeight: '700'}});
