import React, {useCallback, useState} from 'react';
import {ActivityIndicator, Alert, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {cancelConstructionChangeOrder, createBuilderChangeProposal, createCustomerChangeRequest, decideCustomerChangeOrder, getBuilderChangeOrders, getCustomerChangeOrders, proposeCustomerChangeOrder, type ConstructionChangeOrderItem, type ConstructionChangeOrderSummary} from '@/services/constructionChangeOrderApi';
import type {ConstructionRequirementStackParamList} from '@/types';
import {formatDaysDelta, formatDelta, formatMoney, addMoney} from '@/utils/constructionMoney';
import {FlowInfo, FlowPage, FlowSection, FlowState, flow} from './FlowUI';
import {QuoteAction, QuoteCard} from './customerQuotationUi';

type Props = NativeStackScreenProps<ConstructionRequirementStackParamList, 'ConstructionChangeOrders'>;
const statusLabel: Record<ConstructionChangeOrderItem['status'], string> = {REQUESTED: 'Requested', PROPOSED: 'Proposed', ACCEPTED: 'Accepted', REJECTED: 'Rejected', CANCELLED: 'Cancelled'};
const initialRequest = {title: '', description: '', reason: ''};
const initialTerms = {amountDelta: '', daysDelta: '', proposalNote: ''};

export function ConstructionChangeOrdersScreen({navigation, route}: Props) {
  const {actor, projectId} = route.params;
  const [data, setData] = useState<ConstructionChangeOrderSummary>();
  const [request, setRequest] = useState(initialRequest);
  const [builderRequest, setBuilderRequest] = useState(initialRequest);
  const [builderTerms, setBuilderTerms] = useState(initialTerms);
  const [targetId, setTargetId] = useState('');
  const [proposalTerms, setProposalTerms] = useState(initialTerms);
  const [loading, setLoading] = useState(true); const [refreshing, setRefreshing] = useState(false); const [busy, setBusy] = useState(false); const [error, setError] = useState('');

  const load = useCallback(async (refresh = false) => {
    refresh ? setRefreshing(true) : setLoading(true); setError('');
    try {setData(actor === 'builder' ? await getBuilderChangeOrders(projectId) : await getCustomerChangeOrders(projectId));}
    catch (reason) {setError(reason instanceof Error ? reason.message : 'Unable to load Change Orders.');}
    finally {setLoading(false); setRefreshing(false);}
  }, [actor, projectId]);
  useFocusEffect(useCallback(() => {load();}, [load]));

  const perform = async (action: () => Promise<ConstructionChangeOrderSummary>, done?: () => void) => {
    setBusy(true); setError('');
    try {setData(await action()); done?.();}
    catch (reason) {setError(reason instanceof Error ? reason.message : 'Unable to save Change Order.');}
    finally {setBusy(false);}
  };
  const submitCustomerRequest = () => {
    if (!request.title.trim() || !request.description.trim() || !request.reason.trim()) return;
    return perform(() => createCustomerChangeRequest(projectId, request), () => setRequest(initialRequest));
  };
  const submitBuilderProposal = () => {
    if (!builderRequest.title.trim() || !builderRequest.description.trim() || !builderRequest.reason.trim() || !validTerms(builderTerms)) return;
    return perform(() => createBuilderChangeProposal(projectId, {...builderRequest, amountDelta: builderTerms.amountDelta.trim(), daysDelta: Number(builderTerms.daysDelta), proposalNote: builderTerms.proposalNote.trim() || undefined}), () => {setBuilderRequest(initialRequest); setBuilderTerms(initialTerms);});
  };
  const submitRequestedProposal = (orderId: string) => {
    if (!validTerms(proposalTerms)) return;
    return perform(() => proposeCustomerChangeOrder(projectId, orderId, {amountDelta: proposalTerms.amountDelta.trim(), daysDelta: Number(proposalTerms.daysDelta), proposalNote: proposalTerms.proposalNote.trim() || undefined}), () => {setTargetId(''); setProposalTerms(initialTerms);});
  };
  const decide = (order: ConstructionChangeOrderItem, decision: 'ACCEPT' | 'REJECT') => {
    if (decision === 'ACCEPT' && data) {
      let revised: string;
      try {revised = addMoney(data.currentRevisedContractAmount, order.proposedAmountDelta ?? '0.00');}
      catch {setError('The proposed amount is invalid. Refresh and try again.'); return;}
      Alert.alert(`Accept Change Order #${order.sequenceNumber}?`, [
        `Original Contract: ${formatMoney(data.originalContractAmount)}`,
        `This Change: ${formatDelta(order.proposedAmountDelta)}`,
        `Revised Contract: ${formatMoney(revised)}`,
        `Timeline impact: ${formatDaysDelta(order.proposedDaysDelta)}`,
      ].join('\n'), [{text: 'Cancel', style: 'cancel'}, {text: 'Accept Change', onPress: () => {perform(() => decideCustomerChangeOrder(projectId, order.id, 'ACCEPT'));}}]);
    } else {
      Alert.alert(`Reject Change Order #${order.sequenceNumber}?`, 'The Builder will be notified. The proposed terms will remain in project history.', [{text: 'Cancel', style: 'cancel'}, {text: 'Reject', style: 'destructive', onPress: () => {perform(() => decideCustomerChangeOrder(projectId, order.id, 'REJECT'));}}]);
    }
  };
  const cancel = (order: ConstructionChangeOrderItem) => Alert.alert(`Cancel Change Order #${order.sequenceNumber}?`, 'The cancellation will remain in project history.', [{text: 'Keep', style: 'cancel'}, {text: 'Cancel Change', style: 'destructive', onPress: () => {perform(() => cancelConstructionChangeOrder(projectId, order.id, actor));}}]);

  if (loading && !data) return <FlowPage title="Change Orders" onBack={navigation.goBack}><View style={styles.state}><ActivityIndicator color={flow.blue}/></View></FlowPage>;
  if (!data) return <FlowPage title="Change Orders" onBack={navigation.goBack}><FlowState title="Change Orders unavailable" message={error || 'Unable to load this project.'}/><QuoteAction label="Retry" onPress={() => {load();}}/></FlowPage>;

  const canCreate = data.agreementAccepted;
  return <FlowPage title="Change Orders" onBack={navigation.goBack}>
    <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {load(true);}}/>} contentContainerStyle={styles.content}>
      <QuoteCard title="Revised contract summary">
        <FlowInfo label="Original Contract" value={formatMoney(data.originalContractAmount)}/>
        <FlowInfo label="Accepted Change Orders" value={formatDelta(data.acceptedChangeOrdersTotal)}/>
        <FlowInfo label="Current Revised Contract" value={formatMoney(data.currentRevisedContractAmount)} strong/>
        <FlowInfo label="Original duration" value={data.originalDuration.value == null ? 'Not provided' : `${data.originalDuration.value} ${data.originalDuration.unit ?? ''}`.trim()}/>
        <FlowInfo label="Accepted timeline changes" value={formatDaysDelta(data.acceptedDaysDelta)}/>
      </QuoteCard>
      {!canCreate ? <QuoteCard title="Change Orders unavailable"><Text style={styles.copy}>Both parties must accept the original Agreement before requesting or proposing changes.</Text></QuoteCard> : null}
      {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
      {canCreate && actor === 'customer' ? <FlowSection title="Request a change"><QuoteCard title="Customer Change Request"><Field label="Title" value={request.title} onChangeText={title => setRequest(current => ({...current, title}))} placeholder="For example, premium flooring"/><Field label="Description" value={request.description} onChangeText={description => setRequest(current => ({...current, description}))} placeholder="Describe the requested scope" multiline/><Field label="Reason" value={request.reason} onChangeText={reason => setRequest(current => ({...current, reason}))} placeholder="Why is this change needed?" multiline/><QuoteAction label={busy ? 'Submitting…' : 'Submit Change Request'} disabled={busy || !request.title.trim() || !request.description.trim() || !request.reason.trim()} onPress={submitCustomerRequest}/></QuoteCard></FlowSection> : null}
      {canCreate && actor === 'builder' ? <FlowSection title="Propose a change"><QuoteCard title="Builder Change Proposal"><Field label="Title" value={builderRequest.title} onChangeText={title => setBuilderRequest(current => ({...current, title}))} placeholder="Scope title"/><Field label="Description" value={builderRequest.description} onChangeText={description => setBuilderRequest(current => ({...current, description}))} placeholder="Describe the proposed scope" multiline/><Field label="Reason" value={builderRequest.reason} onChangeText={reason => setBuilderRequest(current => ({...current, reason}))} placeholder="Reason for this proposal" multiline/><TermsFields value={builderTerms} onChange={setBuilderTerms}/><QuoteAction label={busy ? 'Submitting…' : 'Submit Builder Proposal'} disabled={busy || !builderRequest.title.trim() || !builderRequest.description.trim() || !builderRequest.reason.trim() || !validTerms(builderTerms)} onPress={submitBuilderProposal}/></QuoteCard></FlowSection> : null}
      <FlowSection title={`Change Orders (${data.items.length})`}>
        {data.items.length ? data.items.map(order => <OrderCard key={order.id} order={order} actor={actor} busy={busy} proposalTerms={targetId === order.id ? proposalTerms : initialTerms} proposalOpen={targetId === order.id} onOpenProposal={() => {setTargetId(order.id); setProposalTerms(initialTerms);}} onProposalChange={setProposalTerms} onSubmitProposal={() => submitRequestedProposal(order.id)} onDecision={decision => decide(order, decision)} onCancel={() => cancel(order)}/>) : <QuoteCard title="No Change Orders"><Text style={styles.copy}>Customer requests and Builder proposals will appear here.</Text></QuoteCard>}
      </FlowSection>
    </ScrollView>
  </FlowPage>;
}

