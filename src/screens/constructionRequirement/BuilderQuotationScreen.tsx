import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {ActivityIndicator, Alert, Pressable, StyleSheet, Text, TextInput, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ROUTES} from '@/constants/routes';
import {BuilderQuotationDraft, BuilderRfqInvitation, getBuilderQuotation, getBuilderRfqInvitation, listQuotationPlans, QuotationPlan, saveBuilderQuotationDraft, submitBuilderQuotation, submitBuilderQuotationRevision} from '@/services/constructionJourneyApi';
import type {ConstructionRequirementStackParamList} from '@/types';
import {FlowPage, FlowSection, flow} from './FlowUI';

type Props = NativeStackScreenProps<ConstructionRequirementStackParamList, 'BuilderQuotation'>;
const emptyDraft: BuilderQuotationDraft = {additionalWork: [], inclusions: [], exclusions: [], pricingBasis: 'PER_SQ_FT', paymentSchedule: {type: 'PERCENTAGE', milestones: []}};
const steps = ['Plan & Area', 'Pricing', 'Additional Work', 'Timeline & Payment', 'Scope & Terms', 'Review'];
const num = (value: string): number | undefined => value.trim() && Number.isFinite(Number(value)) ? Number(value) : undefined;

export function BuilderQuotationScreen({navigation, route}: Props) {
  const {invitationId} = route.params;
  const revisionId = route.params.revisionId;
  const [invitation, setInvitation] = useState<BuilderRfqInvitation>();
  const [plans, setPlans] = useState<QuotationPlan[]>([]);
  const [baselinePlan, setBaselinePlan] = useState<QuotationPlan>();
  const [draft, setDraft] = useState<BuilderQuotationDraft>(emptyDraft);
  const [draftVersion, setDraftVersion] = useState(1);
  const [submitted, setSubmitted] = useState<Awaited<ReturnType<typeof submitBuilderQuotation>>>();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [planError, setPlanError] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      const [rfq, quote] = await Promise.all([getBuilderRfqInvitation(invitationId), getBuilderQuotation(invitationId)]);
      setInvitation(rfq);
      if (quote.snapshot?.plan) setBaselinePlan({id: quote.snapshot.plan.versionId, version: quote.snapshot.plan.version, planId: quote.snapshot.plan.id, name: quote.snapshot.plan.name, status: 'APPROVED', content: quote.snapshot.plan.content});
      if (quote.status === 'SUBMITTED') setSubmitted(quote);
      else {setDraft({...emptyDraft, ...(quote.draftData ?? {})}); setDraftVersion(quote.version ?? 1);}
      try { setPlans(await listQuotationPlans()); setPlanError(''); }
      catch (reason) { setPlanError(reason instanceof Error ? reason.message : 'Approved plans could not be loaded.'); }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to load quotation details.');
    } finally { setLoading(false); }
  }, [invitationId]);
  useEffect(() => {void load();}, [load]);

  const selectedPlan = plans.find(item => item.id === draft.planVersionId) ?? (baselinePlan?.id === draft.planVersionId ? baselinePlan : undefined);
  const totals = useMemo(() => previewTotals(draft), [draft]);
  const editable = !submitted && invitation && ['INTERESTED', 'SITE_VISIT_REQUESTED'].includes(invitation.status) && invitation.request.rfqStatus === 'OPEN';
  const set = <K extends keyof BuilderQuotationDraft>(key: K, value: BuilderQuotationDraft[K]) => setDraft(current => ({...current, [key]: value}));
  const save = async () => {
    setBusy(true); setError('');
    try { await saveBuilderQuotationDraft(invitationId, draft); return true; }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to save quotation draft.'); return false; }
    finally { setBusy(false); }
  };
  const submit = () => {
    if (busy) return;
    Alert.alert(`Submit Quotation V${draftVersion}?`, 'This creates an immutable quotation version. Earlier submitted versions remain in history.', [
      {text: 'Cancel', style: 'cancel'},
      {text: 'Submit Quote', onPress: () => {if (busy) return; void (async () => {
        setBusy(true); setError('');
        try { await saveBuilderQuotationDraft(invitationId, draft); const result = revisionId ? await submitBuilderQuotationRevision(invitationId, revisionId) : await submitBuilderQuotation(invitationId); setSubmitted(result); }
        catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to submit quotation. Your saved draft is preserved.'); }
        finally { setBusy(false); }
      })();}},
    ]);
  };
  const next = () => {setError(''); setStep(value => Math.min(value + 1, steps.length - 1));};
  const previous = () => {setError(''); setStep(value => Math.max(0, value - 1));};

  if (loading) return <FlowPage title="Builder Quotation" onBack={navigation.goBack}><View style={styles.center}><ActivityIndicator color={flow.blue}/><Text style={styles.helper}>Loading RFQ and approved plans…</Text></View></FlowPage>;
  if (error && !invitation) return <FlowPage title="Builder Quotation" onBack={navigation.goBack}><Text style={styles.error}>{error}</Text><Action label="Try again" onPress={() => {setLoading(true); void load();}} /></FlowPage>;
  if (!invitation) return null;

  if (submitted?.snapshot) return <SubmittedQuotation quotation={submitted} onBack={navigation.goBack}/>;
  if (!editable) return <FlowPage title="Builder Quotation" onBack={navigation.goBack}><Text style={styles.error}>This invitation or RFQ is not eligible for a new quotation.</Text><Text style={styles.helper}>An interested Builder response and an open RFQ are required. Any saved draft remains stored.</Text></FlowPage>;

  const snapshot = invitation.request.requirementSnapshot;
  const proposedArea = readPath(snapshot, ['calculations', 'proposedConstructionAreaSqFt']) ?? readPath(snapshot, ['calculations', 'proposedCoveredAreaSqFt']);
  const proposedCovered = readPath(snapshot, ['calculations', 'proposedCoveredAreaSqFt']);
  const proposedBalcony = snapshot.calculations.totalProposedBalconyAreaSqFt;
  const selectedPlanIsEligible = Boolean(selectedPlan);

  return <FlowPage title="Prepare Quotation" onBack={navigation.goBack} step={step + 1} totalSteps={steps.length}
    primary={step < steps.length - 1 ? {label: 'Continue', onPress: next, disabled: busy} : {label: `Review & Submit V${draftVersion}`, onPress: submit, disabled: busy || !editable, loading: busy}}
    secondary={{label: busy ? 'Saving…' : 'Save Draft', onPress: () => {void save();}, disabled: busy, loading: busy}}>
    <Text style={styles.stepHeading}>{steps[step]}</Text>
    <View style={styles.meta}><Text style={styles.metaNumber}>{invitation.request.requestNo}</Text><Text style={styles.metaText}>Quotation draft · no customer or competitor access</Text></View>
    {error ? <Text style={styles.error}>{error}</Text> : null}
    {step > 0 ? <Pressable onPress={previous}><Text style={styles.backStep}>‹ Previous step</Text></Pressable> : null}
    {step === 0 ? <>
      <FlowSection title="Select your approved plan revision">
        {planError ? <Text style={styles.error}>{planError}</Text> : null}
        {!plans.length && !planError ? <Text style={styles.helper}>No approved construction plan available.</Text> : null}
        {!plans.length ? <Action label="Open My Construction Plans" onPress={() => navigation.navigate(ROUTES.constructionRequirement.myConstructionPlans)}/> : null}
        {baselinePlan && !plans.some(item => item.id === baselinePlan.id) ? <Pressable onPress={() => selectPlan(baselinePlan, draft, setDraft)} style={[styles.planCard, draft.planVersionId === baselinePlan.id && styles.planSelected]}><Text style={styles.planName}>{baselinePlan.name} · V{baselinePlan.version} (original quote plan)</Text><Text style={styles.helper}>Uses the plan revision frozen into the previous submitted version.</Text></Pressable> : null}
        {plans.map(plan => <Pressable key={plan.id} onPress={() => selectPlan(plan, draft, setDraft)} style={[styles.planCard, draft.planVersionId === plan.id && styles.planSelected]}>
          <Text style={styles.planName}>{plan.name} · V{plan.version}</Text><Text style={styles.helper}>{plan.pricingBasis === 'PER_SQ_FT' ? `Indicative plan rate ${money(Number(plan.indicativeRatePerSqFt ?? 0))} / sq.ft. (reference only)` : 'Custom / on assessment (reference)'}</Text><Text style={styles.helper}>{draft.planVersionId === plan.id ? 'Selected for this quotation' : 'Tap to select'}</Text>
        </Pressable>)}
        {draft.planVersionId && !selectedPlanIsEligible ? <Text style={styles.error}>The plan saved in this draft is no longer eligible. Select a currently approved revision before submission.</Text> : null}
      </FlowSection>
      <FlowSection title="Customer area references">
        <Info label="Plot area" value={`${snapshot.plot.plotAreaSqFt.toLocaleString('en-IN')} sq.ft.`}/>
        <Info label="Proposed covered area" value={proposedCovered == null ? 'Not provided' : `${Number(proposedCovered).toLocaleString('en-IN')} sq.ft.`}/>
        <Info label="Proposed balcony area" value={`${proposedBalcony.toLocaleString('en-IN')} sq.ft.`}/>
        <Info label="Proposed construction area" value={proposedArea == null ? 'Not provided' : `${Number(proposedArea).toLocaleString('en-IN')} sq.ft.`}/>
        <Field label="Builder confirmed billable area (sq.ft.) *" value={draft.billableAreaSqFt?.toString() ?? ''} onChangeText={value => set('billableAreaSqFt', num(value))} keyboardType="decimal-pad" placeholder="Enter site-assessed billable area" />
        <Field label="Area assessment note (optional)" value={draft.areaAssessmentNote ?? ''} onChangeText={value => set('areaAssessmentNote', value)} placeholder="Explain any relevant site assessment" multiline />
        <Text style={styles.helper}>Plot area and floor count are not used as billable area. Enter the area you are quoting.</Text>
      </FlowSection>
    </> : null}
    {step === 1 ? <>
      <FlowSection title="Pricing basis">
        <View style={styles.row}><Choice label="Per sq.ft." selected={(draft.pricingBasis ?? 'PER_SQ_FT') === 'PER_SQ_FT'} onPress={() => set('pricingBasis', 'PER_SQ_FT')}/><Choice label="Fixed / custom" selected={draft.pricingBasis === 'FIXED'} onPress={() => set('pricingBasis', 'FIXED')}/></View>
        {draft.pricingBasis !== 'FIXED' ? <><Field label="Your RFQ-specific rate per sq.ft. (₹) *" value={draft.ratePerSqFt?.toString() ?? ''} onChangeText={value => set('ratePerSqFt', num(value))} keyboardType="decimal-pad" placeholder={selectedPlan?.indicativeRatePerSqFt ? `Plan reference: ${selectedPlan.indicativeRatePerSqFt}` : 'Enter your rate'} /><Info label="Calculated base amount" value={money((draft.billableAreaSqFt ?? 0) * (draft.ratePerSqFt ?? 0))}/></> : <><Field label="Fixed base amount (₹) *" value={draft.baseAmount?.toString() ?? ''} onChangeText={value => set('baseAmount', num(value))} keyboardType="decimal-pad" placeholder="Enter fixed amount"/><Field label="Pricing note *" value={draft.pricingNote ?? ''} onChangeText={value => set('pricingNote', value)} placeholder="Describe the fixed / custom pricing" multiline/></>}
        <Text style={styles.helper}>The approved plan's indicative rate is a reference. Your RFQ-specific rate is stored separately.</Text>
      </FlowSection>
      <FlowSection title="Optional discount">
        <View style={styles.row}><Choice label="Fixed amount" selected={(draft.discount?.type ?? 'FIXED') === 'FIXED'} onPress={() => set('discount', {type: 'FIXED', value: draft.discount?.value ?? 0})}/><Choice label="Percentage" selected={draft.discount?.type === 'PERCENTAGE'} onPress={() => set('discount', {type: 'PERCENTAGE', value: draft.discount?.value ?? 0})}/><Choice label="No discount" selected={!draft.discount} onPress={() => set('discount', null)}/></View>
        {draft.discount ? <Field label={draft.discount.type === 'PERCENTAGE' ? 'Discount percent (0–100)' : 'Discount amount (₹)'} value={draft.discount.value ? String(draft.discount.value) : ''} onChangeText={value => set('discount', {...draft.discount!, value: num(value) ?? 0})} keyboardType="decimal-pad" placeholder="0"/> : null}
        <QuoteSummary totals={totals}/>
      </FlowSection>
    </> : null}
    {step === 2 ? <FlowSection title="Additional work">
      <Text style={styles.helper}>Add only work included in this RFQ-specific offer. No example items are prefilled.</Text>
      {(draft.additionalWork ?? []).map((item, index) => <View key={index} style={styles.itemCard}>
        <View style={styles.rowBetween}><Text style={styles.planName}>Additional item {index + 1}</Text><Pressable onPress={() => set('additionalWork', (draft.additionalWork ?? []).filter((_, i) => i !== index))}><Text style={styles.remove}>Remove</Text></Pressable></View>
        <Field label="Name *" value={item.name} onChangeText={value => updateItem(index, {name: value}, draft, set)}/>
        <Field label="Description" value={item.description ?? ''} onChangeText={value => updateItem(index, {description: value}, draft, set)} multiline/>
        <View style={styles.row}><Choice label="Quantity × rate" selected={item.calculationType === 'QUANTITY_RATE'} onPress={() => updateItem(index, {calculationType: 'QUANTITY_RATE', amount: undefined}, draft, set)}/><Choice label="Fixed amount" selected={item.calculationType === 'FIXED'} onPress={() => updateItem(index, {calculationType: 'FIXED', quantity: undefined, rate: undefined}, draft, set)}/></View>
        {item.calculationType === 'QUANTITY_RATE' ? <><Field label="Quantity *" value={item.quantity?.toString() ?? ''} onChangeText={value => updateItem(index, {quantity: num(value)}, draft, set)} keyboardType="decimal-pad"/><Field label="Unit" value={item.unit ?? ''} onChangeText={value => updateItem(index, {unit: value}, draft, set)} placeholder="sq.ft., metre, item"/><Field label="Rate (₹) *" value={item.rate?.toString() ?? ''} onChangeText={value => updateItem(index, {rate: num(value)}, draft, set)} keyboardType="decimal-pad"/><Info label="Calculated line amount" value={money((item.quantity ?? 0) * (item.rate ?? 0))}/></> : <Field label="Amount (₹) *" value={item.amount?.toString() ?? ''} onChangeText={value => updateItem(index, {amount: num(value)}, draft, set)} keyboardType="decimal-pad"/>}
      </View>)}
      <Action label="Add additional work" onPress={() => set('additionalWork', [...(draft.additionalWork ?? []), {name: '', calculationType: 'FIXED'}])}/>
      <QuoteSummary totals={totals}/>
    </FlowSection> : null}
    {step === 3 ? <>
      <FlowSection title="Estimated project duration">
        <Field label="Duration *" value={draft.timeline?.duration?.toString() ?? ''} onChangeText={value => set('timeline', {...(draft.timeline ?? {duration: 0, unit: 'MONTHS'}), duration: num(value) ?? 0})} keyboardType="decimal-pad" placeholder="Enter duration"/>
        <View style={styles.row}><Choice label="Days" selected={(draft.timeline?.unit ?? 'MONTHS') === 'DAYS'} onPress={() => set('timeline', {...(draft.timeline ?? {duration: 0, unit: 'MONTHS'}), unit: 'DAYS'})}/><Choice label="Months" selected={(draft.timeline?.unit ?? 'MONTHS') === 'MONTHS'} onPress={() => set('timeline', {...(draft.timeline ?? {duration: 0, unit: 'MONTHS'}), unit: 'MONTHS'})}/></View>
        <Field label="Expected start note" value={draft.timeline?.expectedStartNote ?? ''} onChangeText={value => set('timeline', {...(draft.timeline ?? {duration: 0, unit: 'MONTHS'}), expectedStartNote: value})} placeholder="Optional"/>
        <Field label="Timeline notes" value={draft.timeline?.notes ?? ''} onChangeText={value => set('timeline', {...(draft.timeline ?? {duration: 0, unit: 'MONTHS'}), notes: value})} placeholder="Optional RFQ-specific notes" multiline/>
        {selectedPlan?.content.timeline.duration ? <Text style={styles.helper}>Plan reference: {selectedPlan.content.timeline.duration} {selectedPlan.content.timeline.unit?.toLowerCase() ?? ''}. Enter your RFQ-specific estimate above.</Text> : null}
      </FlowSection>
      <FlowSection title="Payment schedule · percentage-based">
        <Text style={styles.helper}>Milestone percentages must total exactly 100%. No payment gateway is connected.</Text>
        {(draft.paymentSchedule?.milestones ?? []).map((milestone, index) => <View key={index} style={styles.itemCard}>
          <View style={styles.rowBetween}><Text style={styles.planName}>Milestone {index + 1}</Text><Pressable onPress={() => set('paymentSchedule', {type: 'PERCENTAGE', milestones: draft.paymentSchedule!.milestones.filter((_, i) => i !== index).map((item, i) => ({...item, sequence: i + 1}))})}><Text style={styles.remove}>Remove</Text></Pressable></View>
          <Field label="Milestone name *" value={milestone.name} onChangeText={value => updateMilestone(index, {name: value}, draft, set)}/>
          <Field label="Percentage *" value={milestone.percentage ? String(milestone.percentage) : ''} onChangeText={value => updateMilestone(index, {percentage: num(value) ?? 0}, draft, set)} keyboardType="decimal-pad"/>
          <Field label="Description" value={milestone.description ?? ''} onChangeText={value => updateMilestone(index, {description: value}, draft, set)}/>
        </View>)}
        <Action label="Add milestone" onPress={() => set('paymentSchedule', {type: 'PERCENTAGE', milestones: [...(draft.paymentSchedule?.milestones ?? []), {sequence: (draft.paymentSchedule?.milestones.length ?? 0) + 1, name: '', percentage: 0}]})}/>
        <Info label="Payment percentages total" value={`${(draft.paymentSchedule?.milestones ?? []).reduce((sum, item) => sum + (item.percentage || 0), 0)}%`}/>
        {selectedPlan?.content.paymentSchedule?.milestones.length ? <Text style={styles.helper}>The approved plan has a payment template. It is only a reference; quote milestones above are stored independently.</Text> : null}
      </FlowSection>
    </> : null}
    {step === 4 ? <>
      <FlowSection title="Inclusions and exclusions">
        <Text style={styles.helper}>You may edit these quotation-specific lists. The approved plan remains unchanged.</Text>
        <Field label="Inclusions · one per line" value={(draft.inclusions ?? []).join('\n')} onChangeText={value => set('inclusions', value.split('\n').map(item => item.trim()).filter(Boolean))} multiline placeholder="Enter work included in this offer"/>
        <Field label="Exclusions · one per line" value={(draft.exclusions ?? []).join('\n')} onChangeText={value => set('exclusions', value.split('\n').map(item => item.trim()).filter(Boolean))} multiline placeholder="Enter work excluded from this offer"/>
      </FlowSection>
      <FlowSection title="Warranty and terms">
        <Field label="Warranty duration" value={draft.warranty?.duration?.toString() ?? ''} onChangeText={value => set('warranty', {...(draft.warranty ?? {}), duration: num(value)})} keyboardType="decimal-pad" placeholder="Optional"/>
        <View style={styles.row}><Choice label="Months" selected={draft.warranty?.unit === 'MONTHS'} onPress={() => set('warranty', {...(draft.warranty ?? {}), unit: 'MONTHS'})}/><Choice label="Years" selected={draft.warranty?.unit === 'YEARS'} onPress={() => set('warranty', {...(draft.warranty ?? {}), unit: 'YEARS'})}/></View>
        <Field label="Warranty offered" value={draft.warranty?.description ?? ''} onChangeText={value => set('warranty', {...(draft.warranty ?? {}), description: value})} multiline placeholder="Plan warranty is a reference; confirm what you offer"/>
        <Field label="Quotation-specific terms *" value={draft.terms ?? ''} onChangeText={value => set('terms', value)} multiline placeholder="Enter the terms for this offer"/>
        <Field label="Additional notes" value={draft.additionalNotes ?? ''} onChangeText={value => set('additionalNotes', value)} multiline placeholder="Optional notes"/>
        {selectedPlan?.content.terms ? <Text style={styles.helper}>The selected plan contains terms. Confirm and edit the quotation-specific terms above; no terms are added automatically.</Text> : null}
      </FlowSection>
    </> : null}
    {step === 5 ? <Review draft={draft} plan={selectedPlan} totals={totals} snapshot={snapshot} version={draftVersion}/> : null}
  </FlowPage>;
}

