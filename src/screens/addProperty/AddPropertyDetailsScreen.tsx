import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';

import { colors } from '@/constants/colors';
import { ROUTES } from '@/constants/routes';
import { spacing } from '@/constants/spacing';
import { useMasterOptions } from '@/hooks/useMasterOptions';
import { usePropertyStore } from '@/store/propertyStore';
import type { AddPropertyStackParamList, PropertyReadyState } from '@/types';

import {
  AddPropertyHeader,
  FieldLabel,
  FormField,
  InlineAsyncState,
  OptionChip,
  PrimaryButton,
  ScreenIntro,
  Section,
  SelectField,
  StepProgress,
} from './shared';

type Props = NativeStackScreenProps<
  AddPropertyStackParamList,
  'AddPropertyDetails'
>;

const furnishingOptions = ['Unfurnished', 'Semi Furnished', 'Fully Furnished'];

export function AddPropertyDetailsScreen({ navigation, route }: Props) {
  const draft = usePropertyStore(state => state.editorDraft);
  const editorPropertyId = usePropertyStore(state => state.editorPropertyId);
  const initializeDraft = usePropertyStore(state => state.initializeDraft);
  const updateDraft = usePropertyStore(state => state.updateDraft);
  const [amenitiesInput, setAmenitiesInput] = useState('');
  const facingOptions = useMasterOptions(
    'facing-directions',
    'Unable to load facing options right now.',
  );
  const bhkOptions = useMasterOptions(
    'bhk-options',
    'Unable to load BHK options right now.',
  );
  const readyStateOptions = useMasterOptions(
    'ready-states',
    'Unable to load ready-state options right now.',
  );
  const amenityOptions = useMasterOptions(
    'amenities',
    'Unable to load amenities right now.',
  );

  useEffect(() => {
    if (
      !draft ||
      (route.params?.propertyId && route.params.propertyId !== editorPropertyId)
    ) {
      initializeDraft(route.params?.propertyId);
    }
  }, [draft, editorPropertyId, initializeDraft, route.params?.propertyId]);

  useEffect(() => {
    if (draft) {
      setAmenitiesInput(draft.amenities.join(', '));
    }
  }, [draft]);

  const isResidential = useMemo(
    () =>
      draft
        ? ['House', 'Flat', 'Commercial House'].includes(draft.propertyType)
        : false,
    [draft],
  );

  if (!draft) {
    return null;
  }

  const toggleAmenity = (amenity: string) => {
    const nextAmenities = draft.amenities.includes(amenity)
      ? draft.amenities.filter(item => item !== amenity)
      : [...draft.amenities, amenity];

    updateDraft({ amenities: nextAmenities });
    setAmenitiesInput(nextAmenities.join(', '));
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <AddPropertyHeader
          onBackPress={navigation.goBack}
          step={3}
          title="Add Property"
        />
        <StepProgress step={3} />
        <ScreenIntro
          subtitle="Tell us more about your property"
          title="Property Details"
        />

        <FormField
          keyboardType="number-pad"
          label="Property Size"
          onChangeText={value => updateDraft({ areaSqFt: Number(value || 0) })}
          placeholder="1800"
          required
          rightLabel="sq ft"
          value={draft.areaSqFt ? String(draft.areaSqFt) : ''}
        />

        <View style={styles.doubleRow}>
          <FormField
            keyboardType="number-pad"
            label="Length"
            onChangeText={value =>
              updateDraft({ floorNumber: Number(value || 0) || undefined })
            }
            placeholder="60"
            rightLabel="ft"
            value={draft.floorNumber ? String(draft.floorNumber) : ''}
          />
          <FormField
            keyboardType="number-pad"
            label="Width"
            onChangeText={value =>
              updateDraft({ totalFloors: Number(value || 0) || undefined })
            }
            placeholder="30"
            rightLabel="ft"
            value={draft.totalFloors ? String(draft.totalFloors) : ''}
          />
        </View>

        <SelectField label="Facing" value={draft.facing || ''} placeholder="Select facing" />
        {facingOptions.isLoading || facingOptions.error ? (
          <InlineAsyncState
            error={facingOptions.error}
            isLoading={facingOptions.isLoading}
            loadingLabel="Loading facing options..."
            onRetry={facingOptions.reload}
          />
        ) : (
          <View style={styles.selectorChips}>
            {facingOptions.items.map(option => (
              <OptionChip
                isSelected={draft.facing === option.name}
                key={option.id}
                label={option.name}
                onPress={() => updateDraft({ facing: option.name })}
              />
            ))}
          </View>
        )}

        <SelectField
          label="Road Width"
          value={draft.roadWidthFt ? `${draft.roadWidthFt} Feet` : '30 Feet'}
        />
        <View style={styles.selectorChips}>
          {[20, 30, 40, 60].map(width => (
            <OptionChip
              isSelected={draft.roadWidthFt === width}
              key={width}
              label={`${width} ft`}
              onPress={() => updateDraft({ roadWidthFt: width })}
            />
          ))}
        </View>

        {isResidential ? (
          <Section title="BHK">
            {bhkOptions.isLoading || bhkOptions.error ? (
              <InlineAsyncState
                error={bhkOptions.error}
                isLoading={bhkOptions.isLoading}
                loadingLabel="Loading BHK options..."
                onRetry={bhkOptions.reload}
              />
            ) : (
              <View style={styles.optionRow}>
                {bhkOptions.items.map(option => (
                  <OptionChip
                    isSelected={draft.bhk === option.name}
                    key={option.id}
                    label={option.name}
                    onPress={() => updateDraft({ bhk: option.name })}
                  />
                ))}
              </View>
            )}
          </Section>
        ) : null}

        <SelectField label="Ownership Type" value={draft.ownerType} />
        <View style={styles.selectorChips}>
          {(['Owner', 'Broker'] as const).map(option => (
            <OptionChip
              isSelected={draft.ownerType === option}
              key={option}
              label={option}
              onPress={() => updateDraft({ ownerType: option })}
            />
          ))}
        </View>

        <SelectField
          label="Registry Status"
          value={draft.verified ? 'Registry Ready' : 'Not Verified'}
        />
        <View style={styles.selectorChips}>
          <OptionChip
            isSelected={draft.verified}
            label="Registry Ready"
            onPress={() => updateDraft({ verified: true })}
          />
          <OptionChip
            isSelected={!draft.verified}
            label="Not Ready"
            onPress={() => updateDraft({ verified: false })}
          />
        </View>

        <Section title="Ready State">
          {readyStateOptions.isLoading || readyStateOptions.error ? (
            <InlineAsyncState
              error={readyStateOptions.error}
              isLoading={readyStateOptions.isLoading}
              loadingLabel="Loading ready-state options..."
              onRetry={readyStateOptions.reload}
            />
          ) : (
            <View style={styles.optionRow}>
              {readyStateOptions.items.map(option => (
                <OptionChip
                  isSelected={draft.readyState === option.name}
                  key={option.id}
                  label={option.name}
                  onPress={() =>
                    updateDraft({
                      readyState: option.name as PropertyReadyState,
                    })
                  }
                />
              ))}
            </View>
          )}
        </Section>

        <Section title="Furnishing">
          <View style={styles.optionRow}>
            {furnishingOptions.map(option => (
              <OptionChip
                isSelected={draft.furnishing === option}
                key={option}
                label={option}
                onPress={() => updateDraft({ furnishing: option })}
              />
            ))}
          </View>
        </Section>

        <View style={styles.amenitySection}>
          <FieldLabel label="Amenities" />
          {amenityOptions.isLoading || amenityOptions.error ? (
            <InlineAsyncState
              error={amenityOptions.error}
              isLoading={amenityOptions.isLoading}
              loadingLabel="Loading amenities..."
              onRetry={amenityOptions.reload}
            />
          ) : (
            <View style={styles.amenityGrid}>
              {amenityOptions.items.map(amenity => {
                const selected = draft.amenities.includes(amenity.name);

                return (
                  <View key={amenity.id} style={styles.amenityItem}>
                    <Icon
                      color={selected ? colors.brandPurple : colors.textSecondary}
                      name={selected ? 'checkmark-circle' : 'ellipse-outline'}
                      size={16}
                    />
                    <OptionChip
                      isSelected={selected}
                      label={amenity.name}
                      onPress={() => toggleAmenity(amenity.name)}
                    />
                  </View>
                );
              })}
            </View>
          )}
          <FormField
            label="More Amenities"
            multiline
            onChangeText={value => {
              setAmenitiesInput(value);
              updateDraft({
                amenities: value
                  .split(',')
                  .map(item => item.trim())
                  .filter(Boolean),
              });
            }}
            placeholder="Comma separated amenities"
            value={amenitiesInput}
          />
        </View>

        <PrimaryButton
          label="Save & Next"
          onPress={() =>
            navigation.navigate(ROUTES.addProperty.uploadPropertyMedia, {
              propertyId: route.params?.propertyId,
            })
          }
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  content: {
    gap: spacing.lg,
    paddingBottom: spacing.xxxl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  doubleRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  selectorChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: -spacing.sm,
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  amenitySection: {
    gap: spacing.sm,
  },
  amenityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  amenityItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    width: '31%',
  },
});