function OrderCard({order, actor, busy, proposalTerms, proposalOpen, onOpenProposal, onProposalChange, onSubmitProposal, onDecision, onCancel}: {order: ConstructionChangeOrderItem; actor: 'customer' | 'builder'; busy: boolean; proposalTerms: typeof initialTerms; proposalOpen: boolean; onOpenProposal: () => void; onProposalChange: (value: typeof initialTerms) => void; onSubmitProposal: () => void; onDecision: (value: 'ACCEPT' | 'REJECT') => void; onCancel: () => void}) {
  const proposed = order.proposedAmountDelta !== null && order.proposedDaysDelta !== null;
  return <QuoteCard title={`Change Order #${order.sequenceNumber} · ${order.title}`}>
    <FlowInfo label="Initiated by" value={order.initiatedBy === 'CUSTOMER' ? 'Customer' : 'Builder'}/>
    <FlowInfo label="Status" value={statusLabel[order.status]}/>
    <Text style={styles.copy}>{order.description}</Text><FlowInfo label="Reason" value={order.reason}/>
    {proposed ? <><FlowInfo label="Amount impact" value={formatDelta(order.status === 'ACCEPTED' ? order.finalAmountDelta : order.proposedAmountDelta)}/><FlowInfo label="Timeline impact" value={formatDaysDelta(order.status === 'ACCEPTED' ? order.finalDaysDelta : order.proposedDaysDelta)}/></> : <Text style={styles.copy}>Builder proposal pending.</Text>}
    {order.proposalNote ? <FlowInfo label="Builder note" value={order.proposalNote}/> : null}
    <FlowInfo label="Created" value={date(order.createdAt)}/>{order.proposedAt ? <FlowInfo label="Proposed" value={date(order.proposedAt)}/> : null}{order.customerDecisionAt ? <FlowInfo label="Customer decision" value={date(order.customerDecisionAt)}/> : null}
    {actor === 'builder' && order.status === 'REQUESTED' ? proposalOpen ? <><TermsFields value={proposalTerms} onChange={onProposalChange}/><QuoteAction label={busy ? 'Submitting…' : 'Submit Proposal'} disabled={busy || !validTerms(proposalTerms)} onPress={onSubmitProposal}/></> : <QuoteAction label="Propose Price and Timeline" disabled={busy} onPress={onOpenProposal}/> : null}
    {actor === 'customer' && order.status === 'PROPOSED' ? <View style={styles.actions}><QuoteAction label="Review and Accept" disabled={busy} onPress={() => onDecision('ACCEPT')}/><QuoteAction label="Reject Proposal" disabled={busy} onPress={() => onDecision('REJECT')}/></View> : null}
    {(order.status === 'REQUESTED' || order.status === 'PROPOSED') && order.initiatedBy === (actor === 'customer' ? 'CUSTOMER' : 'BUILDER') ? <QuoteAction label="Cancel Change Order" disabled={busy} onPress={onCancel}/> : null}
    {order.history.map(event => <Text key={event.id} style={styles.history}>{event.type.replace(/_/g, ' ')} · {date(event.createdAt)}{event.note ? ` · ${event.note}` : ''}</Text>)}
  </QuoteCard>;
}