function selectPlan(plan: QuotationPlan, draft: BuilderQuotationDraft, setDraft: React.Dispatch<React.SetStateAction<BuilderQuotationDraft>>) {
  if (draft.planVersionId === plan.id) return;
  const content = plan.content;
  setDraft(current => ({...current, planVersionId: plan.id,
    inclusions: current.inclusions?.length ? current.inclusions : [...(content.inclusions ?? [])],
    exclusions: current.exclusions?.length ? current.exclusions : [...(content.exclusions ?? [])],
    warranty: current.warranty?.description || current.warranty?.duration ? current.warranty : {...content.warranty},
    terms: current.terms?.trim() ? current.terms : content.terms ?? '',
    paymentSchedule: current.paymentSchedule?.milestones.length ? current.paymentSchedule : content.paymentSchedule?.type === 'PERCENTAGE' ? {type: 'PERCENTAGE', milestones: content.paymentSchedule.milestones.map((item, index) => ({sequence: index + 1, name: item.name, percentage: item.percentage ?? 0, description: item.description}))} : {type: 'PERCENTAGE', milestones: []},
  }));
}
function updateItem(index: number, changes: Partial<NonNullable<BuilderQuotationDraft['additionalWork']>[number]>, draft: BuilderQuotationDraft, set: <K extends keyof BuilderQuotationDraft>(key: K, value: BuilderQuotationDraft[K]) => void) {set('additionalWork', (draft.additionalWork ?? []).map((item, i) => i === index ? {...item, ...changes} : item));}
function updateMilestone(index: number, changes: Partial<NonNullable<BuilderQuotationDraft['paymentSchedule']>['milestones'][number]>, draft: BuilderQuotationDraft, set: <K extends keyof BuilderQuotationDraft>(key: K, value: BuilderQuotationDraft[K]) => void) {set('paymentSchedule', {type: 'PERCENTAGE', milestones: (draft.paymentSchedule?.milestones ?? []).map((item, i) => i === index ? {...item, ...changes} : item)});}
function previewTotals(draft: BuilderQuotationDraft) {
  const base = draft.pricingBasis === 'FIXED' ? draft.baseAmount ?? 0 : (draft.billableAreaSqFt ?? 0) * (draft.ratePerSqFt ?? 0);
  const additions = (draft.additionalWork ?? []).reduce((sum, item) => sum + (item.calculationType === 'QUANTITY_RATE' ? (item.quantity ?? 0) * (item.rate ?? 0) : item.amount ?? 0), 0);
  const subtotal = base + additions;
  const discount = draft.discount ? draft.discount.type === 'PERCENTAGE' ? subtotal * draft.discount.value / 100 : draft.discount.value : 0;
  return {base, additions, subtotal, discount, total: Math.max(0, subtotal - discount)};
}
function readPath(value: unknown, keys: string[]): unknown {let current: unknown = value; for (const key of keys) {if (!current || typeof current !== 'object') return undefined; current = (current as Record<string, unknown>)[key];} return current;}

