import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import type {MasterRecord} from '@/services/masterApi';
import type {RequirementDraft} from '@/store/propertyRequirementStore';
import {
  getPropertyRequirementFamily,
  PROPERTY_REQUIREMENT_PREFERENCE_KEYS,
} from '@/utils/propertyRequirementFamily';

type Props = {
  draft: RequirementDraft;
  states: MasterRecord[];
  cities: MasterRecord[];
  areas: MasterRecord[];
  types: MasterRecord[];
  onEdit: (step: number) => void;
};

const timelineLabels: Record<string, string> = {
  IMMEDIATELY: 'Immediately',
  WITHIN_1_MONTH: 'Within 1 Month',
  WITHIN_3_MONTHS: '1–3 Months',
  WITHIN_6_MONTHS: '3–6 Months',
  OVER_6_MONTHS: '6+ Months',
};
const paymentLabels: Record<string, string> = {
  SELF_FUNDED: 'Full Payment / Self Funded',
  HOME_LOAN: 'Home Loan',
  PART_LOAN: 'Part Loan + Own Funds',
  NOT_DECIDED: 'Not Decided',
};
const occupationLabels: Record<string, string> = {
  SALARIED: 'Salaried',
  SELF_EMPLOYED: 'Self-Employed / Business',
  PROFESSIONAL: 'Professional',
  OTHER: 'Other',
};
const loanStatusLabels: Record<string, string> = {
  NOT_APPLIED: 'Not Applied',
  PLANNING_TO_APPLY: 'Planning to Apply',
  PRE_APPROVED: 'Pre-Approved',
  APPROVED: 'Approved',
};
const preferenceLabels: Record<string, string> = {
  bhk: 'BHK',
  bathrooms: 'Bathrooms',
  preferredFloor: 'Preferred Floor',
  numberOfFloors: 'Number of Floors',
  furnishing: 'Furnishing',
  parking: 'Parking',
  lift: 'Lift',
  condition: 'Property Condition',
  facing: 'Facing',
  corner: 'Corner Property',
};

const money = (value?: string) => {
  if (!value?.trim()) return undefined;
  const number = Number(value);
  return Number.isFinite(number)
    ? `₹${number.toLocaleString('en-IN', {maximumFractionDigits: 2})}`
    : undefined;
};
const readablePreference = (value: unknown) =>
  typeof value === 'string' || typeof value === 'number' ? String(value) : undefined;
const readableDate = (value?: string) => {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? undefined
    : date.toLocaleDateString('en-IN', {day: 'numeric', month: 'short', year: 'numeric'});
};

export function RequirementReviewStep({draft, states, cities, areas, types, onEdit}: Props) {
  const propertyType = types.find(item => item.id === draft.propertyTypeId);
  const family = getPropertyRequirementFamily(propertyType?.slug);
  const preferences = PROPERTY_REQUIREMENT_PREFERENCE_KEYS[family]
    .map(key => {
      const value = readablePreference(draft.preferences[key]);
      return value ? {label: preferenceLabels[key], value} : undefined;
    })
    .filter((item): item is {label: string; value: string} => Boolean(item));
  const localityNames = areas
    .filter(item => draft.localityIds.includes(item.id))
    .map(item => item.name);
  const minArea = readablePreference(draft.areaMin);
  const maxArea = readablePreference(draft.areaMax);
  const area = minArea || maxArea
    ? `${minArea ? `${minArea}${maxArea ? ' – ' : ''}` : ''}${maxArea ?? ''}${draft.areaUnit ? ` ${draft.areaUnit}` : ''}`
    : undefined;
  const paymentNeedsLoan = draft.paymentPreference === 'HOME_LOAN' || draft.paymentPreference === 'PART_LOAN';
  const additionalRequirement = draft.additionalRequirement?.trim();

  return (
    <View style={styles.container}>
      <Section title="Location" onEdit={() => onEdit(0)}>
        <Row label="State" value={states.find(item => item.id === draft.stateId)?.name} />
        <Row label="City" value={cities.find(item => item.id === draft.cityId)?.name} />
        {localityNames.length ? <Row label="Preferred Localities" value={localityNames.join(', ')} /> : null}
        <Row label="Nearby Locality Acceptable" value={draft.nearbyLocalityAllowed ? 'Yes' : 'No'} />
      </Section>

      <Section title="Property" onEdit={() => onEdit(1)}>
        <Row label="Property Type" value={propertyType?.name} />
        {preferences.map(item => <Row key={item.label} {...item} />)}
      </Section>

      {(area || money(draft.budgetMin) || money(draft.budgetMax) || draft.purchaseTimeline || readableDate(draft.targetPurchaseDate)) ? (
        <Section title="Budget & Timeline" onEdit={() => onEdit(2)}>
          {area ? <Row label="Area" value={area} /> : null}
          {money(draft.budgetMin) ? <Row label="Minimum Budget" value={money(draft.budgetMin)} /> : null}
          {money(draft.budgetMax) ? <Row label="Maximum Budget" value={money(draft.budgetMax)} /> : null}
          {draft.purchaseTimeline ? <Row label="Purchase Timeline" value={timelineLabels[draft.purchaseTimeline]} /> : null}
          {readableDate(draft.targetPurchaseDate) ? <Row label="Target Purchase Date" value={readableDate(draft.targetPurchaseDate)} /> : null}
        </Section>
      ) : <Section title="Budget & Timeline" onEdit={() => onEdit(2)} />}

      {(draft.paymentPreference || (paymentNeedsLoan && (draft.occupation || draft.loanRequirement || draft.loanStatus))) ? (
        <Section title="Payment" onEdit={() => onEdit(3)}>
          {draft.paymentPreference ? <Row label="Payment Preference" value={paymentLabels[draft.paymentPreference]} /> : null}
          {paymentNeedsLoan && draft.occupation ? <Row label="Occupation" value={occupationLabels[draft.occupation]} /> : null}
          {paymentNeedsLoan && money(draft.loanRequirement) ? <Row label="Approx Loan Requirement" value={money(draft.loanRequirement)} /> : null}
          {paymentNeedsLoan && draft.loanStatus ? <Row label="Loan Status" value={loanStatusLabels[draft.loanStatus]} /> : null}
        </Section>
      ) : <Section title="Payment" onEdit={() => onEdit(3)} />}

      {additionalRequirement ? (
        <Section title="Additional Requirement" onEdit={() => onEdit(4)}>
          <Text style={styles.content}>{additionalRequirement}</Text>
        </Section>
      ) : <Section title="Additional Requirement" onEdit={() => onEdit(4)} />}
    </View>
  );
}

function Section({title, children, onEdit}: React.PropsWithChildren<{title: string; onEdit: () => void}>) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.heading}>{title}</Text>
        <Pressable onPress={onEdit} hitSlop={8}><Text style={styles.edit}>Edit</Text></Pressable>
      </View>
      {children}
    </View>
  );
}

function Row({label, value}: {label: string; value?: string}) {
  if (!value?.trim()) return null;
  return <View style={styles.row}><Text style={styles.rowLabel}>{label}</Text><Text style={styles.rowValue}>{value}</Text></View>;
}

const styles = StyleSheet.create({
  container: {gap: 12},
  section: {borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 14, gap: 10},
  sectionHeader: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  heading: {fontSize: 15, fontWeight: '800', color: '#111827'},
  edit: {color: '#2563EB', fontWeight: '700'},
  row: {gap: 3},
  rowLabel: {fontSize: 12, color: '#64748B'},
  rowValue: {fontSize: 14, color: '#111827'},
  content: {fontSize: 14, color: '#111827', lineHeight: 20},
});
