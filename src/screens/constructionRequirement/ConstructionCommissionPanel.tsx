import React, {useCallback, useState} from 'react';
import {ActivityIndicator, StyleSheet, Text, View} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {getBuilderConstructionCommission, type BuilderConstructionCommission} from '@/services/constructionCommissionApi';
import {FlowInfo, FlowSection, flow} from './FlowUI';
import {QuoteCard} from './customerQuotationUi';

export function ConstructionCommissionPanel({projectId}: {projectId: string}) {
  const [data, setData] = useState<BuilderConstructionCommission | null>();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const load = useCallback(() => {setLoading(true); setError(''); getBuilderConstructionCommission(projectId).then(setData).catch(reason => setError(reason instanceof Error ? reason.message : 'Unable to load commission details.')).finally(() => setLoading(false));}, [projectId]);
  useFocusEffect(useCallback(() => {load();}, [load]));
  if (loading) return <FlowSection title="Platform commission"><QuoteCard title="Builder commission"><ActivityIndicator color={flow.blue}/></QuoteCard></FlowSection>;
  if (error) return <FlowSection title="Platform commission"><QuoteCard title="Commission details unavailable"><Text style={styles.error}>{error}</Text></QuoteCard></FlowSection>;
  if (!data) return null;
  return <FlowSection title="Platform commission"><QuoteCard title="Builder → 1SQUARE"><Text style={styles.note}>This is the platform commission for your project. It is separate from Customer → Builder contract payments.</Text><FlowInfo label="Frozen rate" value={`${data.rateSnapshot}%`}/><FlowInfo label="Accrued" value={money(data.accruedCommission)}/><FlowInfo label="Settled" value={money(data.settledCommission)}/><FlowInfo label="Outstanding" value={money(data.outstandingCommission)} strong/><FlowInfo label="Status" value={data.status.replace(/_/g, ' ')}/>{data.builderCredit !== '0.00' ? <FlowInfo label="Credit balance" value={money(data.builderCredit)}/> : null}{data.adjustments.map(item => <View key={item.id} style={styles.row}><Text style={styles.label}>Change Order #{item.changeOrderNo}</Text><Text style={styles.value}>{money(item.commissionDelta)}</Text></View>)}{data.payments.map(item => <View key={item.id} style={styles.row}><Text style={styles.label}>Payment · {new Date(item.paidAt).toLocaleDateString('en-IN')}</Text><Text style={styles.value}>{money(item.amount)}</Text>{item.reference ? <Text style={styles.note}>Reference: {item.reference}</Text> : null}</View>)}</QuoteCard></FlowSection>;
}

const money = (value: string) => {const negative = value.startsWith('-'); const [whole, fraction = ''] = (negative ? value.slice(1) : value).split('.'); return `₹${negative ? '-' : ''}${whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}.${fraction.padEnd(2, '0').slice(0, 2)}`;};
const styles = StyleSheet.create({note: {fontSize: 11, lineHeight: 16, color: flow.muted, marginBottom: 8}, error: {fontSize: 12, color: flow.red}, row: {paddingVertical: 8, borderTopWidth: 1, borderTopColor: flow.line}, label: {fontSize: 12, color: flow.muted}, value: {fontSize: 13, fontWeight: '800', color: flow.ink}});