function Review({draft, plan, totals, snapshot, version}: {draft: BuilderQuotationDraft; plan?: QuotationPlan; totals: ReturnType<typeof previewTotals>; snapshot: BuilderRfqInvitation['request']['requirementSnapshot']; version: number}) {
  const paymentTotal = (draft.paymentSchedule?.milestones ?? []).reduce((sum, item) => sum + item.percentage, 0);
  return <>
    <FlowSection title="Financial summary"><Info label="Base construction" value={money(totals.base)}/><Info label="Additional work" value={money(totals.additions)}/><Info label="Subtotal" value={money(totals.subtotal)}/><Info label="Discount" value={`−${money(totals.discount)}`}/><Info label="Tax" value="Not applied · no tax configuration is set"/><Info label="Final quotation amount" value={money(totals.total)} strong/></FlowSection>
    <FlowSection title="Plan and area"><Info label="Selected plan" value={plan ? `${plan.name} · V${plan.version}` : 'Select a currently approved plan'}/><Info label="Plot area reference" value={`${snapshot.plot.plotAreaSqFt} sq.ft.`}/><Info label="Confirmed billable area" value={draft.billableAreaSqFt ? `${draft.billableAreaSqFt} sq.ft.` : 'Required'}/><Info label="Pricing basis" value={draft.pricingBasis === 'FIXED' ? 'Fixed / custom' : 'Per sq.ft.'}/>{draft.pricingBasis !== 'FIXED' ? <Info label="Rate" value={draft.ratePerSqFt ? `${money(draft.ratePerSqFt)} / sq.ft.` : 'Required'}/> : <Info label="Pricing note" value={draft.pricingNote || 'Required'}/>}</FlowSection>
    <FlowSection title="Additional work">{(draft.additionalWork ?? []).length ? (draft.additionalWork ?? []).map((item, i) => <Info key={i} label={item.name || `Item ${i + 1}`} value={money(item.calculationType === 'QUANTITY_RATE' ? (item.quantity ?? 0) * (item.rate ?? 0) : item.amount ?? 0)}/>) : <Text style={styles.helper}>No additional work</Text>}</FlowSection>
    <FlowSection title="Timeline and payment"><Info label="Duration" value={draft.timeline ? `${draft.timeline.duration} ${draft.timeline.unit.toLowerCase()}` : 'Required'}/>{(draft.paymentSchedule?.milestones ?? []).map((item, i) => <Info key={i} label={`${item.sequence}. ${item.name}`} value={`${item.percentage}%`}/>)}<Info label="Payment total" value={`${paymentTotal}% · must equal 100%`}/></FlowSection>
    <FlowSection title="Scope and terms"><Info label="Inclusions" value={draft.inclusions?.join(', ') || 'None added'}/><Info label="Exclusions" value={draft.exclusions?.join(', ') || 'None added'}/><Info label="Warranty" value={draft.warranty?.description || (draft.warranty?.duration ? `${draft.warranty.duration} ${draft.warranty.unit ?? ''}` : 'Not specified')}/><Info label="Terms" value={draft.terms || 'Required'}/><Info label="Additional notes" value={draft.additionalNotes || 'None'}/></FlowSection>
  <Text style={styles.helper}>The backend recalculates totals and validates this offer before submitting V{version}. Previously submitted versions are never changed.</Text>
  </>;
}

