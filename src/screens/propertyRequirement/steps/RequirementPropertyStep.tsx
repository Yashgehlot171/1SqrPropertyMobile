import React from 'react';
import {Pressable, StyleSheet, Text, TextInput, View} from 'react-native';
import type {MasterRecord} from '@/services/masterApi';
import {usePropertyRequirementStore} from '@/store/propertyRequirementStore';
import {
  getPropertyRequirementFamily,
  filterPropertyRequirementPreferences,
} from '@/utils/propertyRequirementFamily';

type Props = {types: MasterRecord[]; error?: string; onRetry?: () => void};
type PreferenceField =
  | 'bhk'
  | 'bathrooms'
  | 'preferredFloor'
  | 'numberOfFloors'
  | 'furnishing'
  | 'parking'
  | 'lift'
  | 'condition'
  | 'facing'
  | 'corner';

const fieldsByFamily: Record<string, PreferenceField[]> = {
  FLAT: ['bhk', 'bathrooms', 'preferredFloor', 'furnishing', 'parking', 'lift', 'condition'],
  HOUSE: ['bhk', 'bathrooms', 'numberOfFloors', 'furnishing', 'parking', 'condition'],
  LAND: ['facing', 'corner'],
  COMMERCIAL: ['furnishing', 'parking', 'preferredFloor', 'condition'],
  UNKNOWN: [],
};

const options: Record<PreferenceField, string[]> = {
  bhk: ['1 BHK', '2 BHK', '3 BHK', '4 BHK', '5+ BHK'],
  bathrooms: ['1', '2', '3', '4+'],
  preferredFloor: ['Ground', 'Lower', 'Middle', 'Higher', 'Any'],
  numberOfFloors: ['Ground Floor only', 'G+1', 'G+2', 'G+3', 'Custom'],
  furnishing: ['Unfurnished', 'Semi-furnished', 'Furnished'],
  parking: ['Not required', 'Required'],
  lift: ['No preference', 'Required'],
  condition: ['Ready to Move', 'Under Construction', 'Resale'],
  facing: ['North', 'South', 'East', 'West'],
  corner: ['No preference', 'Corner preferred'],
};

const titles: Record<PreferenceField, string> = {
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

export function RequirementPropertyStep({types, error, onRetry}: Props) {
  const {draft, set} = usePropertyRequirementStore();
  const selected = types.find(type => type.id === draft.propertyTypeId);
  const family = getPropertyRequirementFamily(selected?.slug);
  const currentFields = fieldsByFamily[family];

  const setPreference = (key: string, value: unknown) =>
    set({preferences: {...draft.preferences, [key]: value}});

  const selectType = (type: MasterRecord) => {
    if (type.id === draft.propertyTypeId) return;
    const nextFamily = getPropertyRequirementFamily(type.slug);
    const preferences = filterPropertyRequirementPreferences(draft.preferences, nextFamily);
    set({propertyTypeId: type.id, preferences});
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>Select Property Type</Text>
      {error ? (
        <Pressable onPress={onRetry}>
          <Text style={styles.error}>{error} · Retry</Text>
        </Pressable>
      ) : (
        <View style={styles.row}>
          {types.map(type => (
            <Pressable
              key={type.id}
              style={[styles.chip, type.id === draft.propertyTypeId && styles.active]}
              onPress={() => selectType(type)}>
              <Text>{type.name}</Text>
            </Pressable>
          ))}
        </View>
      )}
      {!selected ? <Text style={styles.help}>Select a property type to see preferences.</Text> : null}
      {currentFields.map(field => (
        <Field
          key={field}
          title={titles[field]}
          field={field}
          prefs={draft.preferences}
          set={setPreference}
        />
      ))}
      <TextInput
        placeholder="Minimum area"
        value={draft.areaMin}
        keyboardType="decimal-pad"
        onChangeText={areaMin => set({areaMin})}
        style={styles.input}
      />
      <TextInput
        placeholder="Maximum area"
        value={draft.areaMax}
        keyboardType="decimal-pad"
        onChangeText={areaMax => set({areaMax})}
        style={styles.input}
      />
    </View>
  );
}

function Field({
  title,
  field,
  prefs,
  set,
}: {
  title: string;
  field: PreferenceField;
  prefs: Record<string, unknown>;
  set: (key: string, value: unknown) => void;
}) {
  return (
    <View>
      <Text style={styles.label}>{title}</Text>
      <View style={styles.row}>
        {options[field].map(value => (
          <Pressable
            key={value}
            style={[styles.chip, prefs[field] === value && styles.active]}
            onPress={() => set(field, value)}>
            <Text>{value}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {gap: 10},
  label: {fontWeight: '700', color: '#1F2937'},
  row: {flexDirection: 'row', flexWrap: 'wrap', gap: 7},
  chip: {paddingHorizontal: 10, paddingVertical: 8, borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 18},
  active: {backgroundColor: '#EFF6FF', borderColor: '#2563EB'},
  help: {color: '#64748B'},
  error: {color: '#B91C1C'},
  input: {borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, padding: 12},
});
