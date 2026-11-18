import React, {useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {HomeStackParamList} from '@/types';
import {
  createPropertyRequirement,
  getPropertyRequirement,
  transitionPropertyRequirement,
  updatePropertyRequirement,
} from '@/services/propertyRequirementApi';
import {usePropertyRequirementStore} from '@/store/propertyRequirementStore';
import {getAreasByCity, getCitiesByState, getStates} from '@/services/locationApi';
import {getMasterData, type MasterRecord} from '@/services/masterApi';
import {RequirementBudgetTimelineStep} from '@/screens/propertyRequirement/steps/RequirementBudgetTimelineStep';
import {RequirementPaymentStep} from '@/screens/propertyRequirement/steps/RequirementPaymentStep';
import {RequirementPreferencesStep} from '@/screens/propertyRequirement/steps/RequirementPreferencesStep';
import {RequirementPropertyStep} from '@/screens/propertyRequirement/steps/RequirementPropertyStep';
import {RequirementReviewStep} from '@/screens/propertyRequirement/steps/RequirementReviewStep';

type Props = NativeStackScreenProps<HomeStackParamList, 'PropertyRequirementJourney'>;
const steps = ['Location', 'Property Details', 'Budget & Timeline', 'Payment Preference', 'Additional Preferences', 'Review'];

function Pick({
  label,
  items,
  value,
  onPick,
  disabled,
  error,
  retry,
}: {
  label: string;
  items: MasterRecord[];
  value?: number;
  onPick: (value: number) => void;
  disabled?: boolean;
  error?: string;
  retry?: () => void;
}) {
  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      {disabled ? <Text style={styles.muted}>Select the previous location first.</Text> : error ? (
        <Pressable onPress={retry}><Text style={styles.error}>{error} · Retry</Text></Pressable>
      ) : items.length ? (
        <View style={styles.options}>{items.map(item => (
          <Pressable key={item.id} onPress={() => onPick(item.id)} style={[styles.option, value === item.id && styles.active]}>
            <Text>{item.name}</Text>
          </Pressable>
        ))}</View>
      ) : <Text style={styles.muted}>Loading or no options available.</Text>}
    </View>
  );
}