function SubmittedQuotation({quotation, onBack}: {quotation: NonNullable<Awaited<ReturnType<typeof submitBuilderQuotation>>>; onBack: () => void}) {
  const snapshot = quotation.snapshot; const commercial = snapshot?.commercial ?? {};
  return <FlowPage title="Submitted Quotation" onBack={onBack}>
    <View style={styles.meta}><Text style={styles.metaNumber}>{quotation.quoteNo ?? 'Quotation'}</Text><Text style={styles.metaText}>Version {quotation.version ?? 1} · Submitted {quotation.submittedAt ? new Date(quotation.submittedAt).toLocaleString('en-IN') : 'date not recorded'}</Text></View>
    <FlowSection title="Financial summary"><Info label="Base construction" value={money(Number(commercial.baseAmount ?? 0))}/><Info label="Additional work" value={money(Number((commercial.additionalWork as {amount?: number}[] | undefined)?.reduce((s, item) => s + Number(item.amount ?? 0), 0) ?? 0))}/><Info label="Subtotal" value={money(Number(commercial.subtotal ?? 0))}/><Info label="Discount" value={`−${money(Number(commercial.discountAmount ?? 0))}`}/><Info label="Tax" value="Not applied"/><Info label="Final amount" value={money(Number(quotation.amount ?? commercial.totalAmount ?? 0))} strong/></FlowSection>
    <FlowSection title="Plan and area"><Info label="RFQ" value={snapshot?.request.requestNo ?? 'Unavailable'}/><Info label="Plan" value={`${snapshot?.plan.name ?? 'Unavailable'} · V${snapshot?.plan.version ?? ''}`}/><Info label="Billable area" value={`${String(commercial.billableAreaSqFt ?? 'Not recorded')} sq.ft.`}/><Info label="Pricing basis" value={String(commercial.pricingBasis ?? 'Not recorded').replace(/_/g, ' ')}/><Info label="Rate per sq.ft." value={commercial.ratePerSqFt == null ? 'Not applicable' : money(Number(commercial.ratePerSqFt))}/><Info label="Pricing note" value={String(commercial.pricingNote ?? 'None')}/><Info label="Area assessment" value={String(commercial.areaAssessmentNote ?? 'None')}/></FlowSection>
    <FlowSection title="Additional work">{(commercial.additionalWork as {name?: string; amount?: number; description?: string}[] | undefined)?.length ? (commercial.additionalWork as {name?: string; amount?: number; description?: string}[]).map((item, i) => <Info key={i} label={item.name ?? `Item ${i + 1}`} value={`${money(Number(item.amount ?? 0))}${item.description ? ` · ${item.description}` : ''}`}/>) : <Text style={styles.helper}>None</Text>}</FlowSection>
    <FlowSection title="Timeline and payment"><Info label="Duration" value={commercial.timeline ? `${(commercial.timeline as {duration: number; unit: string}).duration} ${(commercial.timeline as {duration: number; unit: string}).unit.toLowerCase()}` : 'Not recorded'}/>{((commercial.paymentSchedule as {milestones?: {sequence: number; name: string; percentage: number; description?: string}[]})?.milestones ?? []).map((item, i) => <Info key={i} label={`${item.sequence}. ${item.name}`} value={`${item.percentage}%${item.description ? ` · ${item.description}` : ''}`}/>)}</FlowSection>
    <FlowSection title="Scope and terms"><Info label="Inclusions" value={(commercial.inclusions as string[] | undefined)?.join(', ') || 'None'}/><Info label="Exclusions" value={(commercial.exclusions as string[] | undefined)?.join(', ') || 'None'}/><Info label="Warranty" value={commercial.warranty ? String((commercial.warranty as {description?: string}).description ?? 'Not specified') : 'Not specified'}/><Info label="Terms" value={String(commercial.terms ?? 'Not recorded')}/><Info label="Additional notes" value={String(commercial.additionalNotes ?? 'None')}/></FlowSection>
    <Text style={styles.helper}>This submitted version is read-only. Earlier versions remain in history.</Text>
  </FlowPage>;
}

