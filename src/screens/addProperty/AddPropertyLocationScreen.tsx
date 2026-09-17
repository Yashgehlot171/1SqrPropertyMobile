import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';

import { showApiError } from '@/api';
import { BottomSheet } from '@/components';
import { colors } from '@/constants/colors';
import { ROUTES } from '@/constants/routes';
import { spacing } from '@/constants/spacing';
import { typography } from '@/constants/typography';
import {
  getAreasByCity,
  getCitiesByState,
  getStates,
} from '@/services/locationApi';
import type { MasterRecord } from '@/services/masterApi';
import { usePropertyStore } from '@/store/propertyStore';
import type { AddPropertyStackParamList } from '@/types';
import { showToast } from '@/utils/toast';

import {
  AddPropertyHeader,
  FormField,
  PrimaryButton,
  ScreenIntro,
  SelectField,
  StepProgress,
} from './shared';

type Props = NativeStackScreenProps<
  AddPropertyStackParamList,
  'AddPropertyLocation'
>;

type PickerKind = 'state' | 'city' | 'area';

export function AddPropertyLocationScreen({ navigation, route }: Props) {
  const draft = usePropertyStore(state => state.editorDraft);
  const editorPropertyId = usePropertyStore(state => state.editorPropertyId);
  const initializeDraft = usePropertyStore(state => state.initializeDraft);
  const updateDraftLocation = usePropertyStore(
    state => state.updateDraftLocation,
  );
  const [errorMessage, setErrorMessage] = useState('');
  const [activePicker, setActivePicker] = useState<PickerKind | null>(null);

  const [states, setStates] = useState<MasterRecord[]>([]);
  const [statesLoading, setStatesLoading] = useState(true);
  const [statesError, setStatesError] = useState<string | null>(null);

  const [cities, setCities] = useState<MasterRecord[]>([]);
  const [citiesLoading, setCitiesLoading] = useState(false);
  const [citiesError, setCitiesError] = useState<string | null>(null);

  const [areas, setAreas] = useState<MasterRecord[]>([]);
  const [areasLoading, setAreasLoading] = useState(false);
  const [areasError, setAreasError] = useState<string | null>(null);

  useEffect(() => {
    if (
      !draft ||
      (route.params?.propertyId && route.params.propertyId !== editorPropertyId)
    ) {
      initializeDraft(route.params?.propertyId);
    }
  }, [draft, editorPropertyId, initializeDraft, route.params?.propertyId]);

  const loadStates = useCallback(async () => {
    setStatesLoading(true);
    setStatesError(null);
    try {
      const result = await getStates();
      setStates(result.items);
    } catch (error) {
      showApiError(error);
      setStatesError('Unable to load states right now.');
    } finally {
      setStatesLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStates();
  }, [loadStates]);

  // Draft location stores plain name strings (matching how propertyApi's
  // create/update resolves state/city/area names back to backend ids - see
  // resolveStateId/resolveCityId/resolveAreaId in services/propertyApi.ts), so
  // the "selected" record for each dependent level is derived by matching the
  // draft's current name against the live list already fetched for that level.
  const selectedState = useMemo(() => {
    const name = draft?.location.state?.trim().toLowerCase();
    if (!name) {
      return undefined;
    }
    return states.find(item => item.name.toLowerCase() === name);
  }, [states, draft?.location.state]);

  const loadCities = useCallback(async (stateId: number) => {
    setCitiesLoading(true);
    setCitiesError(null);
    try {
      const result = await getCitiesByState(stateId);
      setCities(result.items);
    } catch (error) {
      showApiError(error);
      setCitiesError('Unable to load cities right now.');
    } finally {
      setCitiesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedState) {
      loadCities(selectedState.id);
    } else {
      setCities([]);
      setCitiesError(null);
    }
  }, [selectedState, loadCities]);

  const selectedCity = useMemo(() => {
    const name = draft?.location.city?.trim().toLowerCase();
    if (!name) {
      return undefined;
    }
    return cities.find(item => item.name.toLowerCase() === name);
  }, [cities, draft?.location.city]);

  const loadAreas = useCallback(async (cityId: number) => {
    setAreasLoading(true);
    setAreasError(null);
    try {
      const result = await getAreasByCity(cityId);
      setAreas(result.items);
    } catch (error) {
      showApiError(error);
      setAreasError('Unable to load areas right now.');
    } finally {
      setAreasLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedCity) {
      loadAreas(selectedCity.id);
    } else {
      setAreas([]);
      setAreasError(null);
    }
  }, [selectedCity, loadAreas]);

  if (!draft) {
    return null;
  }

  const handleNext = () => {
    if (!draft.location.state.trim() || !draft.location.city.trim()) {
      setErrorMessage('State and city are required.');
      return;
    }

    if (draft.location.pincode && draft.location.pincode.length !== 6) {
      setErrorMessage('Pincode must be 6 digits.');
      return;
    }

    setErrorMessage('');
    // replace(), not navigate(): see AddPropertyBasicScreen's handleNext for why.
    navigation.replace(ROUTES.addProperty.addPropertyDetails, {
      propertyId: route.params?.propertyId,
    });
  };

  const openPicker = (kind: PickerKind) => {
    if (kind === 'city' && !selectedState) {
      showToast('Select a state first.');
      return;
    }
    if (kind === 'area' && !selectedCity) {
      showToast('Select a city first.');
      return;
    }
    setActivePicker(kind);
  };

  const closePicker = () => setActivePicker(null);

  const handleSelectState = (item: MasterRecord) => {
    updateDraftLocation({ state: item.name, city: '', area: '' });
    if (errorMessage) {
      setErrorMessage('');
    }
    closePicker();
  };

  const handleSelectCity = (item: MasterRecord) => {
    updateDraftLocation({ city: item.name, area: '' });
    if (errorMessage) {
      setErrorMessage('');
    }
    closePicker();
  };

  const handleSelectArea = (item: MasterRecord) => {
    updateDraftLocation({ area: item.name });
    closePicker();
  };

  const pickerConfig: Record<
    PickerKind,
    {
      title: string;
      items: MasterRecord[];
      isLoading: boolean;
      error: string | null;
      onRetry: () => void;
      onSelect: (item: MasterRecord) => void;
      selectedName?: string;
    }
  > = {
    state: {
      title: 'Select State',
      items: states,
      isLoading: statesLoading,
      error: statesError,
      onRetry: loadStates,
      onSelect: handleSelectState,
      selectedName: draft.location.state,
    },
    city: {
      title: 'Select City',
      items: cities,
      isLoading: citiesLoading,
      error: citiesError,
      onRetry: () => {
        if (selectedState) {
          loadCities(selectedState.id);
        }
      },
      onSelect: handleSelectCity,
      selectedName: draft.location.city,
    },
    area: {
      title: 'Select Area',
      items: areas,
      isLoading: areasLoading,
      error: areasError,
      onRetry: () => {
        if (selectedCity) {
          loadAreas(selectedCity.id);
        }
      },
      onSelect: handleSelectArea,
      selectedName: draft.location.area,
    },
  };

  const activeConfig = activePicker ? pickerConfig[activePicker] : undefined;

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <AddPropertyHeader
          onBackPress={() =>
            navigation.replace(ROUTES.addProperty.addPropertyBasic, {
              propertyId: route.params?.propertyId,
            })
          }
          step={2}
          title="Add Property"
        />
        <StepProgress step={2} />
        <ScreenIntro
          subtitle="Where is your property located?"
          title="Location Details"
        />

        <SelectField
          label="State"
          onPress={() => openPicker('state')}
          placeholder="Select state"
          required
          value={draft.location.state}
        />
        <SelectField
          errorMessage={
            errorMessage.includes('city') ? errorMessage : undefined
          }
          label="City"
          onPress={() => openPicker('city')}
          placeholder="Select city"
          required
          value={draft.location.city}
        />
        <SelectField
          label="Locality / Area"
          onPress={() => openPicker('area')}
          placeholder="Select area"
          value={draft.location.area ?? ''}
        />
        <FormField
          label="Address"
          onChangeText={value => updateDraftLocation({ address: value })}
          placeholder="Enter full address"
          value={draft.location.address ?? ''}
        />
        <FormField
          label="Landmark (Optional)"
          onChangeText={value => updateDraftLocation({ district: value })}
          placeholder="e.g. Near City Mall"
          value={draft.location.district ?? ''}
        />
        <FormField
          errorMessage={
            errorMessage.includes('Pincode') ? errorMessage : undefined
          }
          keyboardType="number-pad"
          label="Pin Code"
          maxLength={6}
          onChangeText={value =>
            updateDraftLocation({ pincode: value.replace(/[^0-9]/g, '') })
          }
          placeholder="226010"
          value={draft.location.pincode ?? ''}
        />

        <View style={styles.mapSection}>
          <Text style={styles.mapLabel}>Location on Map</Text>
          <Pressable
            onPress={() =>
              updateDraftLocation({ address: draft.location.address })
            }
            style={styles.mapCard}
          >
            <View style={styles.mapRoadHorizontal} />
            <View style={styles.mapRoadVertical} />
            <View style={styles.mapParkStart} />
            <View style={styles.mapParkEnd} />
            <View style={styles.mapSelectPill}>
              <Text style={styles.mapSelectText}>Tap to select location</Text>
            </View>
            <View style={styles.pin}>
              <Icon color={colors.white} name="location" size={18} />
            </View>
          </Pressable>
        </View>

        <PrimaryButton label="Save & Next" onPress={handleNext} />
      </ScrollView>

      <BottomSheet onClose={closePicker} visible={Boolean(activeConfig)}>
        {activeConfig ? (
          <View style={styles.pickerSheet}>
            <Text style={styles.pickerTitle}>{activeConfig.title}</Text>
            {activeConfig.isLoading ? (
              <View style={styles.pickerState}>
                <ActivityIndicator color={colors.brandPurple} size="small" />
                <Text style={styles.pickerStateText}>Loading...</Text>
              </View>
            ) : activeConfig.error ? (
              <View style={styles.pickerState}>
                <Text style={styles.pickerStateText}>{activeConfig.error}</Text>
                <Pressable
                  onPress={activeConfig.onRetry}
                  style={styles.pickerRetryButton}
                >
                  <Text style={styles.pickerRetryText}>Retry</Text>
                </Pressable>
              </View>
            ) : activeConfig.items.length ? (
              <FlatList
                data={activeConfig.items}
                keyExtractor={item => String(item.id)}
                style={styles.pickerList}
                renderItem={({ item }) => {
                  const isSelected =
                    item.name.toLowerCase() ===
                    (activeConfig.selectedName ?? '').trim().toLowerCase();
                  return (
                    <Pressable
                      onPress={() => activeConfig.onSelect(item)}
                      style={styles.pickerRow}
                    >
                      <Text style={styles.pickerRowText}>{item.name}</Text>
                      {isSelected ? (
                        <Icon
                          color={colors.brandPurple}
                          name="checkmark"
                          size={18}
                        />
                      ) : null}
                    </Pressable>
                  );
                }}
              />
            ) : (
              <View style={styles.pickerState}>
                <Text style={styles.pickerStateText}>No options available.</Text>
              </View>
            )}
          </View>
        ) : null}
      </BottomSheet>
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
  mapSection: {
    gap: spacing.sm,
  },
  mapLabel: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
  },
  mapCard: {
    backgroundColor: colors.mapSurface,
    borderColor: colors.chipBorder,
    borderRadius: spacing.radiusMd,
    borderWidth: 1,
    height: 132,
    overflow: 'hidden',
  },
  mapRoadHorizontal: {
    backgroundColor: colors.mapRoad,
    height: 28,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 54,
    transform: [{ rotate: '-14deg' }],
  },
  mapRoadVertical: {
    backgroundColor: colors.mapRoad,
    bottom: -16,
    left: 164,
    position: 'absolute',
    top: -16,
    transform: [{ rotate: '19deg' }],
    width: 30,
  },
  mapParkStart: {
    backgroundColor: colors.mapPark,
    borderRadius: spacing.radiusMd,
    height: 54,
    left: 8,
    position: 'absolute',
    top: 12,
    width: 74,
  },
  mapParkEnd: {
    backgroundColor: colors.mapPark,
    borderRadius: spacing.radiusMd,
    bottom: 10,
    height: 42,
    position: 'absolute',
    right: 16,
    width: 88,
  },
  mapSelectPill: {
    alignSelf: 'center',
    backgroundColor: colors.surface,
    borderRadius: 999,
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  mapSelectText: {
    color: colors.brandPurple,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },
  pin: {
    alignItems: 'center',
    backgroundColor: colors.brandPurple,
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    left: '50%',
    marginLeft: -18,
    marginTop: -6,
    position: 'absolute',
    top: '50%',
    width: 36,
  },
  pickerSheet: {
    gap: spacing.md,
    maxHeight: 420,
  },
  pickerTitle: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
  },
  pickerState: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  pickerStateText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
  },
  pickerRetryButton: {
    borderColor: colors.brandPurple,
    borderRadius: spacing.radiusMd,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  pickerRetryText: {
    color: colors.brandPurple,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },
  pickerList: {
    maxHeight: 360,
  },
  pickerRow: {
    alignItems: 'center',
    borderBottomColor: colors.divider,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 48,
    paddingHorizontal: spacing.sm,
  },
  pickerRowText: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
});
