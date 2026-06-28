import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { PROPERTY_TYPES } from '@/constants/appConstants';
import { colors } from '@/constants/colors';
import { ROUTES } from '@/constants/routes';
import { spacing } from '@/constants/spacing';
import { typography } from '@/constants/typography';
import { usePropertyStore } from '@/store/propertyStore';
import type { AddPropertyStackParamList, PropertyType } from '@/types';

import {
  AddPropertyHeader,
  FormField,
  OptionChip,
  PrimaryButton,
  ScreenIntro,
  Section,
  StepProgress,
  TypeOptionCard,
} from './shared';

type Props = NativeStackScreenProps<
  AddPropertyStackParamList,
  'AddPropertyBasic'
>;

const propertyTypeIcons: Record<PropertyType, string> = {
  Plot: 'business-outline',
  House: 'home-outline',
  Flat: 'business-outline',
  'Agriculture Land': 'leaf-outline',
  'Commercial Plot': 'storefront-outline',
  'Commercial House': 'home-outline',
  Shop: 'bag-handle-outline',
  Office: 'briefcase-outline',
  Warehouse: 'cube-outline',
};

export function AddPropertyBasicScreen({ navigation, route }: Props) {
  const draft = usePropertyStore(state => state.editorDraft);
  const editorPropertyId = usePropertyStore(state => state.editorPropertyId);
  const initializeDraft = usePropertyStore(state => state.initializeDraft);
  const updateDraft = usePropertyStore(state => state.updateDraft);
  const clearDraft = usePropertyStore(state => state.clearDraft);
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

  const isEditing = Boolean(route.params?.propertyId);

  const handleNext = () => {
    if (!draft.title.trim()) {
      setErrorMessage('Title is required to continue.');
      return;
    }
    if (!draft.description.trim()) {
      setErrorMessage('Description is required to continue.');
      return;
    }
    if (draft.price <= 0 || draft.areaSqFt <= 0) {
      setErrorMessage('Price and area must be greater than zero.');
      return;
    }

    setErrorMessage('');
    navigation.navigate(ROUTES.addProperty.addPropertyLocation, {
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
          step={1}
          title={isEditing ? 'Edit Property' : 'Add Property'}
          onBackPress={navigation.canGoBack() ? navigation.goBack : undefined}
        />
        <StepProgress step={1} />
        <ScreenIntro
          subtitle="Tell us about your property"
          title="Basic Details"
        />

        <Section title="Property Type">
          <View style={styles.typeGrid}>
            {PROPERTY_TYPES.map(type => (
              <TypeOptionCard
                icon={propertyTypeIcons[type]}
                isSelected={draft.propertyType === type}
                key={type}
                label={type}
                onPress={() => updateDraft({ propertyType: type })}
              />
            ))}
          </View>
        </Section>

        <Section title="Listing Type">
          <View style={styles.segmentRow}>
            <OptionChip
              isSelected={draft.listingType === 'Sell'}
              label="Sell"
              onPress={() => updateDraft({ listingType: 'Sell' })}
            />
            <OptionChip
              isSelected={draft.listingType === 'Rent'}
              label="Rent"
              onPress={() => updateDraft({ listingType: 'Rent' })}
            />
          </View>
        </Section>

        <FormField
          errorMessage={
            errorMessage.includes('Title') ? errorMessage : undefined
          }
          label="Listing Title"
          onChangeText={value => {
            updateDraft({ title: value });
            if (errorMessage) {
              setErrorMessage('');
            }
          }}
          placeholder="e.g. Residential Plot in Gomti Nagar"
          required
          value={draft.title}
        />
        <FormField
          errorMessage={
            errorMessage.includes('Description') ? errorMessage : undefined
          }
          label="Description"
          multiline
          onChangeText={value => {
            updateDraft({ description: value });
            if (errorMessage) {
              setErrorMessage('');
            }
          }}
          placeholder="Describe your property in detail..."
          required
          value={draft.description}
        />
        <View style={styles.inlineFields}>
          <FormField
            errorMessage={
              errorMessage.includes('Price') || errorMessage.includes('area')
                ? errorMessage
                : undefined
            }
            keyboardType="number-pad"
            label="Price"
            onChangeText={value => updateDraft({ price: Number(value || 0) })}
            placeholder="Price"
            required
            value={draft.price ? String(draft.price) : ''}
          />
          <FormField
            errorMessage={
              errorMessage.includes('area') ? errorMessage : undefined
            }
            keyboardType="number-pad"
            label="Area"
            onChangeText={value =>
              updateDraft({ areaSqFt: Number(value || 0) })
            }
            placeholder="Area"
            required
            rightLabel="sq ft"
            value={draft.areaSqFt ? String(draft.areaSqFt) : ''}
          />
        </View>

        <PrimaryButton label="Save & Next" onPress={handleNext} />
        <Text
          onPress={() => {
            clearDraft();
            initializeDraft(route.params?.propertyId);
          }}
          style={styles.resetText}
        >
          Reset Draft
        </Text>
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
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  segmentRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  inlineFields: {
    gap: spacing.lg,
  },
  resetText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    textAlign: 'center',
  },
});