function FlowSectionWrap({children}: {children: React.ReactNode}) {return <View style={styles.sectionBody}>{children}</View>}
function Field(props: {label: string; value: string; onChangeText: (value: string) => void; placeholder?: string; keyboardType?: 'default' | 'decimal-pad' | 'numeric'; multiline?: boolean}) {return <View style={styles.field}><Text style={styles.label}>{props.label}</Text><TextInput value={props.value} onChangeText={props.onChangeText} placeholder={props.placeholder} placeholderTextColor={flow.muted} keyboardType={props.keyboardType ?? 'default'} multiline={props.multiline} style={[styles.input, props.multiline && styles.multiline]}/></View>}
function Info({label, value, strong}: {label: string; value: string; strong?: boolean}) {return <View style={styles.info}><Text style={styles.infoLabel}>{label}</Text><Text style={[styles.infoValue, strong && styles.infoStrong]}>{value}</Text></View>}
function Choice({label, selected, onPress}: {label: string; selected: boolean; onPress: () => void}) {return <Pressable onPress={onPress} style={[styles.choice, selected && styles.choiceSelected]}><Text style={[styles.choiceText, selected && styles.choiceTextSelected]}>{label}</Text></Pressable>}
function Action({label, onPress}: {label: string; onPress: () => void}) {return <Pressable onPress={onPress} style={styles.action}><Text style={styles.actionText}>{label}</Text></Pressable>}
function QuoteSummary({totals}: {totals: ReturnType<typeof previewTotals>}) {return <FlowSectionWrap><Info label="Base construction" value={money(totals.base)}/><Info label="Additional work" value={money(totals.additions)}/><Info label="Discount" value={`−${money(totals.discount)}`}/><Info label="Estimated total" value={money(totals.total)} strong/><Text style={styles.helper}>Preview only · the backend calculates the submitted amount.</Text></FlowSectionWrap>}
function money(value: number) {const rounded = Math.round((value + Number.EPSILON) * 100) / 100; return `₹${rounded.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;}

const styles = StyleSheet.create({center: {minHeight: 220, alignItems: 'center', justifyContent: 'center', gap: 12}, stepHeading: {fontSize: 18, fontWeight: '900', color: flow.ink}, meta: {padding: 13, borderRadius: 9, backgroundColor: flow.blueSoft, gap: 4}, metaNumber: {fontSize: 14, fontWeight: '900', color: flow.ink}, metaText: {fontSize: 10, color: flow.muted}, helper: {fontSize: 11, lineHeight: 16, color: flow.muted}, error: {padding: 10, borderRadius: 7, color: flow.red, backgroundColor: '#FDEAEA', fontSize: 11, lineHeight: 16}, backStep: {fontSize: 12, fontWeight: '800', color: flow.blue}, planCard: {padding: 12, gap: 6, borderRadius: 9, borderWidth: 1, borderColor: flow.line, backgroundColor: flow.surface}, planSelected: {borderColor: flow.blue, backgroundColor: flow.blueSoft}, planName: {fontSize: 13, fontWeight: '800', color: flow.ink}, field: {gap: 5, marginTop: 10}, label: {fontSize: 11, fontWeight: '700', color: flow.ink}, input: {minHeight: 43, paddingHorizontal: 10, borderWidth: 1, borderColor: flow.line, borderRadius: 7, backgroundColor: flow.surface, color: flow.ink, fontSize: 12}, multiline: {minHeight: 80, paddingTop: 9, textAlignVertical: 'top'}, row: {flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 8}, rowBetween: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}, choice: {minHeight: 38, justifyContent: 'center', paddingHorizontal: 10, borderWidth: 1, borderColor: flow.line, borderRadius: 7, backgroundColor: flow.surface}, choiceSelected: {borderColor: flow.blue, backgroundColor: flow.blueSoft}, choiceText: {fontSize: 10, fontWeight: '700', color: flow.muted}, choiceTextSelected: {color: flow.blue}, info: {flexDirection: 'row', justifyContent: 'space-between', gap: 10, paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: flow.line}, infoLabel: {flex: 1, fontSize: 11, color: flow.muted}, infoValue: {flex: 1, fontSize: 11, color: flow.ink, fontWeight: '700', textAlign: 'right'}, infoStrong: {fontSize: 14, fontWeight: '900', color: flow.blue}, itemCard: {gap: 5, padding: 11, borderWidth: 1, borderColor: flow.line, borderRadius: 8, backgroundColor: flow.surface}, remove: {fontSize: 10, color: flow.red, fontWeight: '800'}, action: {minHeight: 42, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: flow.blue, borderRadius: 7, backgroundColor: flow.surface}, actionText: {fontSize: 11, fontWeight: '800', color: flow.blue}, sectionBody: {gap: 2}});
