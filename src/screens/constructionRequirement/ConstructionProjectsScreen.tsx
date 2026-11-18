import React, {useCallback, useState} from 'react';
import {ActivityIndicator, Pressable, StyleSheet, Text, View} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ROUTES} from '@/constants/routes';
import {listBuilderConstructionProjects, listCustomerConstructionProjects, type ConstructionProject} from '@/services/constructionJourneyApi';
import type {ConstructionRequirementStackParamList} from '@/types';
import {FlowPage, FlowState, flow} from './FlowUI';

type Props = NativeStackScreenProps<ConstructionRequirementStackParamList, 'ConstructionProjects'>;

export function ConstructionProjectsScreen({navigation, route}: Props) {
  const [items, setItems] = useState<ConstructionProject[]>([]);
  const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const actor = route.params.actor;
  const load = useCallback(async () => {setLoading(true); setError(''); try {setItems(await (actor === 'builder' ? listBuilderConstructionProjects() : listCustomerConstructionProjects()));} catch (reason) {setError(reason instanceof Error ? reason.message : 'Unable to load projects.');} finally {setLoading(false);}}, [actor]);
  useFocusEffect(useCallback(() => {void load();}, [load]));
  return <FlowPage title={actor === 'builder' ? 'Builder Projects' : 'My Construction Projects'} onBack={navigation.goBack}>
    {loading ? <View style={styles.state}><ActivityIndicator color={flow.blue}/></View> : null}
    {!loading && error ? <View style={styles.state}><Text style={styles.error}>{error}</Text><Pressable onPress={load}><Text style={styles.retry}>Retry</Text></Pressable></View> : null}
    {!loading && !error && !items.length ? <FlowState icon="documents-outline" title="No projects yet" message="A project appears after a customer finalizes a Builder quotation and initializes the agreement."/> : null}
    {!loading && !error ? items.map(item => {const location = item.requirement?.plot?.location; return <Pressable key={item.id} onPress={() => navigation.navigate(ROUTES.constructionRequirement.constructionProjectDetail, {projectId: item.id, actor})} style={styles.card}>
      <View style={styles.row}><Text style={styles.number}>{item.projectNo}</Text><Text style={styles.status}>{item.status.replace(/_/g, ' ')}</Text></View>
      <Text style={styles.title}>{actor === 'builder' ? item.customer?.name || 'Customer' : item.builder?.name || 'Builder'}</Text>
      <Text style={styles.meta}>{[location?.area, location?.city].filter(Boolean).join(', ') || 'Site location unavailable'}</Text>
      <Text style={styles.amount}>{money(item.agreement?.amount)}</Text>
      <Text style={styles.meta}>Agreement: {item.agreement?.status.replace(/_/g, ' ') || 'Pending'}</Text>
    </Pressable>;}) : null}
  </FlowPage>;
}

const money = (value?: string | null) => value == null ? 'Amount unavailable' : `₹${Number(value).toLocaleString('en-IN', {maximumFractionDigits: 2})}`;
const styles = StyleSheet.create({state: {minHeight: 180, alignItems: 'center', justifyContent: 'center', gap: 12}, error: {color: flow.red, textAlign: 'center'}, retry: {color: flow.blue, fontWeight: '800'}, card: {gap: 6, borderWidth: 1, borderColor: flow.line, borderRadius: 12, backgroundColor: flow.surface, padding: 15}, row: {flexDirection: 'row', justifyContent: 'space-between', gap: 10}, number: {fontSize: 12, color: flow.blue, fontWeight: '800'}, status: {fontSize: 9, color: flow.green, fontWeight: '900'}, title: {fontSize: 16, color: flow.ink, fontWeight: '800'}, meta: {fontSize: 11, color: flow.muted}, amount: {fontSize: 18, color: flow.ink, fontWeight: '900'}});