export function PropertyRequirementJourneyScreen({navigation, route}: Props) {
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const [hydrating, setHydrating] = useState(Boolean(route.params?.requirementId));
  const [states, setStates] = useState<MasterRecord[]>([]);
  const [cities, setCities] = useState<MasterRecord[]>([]);
  const [areas, setAreas] = useState<MasterRecord[]>([]);
  const [types, setTypes] = useState<MasterRecord[]>([]);
  const [err, setErr] = useState('');
  const {draft, set, setState, setCity, payload, hydrate, reset} = usePropertyRequirementStore();

  useEffect(() => {
    if (!route.params?.requirementId) reset();
  }, [route.params?.requirementId, reset]);

  useEffect(() => {
    getStates().then(result => setStates(result.items)).catch(() => setErr('Unable to load states.'));
    getMasterData('property-types').then(result => setTypes(result.items)).catch(() => setErr('Unable to load property types.'));
  }, []);

  useEffect(() => {
    const id = route.params?.requirementId;
    if (!id) return;
    setHydrating(true);
    getPropertyRequirement(id)
      .then(hydrate)
      .catch(error => setErr(error instanceof Error ? error.message : 'Unable to load requirement.'))
      .finally(() => setHydrating(false));
  }, [route.params?.requirementId, hydrate]);

  useEffect(() => {
    if (draft.stateId === undefined) {
      setCities([]);
      setAreas([]);
      return;
    }
    getCitiesByState(draft.stateId).then(result => setCities(result.items)).catch(() => setErr('Unable to load cities.'));
  }, [draft.stateId]);

  useEffect(() => {
    if (draft.cityId === undefined) {
      setAreas([]);
      return;
    }
    getAreasByCity(draft.cityId).then(result => setAreas(result.items)).catch(() => setErr('Unable to load localities.'));
  }, [draft.cityId]);

  const save = async (publish = false) => {
    if (busyRef.current || (publish && !draft.consentAccepted)) return;
    busyRef.current = true;
    setBusy(true);
    setErr('');
    try {
      // Persist the current store snapshot first. A new requirement therefore gets an
      // authoritative backend ID before the transition endpoint is called.
      const saved = draft.id
        ? await updatePropertyRequirement(draft.id, payload())
        : await createPropertyRequirement(payload());
      set({id: saved.id, status: saved.status});

      if (!publish) {
        Alert.alert('Saved', 'Draft saved.');
        navigation.goBack();
        return;
      }

      const published = await transitionPropertyRequirement(saved.id, 'publish', {consentAccepted: true});
      // The server response is the only authority for the published status.
      set({id: published.id, status: published.status});
      reset();
      Alert.alert('Published', 'Your property requirement has been published.');
      navigation.goBack();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Please try again.';
      setErr(message);
      Alert.alert(publish ? 'Unable to publish' : 'Unable to save', message);
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  };

  if (hydrating) return <View style={styles.center}><ActivityIndicator /><Text>Loading saved requirement…</Text></View>;

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Text style={styles.title}>{steps[step]}</Text>
      <Text style={styles.step}>Step {step + 1} of 6</Text>
      {err ? <Text accessibilityRole="alert" style={styles.error}>{err}</Text> : null}

      {step === 0 ? <>
        <Pick label="Select State" items={states} value={draft.stateId} onPick={setState} error={err} />
        <Pick label="Select City" items={cities} value={draft.cityId} onPick={setCity} disabled={!draft.stateId} error={err} />
        <Text style={styles.label}>Preferred Localities</Text>
        {areas.map(area => (
          <Pressable
            key={area.id}
            onPress={() => set({localityIds: draft.localityIds.includes(area.id)
              ? draft.localityIds.filter(id => id !== area.id)
              : [...draft.localityIds, area.id]})}
            style={[styles.option, draft.localityIds.includes(area.id) && styles.active]}>
            <Text>{draft.localityIds.includes(area.id) ? '✓ ' : ''}{area.name}</Text>
          </Pressable>
        ))}
      </> : null}
      {step === 1 ? <RequirementPropertyStep types={types} error={err} /> : null}
      {step === 2 ? <RequirementBudgetTimelineStep /> : null}
      {step === 3 ? <RequirementPaymentStep /> : null}
      {step === 4 ? <RequirementPreferencesStep /> : null}
      {step === 5 ? <>
        <RequirementReviewStep
          draft={draft}
          states={states}
          cities={cities}
          areas={areas}
          types={types}
          onEdit={setStep}
        />
        <Pressable style={styles.consent} onPress={() => set({consentAccepted: !draft.consentAccepted})}>
          <Text style={styles.consentText}>{draft.consentAccepted ? '☑' : '☐'}  I understand that eligible property professionals may purchase access to my contact details and contact me about matching properties.</Text>
        </Pressable>
      </> : null}

      <View style={styles.footer}>
        <Pressable disabled={busy} onPress={() => step ? setStep(step - 1) : navigation.goBack()}>
          <Text style={styles.action}>Back</Text>
        </Pressable>
        <Pressable disabled={busy} onPress={() => void save(false)}>
          <Text style={styles.action}>{busy ? 'Saving…' : 'Save Draft'}</Text>
        </Pressable>
        {step < 5 ? (
          <Pressable disabled={busy} onPress={() => setStep(step + 1)}><Text style={styles.action}>Continue</Text></Pressable>
        ) : (
          <Pressable disabled={!draft.consentAccepted || busy} onPress={() => void save(true)}>
            <Text style={[styles.action, (!draft.consentAccepted || busy) && styles.disabled]}>{busy ? 'Publishing…' : 'Publish'}</Text>
          </Pressable>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {padding: 20, gap: 12},
  center: {flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10},
  title: {fontSize: 24, fontWeight: '800'},
  step: {color: '#64748B'},
  label: {fontWeight: '700'},
  options: {gap: 6},
  option: {borderWidth: 1, borderColor: '#CBD5E1', padding: 10, borderRadius: 8},
  active: {borderColor: '#2563EB', backgroundColor: '#EFF6FF'},
  footer: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, gap: 8},
  action: {color: '#2563EB', fontWeight: '700'},
  disabled: {color: '#94A3B8'},
  consent: {borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 10, padding: 12},
  consentText: {color: '#1F2937', lineHeight: 20},
  muted: {color: '#64748B'},
  error: {color: '#B91C1C'},
});
