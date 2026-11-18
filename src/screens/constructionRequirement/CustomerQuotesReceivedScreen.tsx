import React, {useCallback, useEffect, useState} from 'react';
import {ActivityIndicator, Pressable, StyleSheet, Text, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {ConstructionRequirementStackParamList} from '@/types';
import {listCustomerQuotations, type CustomerQuotationSummary} from '@/services/constructionJourneyApi';
import {FlowPage, flow} from './FlowUI';
import {area, dateLabel, money, QuoteAction, QuoteCard} from './customerQuotationUi';
type Props = NativeStackScreenProps<ConstructionRequirementStackParamList, 'CustomerQuotesReceived'>;
export function CustomerQuotesReceivedScreen({navigation, route}: Props) {
  const [quotes, setQuotes] = useState<CustomerQuotationSummary[]>([]); const [selected, setSelected] = useState<string[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const load = useCallback(async () => {setLoading(true); setError(''); try {setQuotes(await listCustomerQuotations(route.params.rfqId));} catch {setError('Unable to load quotations. Please try again.');} finally {setLoading(false);}}, [route.params.rfqId]);
  useEffect(() => {load();}, [load]);
  const toggle = (id: string) => setSelected(current => current.includes(id) ? current.filter(value => value !== id) : current.length < 3 ? [...current, id] : current);
  return <FlowPage title="Quotes Received" onBack={navigation.goBack} primary={selected.length >= 2 ? {label: `Compare ${selected.length} Quotes`, onPress: () => navigation.navigate('CompareCustomerQuotations', {rfqId: route.params.rfqId, quoteIds: selected})} : undefined}>
    {loading ? <View style={styles.state}><ActivityIndicator color={flow.blue}/></View> : error ? <View style={styles.state}><Text style={styles.error}>{error}</Text><QuoteAction label="Retry" onPress={load}/></View> : quotes.length === 0 ? <QuoteCard title="No quotations received yet."><Text style={styles.body}>Invited Builders may still be reviewing the requirement.</Text></QuoteCard> : <>
      <Text style={styles.count}>{quotes.length} {quotes.length === 1 ? 'quotation' : 'quotations'} received · Select 2–3 to compare</Text>
      {quotes.map(quote => <QuoteCard key={quote.id} title={quote.builder.name}><Text style={styles.sub}>{quote.selectionStatus === 'SELECTED' ? 'Selected quote' : quote.selectionStatus === 'NOT_SELECTED' ? 'Not Selected' : ''}</Text><Text style={styles.sub}>{quote.quoteNo} · V{quote.version} · {quote.plan.name} (Plan V{quote.plan.version})</Text><Text style={styles.amount}>{money(quote.amount)}</Text><Text style={styles.sub}>{area(quote.commercial.billableAreaSqFt)} · {quote.commercial.pricingBasis === 'PER_SQ_FT' ? `₹${Number(quote.commercial.ratePerSqFt).toLocaleString('en-IN')} / sq.ft.` : 'Fixed pricing'}</Text><Text style={styles.sub}>Submitted {dateLabel(quote.submittedAt)} · {timeline(quote.commercial.timeline)}</Text><View style={styles.actions}><Pressable style={styles.link} onPress={() => navigation.navigate('CustomerQuotationDetail', {rfqId: route.params.rfqId, quoteId: quote.id})}><Text style={styles.linkText}>View Quote</Text></Pressable><Pressable onPress={() => toggle(quote.id)}><Text style={[styles.linkText, selected.includes(quote.id) && styles.chosen]}>{selected.includes(quote.id) ? 'Selected ✓' : 'Select to Compare'}</Text></Pressable></View></QuoteCard>)}
    </>}
  </FlowPage>;
}
function timeline(value: Record<string, unknown> | null) {if (!value) return 'Timeline not specified'; const duration = value.duration; const unit = value.unit; return duration != null ? `Estimated ${duration} ${String(unit ?? '').toLowerCase()}` : 'Timeline not specified';}
const styles = StyleSheet.create({state: {minHeight: 160, alignItems: 'center', justifyContent: 'center', gap: 12}, error: {color: flow.red, fontSize: 13}, count: {fontSize: 12, color: flow.muted}, body: {fontSize: 12, lineHeight: 18, color: flow.muted}, sub: {fontSize: 11, lineHeight: 17, color: flow.muted}, amount: {fontSize: 18, color: flow.blue, fontWeight: '900'}, actions: {flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: flow.line, paddingTop: 9, marginTop: 3}, link: {paddingVertical: 3}, linkText: {fontSize: 11, color: flow.blue, fontWeight: '800'}, chosen: {color: flow.green}});
