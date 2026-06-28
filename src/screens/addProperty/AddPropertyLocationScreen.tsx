import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';

import { colors } from '@/constants/colors';
import { ROUTES } from '@/constants/routes';
import { spacing } from '@/constants/spacing';
import { typography } from '@/constants/typography';
import { usePropertyStore } from '@/store/propertyStore';
import type { AddPropertyStackParamList } from '@/types';

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

export function AddPropertyLocationScreen({ navigation, route }: Props) {
  const draft = usePropertyStore(state => state.editorDraft);
  const editorPropertyId = usePropertyStore(state => state.editorPropertyId);
  const initializeDraft = usePropertyStore(state => state.initializeDraft);
  const updateDraftLocation = usePropertyStore(
    state => state.updateDraftLocation,
  );
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (
      !draft ||
      (route.params?.propertyId && route.params.propertyId !== editorPropertyId)
    ) {
      initializeDraft(route.params?.propertyId);
    }
  }, [draft, editorPropertyId, initializeDraft, route.params?.propertyId]);

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
    navigation.navigate(ROUTES.addProperty.addPropertyDetails, {
      propertyId: route.params?.propertyId,
    });
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
          step={2}
          title="Add Property"
        />
        <StepProgress step={2} />
        <ScreenIntro
          subtitle="Where is your property located?"
          title="Location Details"
        />

        <SelectField label="State" required value={draft.location.state} />
        <FormField
          errorMessage={
            errorMessage.includes('city') ? errorMessage : undefined
          }
          label="City"
          onChangeText={value => {
            updateDraftLocation({ city: value });
            if (errorMessage) {
              setErrorMessage('');
            }
          }}
          placeholder="Lucknow"
          required
          value={draft.location.city}
        />
        <FormField
          label="Locality / Area"
          onChangeText={value => updateDraftLocation({ area: value })}
          placeholder="Gomti Nagar"
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
});