function TermsFields({value, onChange}: {value: typeof initialTerms; onChange: (next: typeof initialTerms) => void}) {
  return <><Field label="Amount change (positive or negative)" value={value.amountDelta} onChangeText={amountDelta => onChange({...value, amountDelta})} placeholder="0.00" keyboardType="numbers-and-punctuation"/><Field label="Timeline change in days" value={value.daysDelta} onChangeText={daysDelta => onChange({...value, daysDelta})} placeholder="0" keyboardType="numbers-and-punctuation"/><Field label="Proposal note (optional)" value={value.proposalNote} onChangeText={proposalNote => onChange({...value, proposalNote})} placeholder="Explain the price or schedule impact" multiline/></>;
}

function Field({label, value, onChangeText, placeholder, multiline, keyboardType}: {label: string; value: string; onChangeText: (value: string) => void; placeholder: string; multiline?: boolean; keyboardType?: 'decimal-pad' | 'number-pad' | 'numbers-and-punctuation'}) {
  return <View style={styles.field}><Text style={styles.label}>{label}</Text><TextInput accessibilityLabel={label} value={value} onChangeText={onChangeText} placeholder={placeholder} multiline={multiline} keyboardType={keyboardType} style={[styles.input, multiline && styles.multiline]}/></View>;
}

const validTerms = (value: typeof initialTerms) => /^-?(?:0|[1-9]\d{0,13})(?:\.\d{1,2})?$/.test(value.amountDelta.trim()) && value.daysDelta.trim() !== '' && Number.isSafeInteger(Number(value.daysDelta));
const date = (value: string) => new Date(value).toLocaleString('en-IN', {day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'});
const styles = StyleSheet.create({content: {gap: 12, paddingBottom: 28}, state: {minHeight: 180, alignItems: 'center', justifyContent: 'center'}, copy: {fontSize: 12, lineHeight: 18, color: flow.muted}, error: {fontSize: 12, color: flow.red, paddingHorizontal: 14}, field: {gap: 5, marginBottom: 8}, label: {fontSize: 11, fontWeight: '800', color: flow.muted}, input: {borderWidth: 1, borderColor: flow.line, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 9, color: flow.ink, backgroundColor: '#fff'}, multiline: {minHeight: 70, textAlignVertical: 'top'}, actions: {gap: 7}, history: {fontSize: 10, lineHeight: 16, color: flow.muted, borderTopWidth: 1, borderTopColor: flow.line, paddingTop: 5}});
