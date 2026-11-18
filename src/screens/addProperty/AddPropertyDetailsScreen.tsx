import React, { useEffect, useRef, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';

import { colors } from '@/constants/colors';
import { ROUTES } from '@/constants/routes';
import { spacing } from '@/constants/spacing';
import { useMasterOptions } from '@/hooks/useMasterOptions';
import { usePropertyStore } from '@/store/propertyStore';
import type { AddPropertyStackParamList, PropertyReadyState } from '@/types';
import { KeyboardAwareScrollView } from '@/components';
import { showToast } from '@/utils/toast';
import {
  formatBuildingFloors,
  formatHouseFloors,
  formatPropertyFloor,
  getPropertyFloorMode,
  isHouseFloorMode,
  isUnitFloorMode,
  validatePropertyFloors,
} from '@/utils/propertyFloors';

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
const currentYear = new Date().getFullYear();
const constructionYears = Array.from({ length: 301 }, (_, index) => 1800 + index)
  .sort((left, right) => Math.abs(left - currentYear) - Math.abs(right - currentYear))
  .map(String);
const propertyFloorValues = Array.from({length: 101}, (_, value) => value);
const buildingFloorValues = Array.from({length: 100}, (_, index) => index + 1);
const customHouseFloorValues = Array.from({length: 96}, (_, index) => index + 5);

type PickerName =
  | 'facing'
  | 'year'
  | 'propertyFloor'
  | 'buildingFloors'
  | 'houseCustom';

export function AddPropertyDetailsScreen({ navigation, route }: Props) {
  const draft = usePropertyStore(state => state.editorDraft);
  const editorPropertyId = usePropertyStore(state => state.editorPropertyId);
  const initializeDraft = usePropertyStore(state => state.initializeDraft);
  const updateDraft = usePropertyStore(state => state.updateDraft);
  const [amenitiesInput, setAmenitiesInput] = useState('');
  const [dimensions, setDimensions] = useState({length: '', width: ''});
  const initializedDimensionKey = useRef<string | null>(null);
  const [activePicker, setActivePicker] = useState<PickerName | null>(null);
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

  useEffect(() => {
    if (!draft) return;
    const key = String(editorPropertyId ?? 'new-property');
    if (initializedDimensionKey.current === key) return;
    initializedDimensionKey.current = key;
    setDimensions({
      length: draft.plotLength == null ? '' : String(draft.plotLength),
      width: draft.plotWidth == null ? '' : String(draft.plotWidth),
    });
  }, [draft, editorPropertyId]);

  const typeName = draft?.propertyType.toLowerCase() ?? '';
  const isHouse = typeName.includes('house');
  const isFlat = typeName.includes('flat');
  const isAgriculture = typeName.includes('agriculture');
  const isCommercial = typeName.includes('commercial');
  const floorMode = getPropertyFloorMode(draft?.propertyType ?? '');
  const showsHouseFloors = isHouseFloorMode(floorMode);
  const showsUnitFloors = isUnitFloorMode(floorMode);

  // Normalize legacy/edit data as soon as its type-specific screen is opened.
  // House uses totalFloors only; land/plot/warehouse types use neither value.
  useEffect(() => {
    if (!draft) return;
    if (showsHouseFloors && draft.floorNumber !== undefined) {
      updateDraft({floorNumber: undefined});
      return;
    }
    if (
      floorMode === 'none' &&
      (draft.floorNumber !== undefined || draft.totalFloors !== undefined)
    ) {
      updateDraft({floorNumber: undefined, totalFloors: undefined});
    }
  }, [draft, floorMode, showsHouseFloors, updateDraft]);

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

  const handleContinue = () => {
    const invalidDimension = (['length', 'width'] as const).some(key => {
      const value = dimensions[key].trim();
      return value !== '' && (!Number.isFinite(Number(value)) || Number(value) <= 0);
    });
    if (invalidDimension) {
      showToast('Enter a valid positive length and width, or leave them blank');
      return;
    }
    if (isHouse) {
      if (!draft.bhk) { showToast('Please select BHK'); return; }
      if (!draft.bathrooms) { showToast('Please select number of bathrooms'); return; }
      if (!draft.constructionYear) { showToast('Please select construction year'); return; }
    }
    const floorError = validatePropertyFloors(
      draft.propertyType,
      draft.floorNumber,
      draft.totalFloors,
    );
    if (floorError) { showToast(floorError); return; }
    if (isAgriculture && (!draft.surveyNumber?.trim() || !draft.waterSource?.trim() || !draft.landType?.trim())) {
      showToast('Please complete survey number, water source and land type'); return;
    }
    if (isCommercial && !draft.commercialType?.trim()) {
      showToast('Please enter commercial type'); return;
    }
    navigation.replace(ROUTES.addProperty.uploadPropertyMedia, {
      propertyId: route.params?.propertyId,
    });
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <AddPropertyHeader
          onBackPress={() =>
            navigation.replace(ROUTES.addProperty.addPropertyLocation, {
              propertyId: route.params?.propertyId,
            })
          }
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
          label={isHouse || isFlat ? 'Built-up Area' : 'Property Size'}
          onChangeText={value => updateDraft({ areaSqFt: Number(value || 0) })}
          placeholder="1800"
          required
          rightLabel="sq ft"
          value={draft.areaSqFt ? String(draft.areaSqFt) : ''}
        />

        <View style={styles.doubleRow}>
          {(['Length', 'Width'] as const).map(label => {
            const field = label.toLowerCase() as 'length' | 'width';
            return (
              <FormField
                containerStyle={styles.dimensionField}
                key={label}
                keyboardType="decimal-pad"
                label={label}
                onChangeText={text => {
                  setDimensions(current => ({...current, [field]: text}));
                  const parsed = Number(text.trim());
                  const value = text.trim() && Number.isFinite(parsed) ? parsed : undefined;
                  updateDraft(field === 'length' ? {plotLength: value} : {plotWidth: value});
                }}
                placeholder={label === 'Length' ? '60' : '30'}
                rightLabel="ft"
                value={dimensions[field]}
              />
            );
          })}
        </View>

        <SelectField
          disabled={
            facingOptions.isLoading ||
            Boolean(facingOptions.error) ||
            facingOptions.items.length === 0
          }
          label="Facing"
          value={draft.facing || ''}
          placeholder="Select facing"
          onPress={() => setActivePicker('facing')}
        />
        {facingOptions.isLoading || facingOptions.error ? (
          <InlineAsyncState
            error={facingOptions.error}
            isLoading={facingOptions.isLoading}
            loadingLabel="Loading facing options..."
            onRetry={facingOptions.reload}
          />
        ) : null}

        <SelectField
          label="Road Width"
          value={draft.roadWidthFt ? `${draft.roadWidthFt} Feet` : ''}
          placeholder="Select road width"
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

        {isHouse || isFlat ? (
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

        {isHouse || isFlat ? (
          <Section title="Bathrooms">
            <View style={styles.counterRow}>
              <Pressable accessibilityLabel="Decrease bathrooms" disabled={(draft.bathrooms ?? 1) <= 1} onPress={() => updateDraft({ bathrooms: Math.max(1, (draft.bathrooms ?? 1) - 1) })} style={styles.counterButton}><Text style={styles.counterText}>−</Text></Pressable>
              <Text style={styles.counterValue}>{draft.bathrooms ?? 'Select'}</Text>
              <Pressable accessibilityLabel="Increase bathrooms" onPress={() => updateDraft({ bathrooms: (draft.bathrooms ?? 0) + 1 })} style={styles.counterButton}><Text style={styles.counterText}>+</Text></Pressable>
            </View>
          </Section>
        ) : null}

        {isHouse || isFlat ? (
          <SelectField label="Construction Year" value={draft.constructionYear ? String(draft.constructionYear) : ''} placeholder="Select year" onPress={() => setActivePicker('year')} />
        ) : null}

        {showsHouseFloors ? (
          <Section
            required={floorMode === 'house-required'}
            title="Number of Floors"
          >
            <View style={styles.optionRow}>
              {[1, 2, 3, 4].map(value => (
                <OptionChip
                  isSelected={draft.totalFloors === value}
                  key={value}
                  label={formatHouseFloors(value)}
                  onPress={() =>
                    updateDraft({floorNumber: undefined, totalFloors: value})
                  }
                />
              ))}
              <OptionChip
                isSelected={(draft.totalFloors ?? 0) > 4}
                label="Custom"
                onPress={() => setActivePicker('houseCustom')}
              />
            </View>
            {(draft.totalFloors ?? 0) > 4 ? (
              <SelectField
                label="Custom Number of Floors"
                onPress={() => setActivePicker('houseCustom')}
                value={formatHouseFloors(draft.totalFloors!)}
              />
            ) : null}
          </Section>
        ) : null}

        {showsUnitFloors ? (
          <>
            <SelectField
              label="Your Property Floor"
              onPress={() => setActivePicker('propertyFloor')}
              placeholder="Select property floor"
              required={floorMode === 'unit-required'}
              value={
                draft.floorNumber === undefined
                  ? ''
                  : formatPropertyFloor(draft.floorNumber)
              }
            />
            <SelectField
              label="Total Building Floors"
              onPress={() => setActivePicker('buildingFloors')}
              placeholder="Select building floors"
              required={floorMode === 'unit-required'}
              value={
                draft.totalFloors === undefined
                  ? ''
                  : formatBuildingFloors(draft.totalFloors)
              }
            />
          </>
        ) : null}

        {isAgriculture ? (
          <>
            <FormField label="Survey Number" onChangeText={surveyNumber => updateDraft({ surveyNumber })} placeholder="Enter survey number" value={draft.surveyNumber ?? ''} />
            <FormField label="Water Source" onChangeText={waterSource => updateDraft({ waterSource })} placeholder="Enter water source" value={draft.waterSource ?? ''} />
            <FormField label="Land Type" onChangeText={landType => updateDraft({ landType })} placeholder="Enter land type" value={draft.landType ?? ''} />
          </>
        ) : null}

        {isCommercial ? <FormField label="Commercial Type" onChangeText={commercialType => updateDraft({ commercialType })} placeholder="e.g. Shop, Office" value={draft.commercialType ?? ''} /> : null}

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
                      color={
                        selected ? colors.brandPurple : colors.textSecondary
                      }
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
          onPress={handleContinue}
        />
        <Modal transparent visible={activePicker !== null} animationType="slide" onRequestClose={() => setActivePicker(null)}>
          <View style={styles.modalBackdrop}>
            <View style={styles.pickerSheet}>
              <Text style={styles.pickerTitle}>
                {activePicker === 'year'
                  ? 'Construction Year'
                  : activePicker === 'propertyFloor'
                    ? 'Your Property Floor'
                    : activePicker === 'buildingFloors'
                      ? 'Total Building Floors'
                      : activePicker === 'houseCustom'
                        ? 'Number of Floors'
                        : 'Facing'}
              </Text>
              <FlatList
                data={
                  activePicker === 'year'
                    ? constructionYears.map(value => ({label: value, value}))
                    : activePicker === 'propertyFloor'
                      ? propertyFloorValues.map(value => ({
                          label: formatPropertyFloor(value),
                          value: String(value),
                        }))
                      : activePicker === 'buildingFloors'
                        ? buildingFloorValues.map(value => ({
                            label: formatBuildingFloors(value),
                            value: String(value),
                          }))
                        : activePicker === 'houseCustom'
                          ? customHouseFloorValues.map(value => ({
                              label: formatHouseFloors(value),
                              value: String(value),
                            }))
                          : facingOptions.items.map(item => ({
                              label: item.name,
                              value: item.name,
                            }))
                }
                keyExtractor={item => item.value}
                renderItem={({ item }) => (
                  <Pressable style={styles.pickerOption} onPress={() => {
                    if (activePicker === 'year') {
                      updateDraft({constructionYear: Number(item.value)});
                    } else if (activePicker === 'propertyFloor') {
                      updateDraft({floorNumber: Number(item.value)});
                    } else if (activePicker === 'buildingFloors') {
                      updateDraft({totalFloors: Number(item.value)});
                    } else if (activePicker === 'houseCustom') {
                      updateDraft({
                        floorNumber: undefined,
                        totalFloors: Number(item.value),
                      });
                    } else {
                      updateDraft({facing: item.value});
                    }
                    setActivePicker(null);
                  }}><Text style={styles.pickerOptionText}>{item.label}</Text></Pressable>
                )}
              />
              <Pressable style={styles.pickerCancel} onPress={() => setActivePicker(null)}><Text style={styles.pickerCancelText}>Cancel</Text></Pressable>
            </View>
          </View>
        </Modal>
      </KeyboardAwareScrollView>
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
  dimensionField: { flex: 1 },
  counterRow: { alignItems: 'center', flexDirection: 'row', gap: spacing.md },
  counterButton: { alignItems: 'center', borderColor: colors.chipBorder, borderRadius: 10, borderWidth: 1, height: 44, justifyContent: 'center', width: 48 },
  counterText: { color: colors.brandPurple, fontSize: 24, fontWeight: '600' },
  counterValue: { color: colors.textPrimary, fontSize: 18, fontWeight: '600', minWidth: 48, textAlign: 'center' },
  modalBackdrop: { backgroundColor: 'rgba(0,0,0,0.35)', flex: 1, justifyContent: 'flex-end' },
  pickerSheet: { backgroundColor: colors.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '75%', padding: spacing.lg },
  pickerTitle: { color: colors.textPrimary, fontSize: 18, fontWeight: '700', marginBottom: spacing.md },
  pickerOption: { borderBottomColor: colors.chipBorder, borderBottomWidth: StyleSheet.hairlineWidth, minHeight: 48, justifyContent: 'center' },
  pickerOptionText: { color: colors.textPrimary, fontSize: 16 },
  pickerCancel: { alignItems: 'center', paddingVertical: spacing.md },
  pickerCancelText: { color: colors.brandPurple, fontWeight: '700' },
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
