import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';

import { ConfirmationModal, EmptyState } from '@/components';
import { colors } from '@/constants/colors';
import { ROUTES } from '@/constants/routes';
import { spacing } from '@/constants/spacing';
import { typography } from '@/constants/typography';
import { usePropertyStore } from '@/store/propertyStore';
import type { AddPropertyStackParamList } from '@/types';
import { formatCurrency } from '@/utils/formatCurrency';
import { showToast } from '@/utils/toast';

import {
  AddPropertyHeader,
  PrimaryButton,
  ScreenIntro,
  SecondaryTextButton,
  StepProgress,
} from './shared';

type Props = NativeStackScreenProps<
  AddPropertyStackParamList,
  'PropertyPreview'
>;

export function PropertyPreviewScreen({ navigation, route }: Props) {
  const draft = usePropertyStore(state => state.editorDraft);
  const editorPropertyId = usePropertyStore(state => state.editorPropertyId);
  const initializeDraft = usePropertyStore(state => state.initializeDraft);
  const saveDraft = usePropertyStore(state => state.saveDraft);
  const submitDraft = usePropertyStore(state => state.submitDraft);
  const removeProperty = usePropertyStore(state => state.removeProperty);
  const clearDraft = usePropertyStore(state => state.clearDraft);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (
      !draft ||
      (route.params?.propertyId && route.params.propertyId !== editorPropertyId)
    ) {
      initializeDraft(route.params?.propertyId);
    }
  }, [draft, editorPropertyId, initializeDraft, route.params?.propertyId]);

  if (!draft) {
    return (
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <EmptyState
          description="Start a new property draft to preview it here."
          title="No draft available"
        />
      </SafeAreaView>
    );
  }

  const isExisting = Boolean(editorPropertyId);
  const submitLabel =
    draft.status === 'Draft'
      ? 'Publish Property'
      : isExisting
      ? 'Update Property'
      : 'Publish Property';

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <AddPropertyHeader
          onBackPress={navigation.goBack}
          step={5}
          title="Add Property"
        />
        <StepProgress step={5} />
        <ScreenIntro
          subtitle="Review your details and publish"
          title="Review & Publish"
        />

        <View style={styles.previewCard}>
          <Text style={styles.previewTitle}>Preview</Text>
          <View style={styles.imageWrap}>
            <Image
              source={require('@/assets/images/home1.jpg')}
              style={styles.previewImage}
            />
            <View style={styles.previewBadges}>
              {draft.verified ? (
                <Badge label="Verified" tone="success" />
              ) : null}
              <Badge label={draft.listingType} tone="primary" />
            </View>
          </View>
          <View style={styles.propertyCopy}>
            <Text style={styles.propertyTitle}>
              {draft.title || 'Untitled Property'}
            </Text>
            <Text style={styles.locationText}>
              <Icon
                color={colors.textSecondary}
                name="location-outline"
                size={12}
              />{' '}
              {draft.location.area || 'Area pending'},{' '}
              {draft.location.city || 'City pending'}
            </Text>
            <Text style={styles.priceText}>
              {draft.price ? formatCurrency(draft.price) : 'Price pending'}
            </Text>
            <Text style={styles.metaText}>
              {draft.areaSqFt ? `${draft.areaSqFt} sq ft` : 'Area pending'} |{' '}
              {draft.propertyType}
            </Text>
          </View>
        </View>

        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>Summary</Text>
          <PreviewRow label="Property Type" value={draft.propertyType} />
          <PreviewRow label="Listing Type" value={draft.listingType} />
          <PreviewRow
            label="Location"
            value={`${draft.location.area || 'N/A'}, ${
              draft.location.city || 'N/A'
            }`}
          />
          <PreviewRow
            label="Size"
            value={draft.areaSqFt ? `${draft.areaSqFt} sq ft` : 'Not added'}
          />
          <PreviewRow label="Facing" value={draft.facing || 'Not added'} />
          <PreviewRow
            label="Registry"
            value={draft.verified ? 'Registry Ready' : 'Not Ready'}
          />
          <PreviewRow label="Photos" value={String(draft.media.length)} />
          <PreviewRow
            label="Documents"
            value={String(draft.documents.length)}
          />
        </View>

        <PrimaryButton
          label={submitLabel}
          onPress={() => {
            const property = submitDraft();
            if (property) {
              showToast('Property saved to local list.');
              navigation.replace(ROUTES.addProperty.myProperties);
            }
          }}
        />
        <SecondaryTextButton
          label="Save as Draft"
          onPress={() => {
            saveDraft();
            showToast('Draft saved locally.');
          }}
        />
        {isExisting ? (
          <SecondaryTextButton
            label="Delete Property"
            onPress={() => setShowDeleteConfirm(true)}
          />
        ) : null}
      </ScrollView>

      <ConfirmationModal
        confirmLabel="Delete"
        message="This draft or property will be removed from the local list."
        onCancel={() => setShowDeleteConfirm(false)}
        onConfirm={() => {
          if (editorPropertyId) {
            removeProperty(editorPropertyId);
          }
          clearDraft();
          setShowDeleteConfirm(false);
          showToast('Property deleted locally.');
          navigation.replace(ROUTES.addProperty.myProperties);
        }}
        title="Delete Property"
        visible={showDeleteConfirm}
      />
    </SafeAreaView>
  );
}

function Badge({
  label,
  tone,
}: {
  label: string;
  tone: 'primary' | 'success';
}) {
  const isSuccess = tone === 'success';

  return (
    <View
      style={[
        styles.badge,
        isSuccess ? styles.badgeSuccess : styles.badgePrimary,
      ]}
    >
      <Text
        style={[
          styles.badgeText,
          isSuccess ? styles.badgeTextSuccess : styles.badgeTextPrimary,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

function PreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
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
  previewCard: {
    backgroundColor: colors.surface,
    borderColor: colors.chipBorder,
    borderRadius: spacing.radiusLg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  previewTitle: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  imageWrap: {
    height: 138,
    margin: spacing.md,
    overflow: 'hidden',
    borderRadius: spacing.radiusMd,
  },
  previewImage: {
    height: '100%',
    width: '100%',
  },
  previewBadges: {
    flexDirection: 'row',
    gap: spacing.sm,
    position: 'absolute',
    right: spacing.sm,
    top: spacing.sm,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  badgeSuccess: {
    backgroundColor: colors.successSoft,
  },
  badgePrimary: {
    backgroundColor: colors.brandPurpleSoft,
  },
  badgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },
  badgeTextSuccess: {
    color: colors.success,
  },
  badgeTextPrimary: {
    color: colors.brandPurple,
  },
  propertyCopy: {
    gap: spacing.xs,
    padding: spacing.md,
    paddingTop: 0,
  },
  propertyTitle: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
  },
  locationText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.xs,
  },
  priceText: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
  },
  metaText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.xs,
  },
  summary: {
    gap: spacing.md,
  },
  summaryTitle: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  rowLabel: {
    color: colors.textSecondary,
    flex: 1,
    fontSize: typography.fontSize.sm,
  },
  rowValue: {
    color: colors.textPrimary,
    flex: 1,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    textAlign: 'right',
  },
});
