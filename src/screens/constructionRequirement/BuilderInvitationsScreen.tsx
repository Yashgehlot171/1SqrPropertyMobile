import React, {useCallback, useState} from 'react';
import {ActivityIndicator, Pressable, StyleSheet, Text, View} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';

import {ROUTES} from '@/constants/routes';
import {listBuilderRfqInvitations, type BuilderRfqInvitation} from '@/services/constructionJourneyApi';
import type {ConstructionRequirementStackParamList} from '@/types';
import {FlowPage, flow} from './FlowUI';

type Props = NativeStackScreenProps<ConstructionRequirementStackParamList, 'BuilderInvitations'>;

export function BuilderInvitationsScreen({navigation}: Props) {
  const [items, setItems] = useState<BuilderRfqInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const load = useCallback(async () => {
    setLoading(true); setError(undefined);
    try { setItems((await listBuilderRfqInvitations()).items); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to load incoming RFQs.'); }
    finally { setLoading(false); }
  }, []);
  useFocusEffect(useCallback(() => { void load(); }, [load]));

  return <FlowPage title="Incoming RFQs" onBack={navigation.goBack}>
    {loading ? <View style={styles.state}><ActivityIndicator color={flow.blue} /><Text style={styles.copy}>Loading construction requests…</Text></View> : error ? <View style={styles.state}><Icon name="alert-circle-outline" size={34} color={flow.red} /><Text style={styles.error}>{error}</Text><Pressable onPress={load} style={styles.retryButton}><Text style={styles.retry}>Try again</Text></Pressable></View> : !items.length ? <View style={styles.state}><Icon name="file-tray-outline" size={38} color={flow.muted} /><Text style={styles.emptyTitle}>No new construction requests yet.</Text><Text style={styles.copy}>RFQs sent to your approved Builder service will appear here.</Text></View> : <View style={styles.list}>{items.map(item => <InvitationCard item={item} key={item.id} onPress={() => navigation.navigate(ROUTES.constructionRequirement.builderRfqDetail, {invitationId: item.id})} />)}</View>}
  </FlowPage>;
}

function InvitationCard({item, onPress}: {item: BuilderRfqInvitation; onPress: () => void}) {
  const snapshot = item.request.requirementSnapshot;
  const rooms = snapshot.floors.reduce((sum, floor) => sum + floor.bedrooms, 0);
  return <Pressable accessibilityRole="button" onPress={onPress} style={styles.card}>
    <View style={styles.topRow}><Text style={styles.number}>{item.request.requestNo}</Text><StatusChip status={item.status} /></View>
    <View style={styles.locationRow}><Icon name="location-outline" size={15} color={flow.blue} /><Text style={styles.location}>{snapshot.plot.location.area}, {snapshot.plot.location.city}</Text></View>
    <View style={styles.metaGrid}><Text style={styles.meta}>{snapshot.plot.plotAreaSqFt.toLocaleString('en-IN')} sq.ft. plot</Text><Text style={styles.meta}>{snapshot.floors.length} floor{snapshot.floors.length === 1 ? '' : 's'} · {rooms} room{rooms === 1 ? '' : 's'}</Text><Text style={styles.meta}>{snapshot.preferences.quality} quality</Text><Text style={styles.meta}>Received {new Date(item.sentAt).toLocaleDateString('en-IN')}</Text></View>
    <View style={styles.openRow}><Text style={styles.openText}>View requirement</Text><Icon name="arrow-forward" size={16} color={flow.blue} /></View>
  </Pressable>;
}

function StatusChip({status}: {status: string}) {const declined = status === 'DECLINED'; return <Text style={[styles.status, declined && styles.declined]}>{status.replace(/_/g, ' ')}</Text>}

const styles = StyleSheet.create({state: {minHeight: 250, alignItems: 'center', justifyContent: 'center', gap: 11, paddingHorizontal: 22}, list: {gap: 12}, card: {padding: 14, gap: 10, borderWidth: 1, borderColor: flow.line, borderRadius: 11, backgroundColor: flow.surface}, topRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10}, number: {fontSize: 15, fontWeight: '800', color: flow.ink}, status: {paddingVertical: 4, paddingHorizontal: 8, borderRadius: 99, backgroundColor: flow.blueSoft, color: flow.blue, fontSize: 9, fontWeight: '800'}, declined: {backgroundColor: '#FDEAEA', color: flow.red}, locationRow: {flexDirection: 'row', alignItems: 'center', gap: 5}, location: {fontSize: 12, color: flow.ink, fontWeight: '700'}, metaGrid: {flexDirection: 'row', flexWrap: 'wrap', gap: 7}, meta: {width: '47%', fontSize: 10, color: flow.muted}, openRow: {paddingTop: 8, borderTopWidth: 1, borderTopColor: flow.line, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}, openText: {fontSize: 11, fontWeight: '800', color: flow.blue}, emptyTitle: {fontSize: 15, fontWeight: '800', color: flow.ink}, copy: {fontSize: 12, lineHeight: 17, textAlign: 'center', color: flow.muted}, error: {fontSize: 12, lineHeight: 17, textAlign: 'center', color: flow.red}, retryButton: {paddingVertical: 9, paddingHorizontal: 16, borderRadius: 7, backgroundColor: flow.blue}, retry: {fontSize: 12, fontWeight: '800', color: flow.surface}});
