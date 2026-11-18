import React, {useCallback, useState} from 'react';
import {ActivityIndicator, Pressable, StyleSheet, Text, View} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ROUTES} from '@/constants/routes';
import {listBuilderQuotationRevisions, prepareBuilderQuotationRevision, type BuilderQuotationRevision} from '@/services/constructionJourneyApi';
import type {ConstructionRequirementStackParamList} from '@/types';
import {FlowPage, flow} from './FlowUI';
import {dateLabel, QuoteAction, QuoteCard} from './customerQuotationUi';
type Props = NativeStackScreenProps<ConstructionRequirementStackParamList, 'BuilderQuotationRevisions'>;
export function BuilderQuotationRevisionsScreen({navigation}: Props) {
  const [items, setItems] = useState<BuilderQuotationRevision[]>([]); const [loading, setLoading] = useState(true); const [busy, setBusy] = useState(''); const [error, setError] = useState('');
  const load = useCallback(async () => {setLoading(true); setError(''); try {setItems(await listBuilderQuotationRevisions());} catch (reason) {setError(reason instanceof Error ? reason.message : 'Unable to load revision requests.');} finally {setLoading(false);}}, []);
  useFocusEffect(useCallback(() => {void load();}, [load]));
  const prepare = async (item: BuilderQuotationRevision) => {if (!item.invitationId) return; setBusy(item.id); setError(''); try {await prepareBuilderQuotationRevision(item.invitationId, item.id); navigation.navigate(ROUTES.constructionRequirement.builderQuotation, {invitationId: item.invitationId, revisionId: item.id});} catch (reason) {setError(reason instanceof Error ? reason.message : 'Unable to prepare the revised quote.');} finally {setBusy('');}};
  return <FlowPage title="Revision Requests" onBack={navigation.goBack}>{loading ? <View style={styles.state}><ActivityIndicator color={flow.blue}/></View> : error && !items.length ? <View style={styles.state}><Text style={styles.error}>{error}</Text><QuoteAction label="Retry" onPress={load}/></View> : items.length === 0 ? <QuoteCard title="No open revision requests"><Text style={styles.body}>Customer revision requests for your quotations will appear here.</Text></QuoteCard> : <>{error ? <Text style={styles.error}>{error}</Text> : null}{items.map(item => <QuoteCard key={item.id} title={item.request.requestNo}><Text style={styles.meta}>{item.quoteNo} · Current V{item.currentVersion ?? '—'}</Text><Text style={styles.body}>{item.message}</Text>{item.categories?.length ? <Text style={styles.meta}>Requested areas: {item.categories.join(', ').replace(/_/g, ' ')}</Text> : null}<Text style={styles.meta}>Requested {dateLabel(item.createdAt)}</Text><Pressable disabled={busy === item.id} style={[styles.button, busy === item.id && styles.disabled]} onPress={() => void prepare(item)}><Text style={styles.buttonText}>{busy === item.id ? 'Preparing…' : `Prepare V${(item.currentVersion ?? 1) + 1}`}</Text></Pressable></QuoteCard>)}</>}</FlowPage>;
}
const styles = StyleSheet.create({state: {minHeight: 160, alignItems: 'center', justifyContent: 'center', gap: 10}, error: {fontSize: 12, color: flow.red}, body: {fontSize: 12, lineHeight: 18, color: flow.ink}, meta: {fontSize: 10, color: flow.muted, lineHeight: 16}, button: {minHeight: 42, borderRadius: 7, backgroundColor: flow.blue, alignItems: 'center', justifyContent: 'center', marginTop: 4}, disabled: {opacity: 0.5}, buttonText: {fontSize: 11, color: flow.surface, fontWeight: '800'}});
