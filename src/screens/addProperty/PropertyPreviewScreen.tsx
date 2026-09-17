import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';

import { normalizeApiError, showApiError } from '@/api';
import { ConfirmationModal, EmptyState } from '@/components';
import { colors } from '@/constants/colors';
import { ROUTES } from '@/constants/routes';
import { spacing } from '@/constants/spacing';
import { typography } from '@/constants/typography';
import {
  addProperty,
  deleteProperty,
  updateProperty,
} from '@/services/propertyApi';
import { usePropertyStore } from '@/store/propertyStore';
import type {
  AddPropertyStackParamList,
  Property,
  PropertyLifecycleStatus,
} from '@/types';
import { formatCurrency } from '@/utils/formatCurrency';
import { showToast } from '@/utils/toast';

import {
  AddPropertyHeader,
  InlineAsyncState,
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
  const setEditorProperty = usePropertyStore(state => state.setEditorProperty);
  const clearDraft = usePropertyStore(state => state.clearDraft);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [draftSaveError, setDraftSaveError] = useState<string | null>(null);

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

  // `draft.media` may hold local file:// / content:// URIs (freshly picked, not yet
  // uploaded) for a new draft, or remote https:// URIs (already normalized by
  // normalizeMedia in propertyApi.ts) for an existing property being edited. Both
  // shapes carry the same PropertyMedia { type, uri } fields, so `source={{ uri }}`
  // renders either uniformly; only fall back to the bundled asset when there is
  // truly no image yet (empty array, or an entry with an empty `uri` string).
  const previewImageUri = draft.media.find(
    item => item.type === 'image' && item.uri,
  )?.uri;

  const isExisting = Boolean(editorPropertyId);
  const submitLabel =
    draft.status === 'Draft'
      ? 'Publish Property'
      : isExisting
      ? 'Update Property'
      : 'Publish Property';

  // Shared by both Publish and Save as Draft: the backend's create/update endpoints
  // both accept a `status` field (see propertyApi.ts's REVERSE_STATUS_MAP, which maps
  // the mock model's 'Draft'/'Active' straight onto the backend's own draft/active
  // PropertyStatus enum values), so there is a real, persisted backend draft concept —
  // "Save as Draft" is not a local-only action here. The only difference between the
  // two actions is which status they submit; both go through the exact same
  // addProperty (new property) / updateProperty (existing property) calls, which
  // also upload any pending local-URI media/documents internally before saving.
  const persistProperty = async (
    status: PropertyLifecycleStatus,
  ): Promise<Property | undefined> => {
    // `draft` carries an extra `tempId` field (PropertyDraftState only, not part of
    // AddPropertyPayload/Property) — harmless to spread here since TS's excess-
    // property check is suppressed for spread-introduced keys, and propertyApi's
    // addProperty/updateProperty only ever read the fields they declare.
    if (editorPropertyId) {
      return updateProperty(editorPropertyId, { ...draft, status });
    }

    return addProperty({ ...draft, status });
  };

  const handlePublish = async () => {
    setPublishError(null);
    setIsPublishing(true);
    try {
      // Non-admins can only create/update with initial status "draft" or "pending" (backend gate) — Publish submits for review, it doesn't go live.
      const saved = await persistProperty('Pending');
      if (saved) {
        clearDraft();
        showToast(
          isExisting
            ? 'Changes submitted for review.'
            : 'Property submitted for review.',
        );
        navigation.replace(ROUTES.addProperty.myProperties);
      } else {
        // updateProperty resolves to undefined only on a 404 (the property was
        // deleted/no longer exists) — a real failure, but not one that throws.
        setPublishError(
          'This property could not be found. It may have been deleted.',
        );
      }
    } catch (error) {
      setPublishError(normalizeApiError(error).message);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleSaveDraft = async () => {
    setDraftSaveError(null);
    setIsSavingDraft(true);
    try {
      const saved = await persistProperty('Draft');
      if (saved) {
        // Point the editor at the real backend id (a brand-new draft has none
        // until this first save), so a second "Save as Draft" tap — or the
        // eventual Publish — updates this same property instead of creating a
        // duplicate.
        setEditorProperty(saved);
        showToast('Draft saved to your account.');
      } else {
        setDraftSaveError(
          'This property could not be found. It may have been deleted.',
        );
      }
    } catch (error) {
      setDraftSaveError(normalizeApiError(error).message);
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleDelete = async () => {
    if (!editorPropertyId) {
      clearDraft();
      setShowDeleteConfirm(false);
      navigation.replace(ROUTES.addProperty.myProperties);
      return;
    }

    setIsDeleting(true);
    try {
      await deleteProperty(editorPropertyId);
      clearDraft();
      setShowDeleteConfirm(false);
      showToast('Property deleted.');
      navigation.replace(ROUTES.addProperty.myProperties);
    } catch (error) {
      setShowDeleteConfirm(false);
      showApiError(error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <AddPropertyHeader
          onBackPress={() =>
            navigation.replace(ROUTES.addProperty.uploadPropertyMedia, {
              propertyId: route.params?.propertyId,
            })
          }
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
              source={
                previewImageUri
                  ? { uri: previewImageUri }
                  : require('@/assets/images/home1.jpg')
              }
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
          <Text style={styles.summaryTitle}>Description</Text>
          <Text style={styles.descriptionText}>
            {draft.description || 'No description added.'}
          </Text>
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
            label="Address"
            value={draft.location.address || 'Not added'}
          />
          <PreviewRow
            label="Landmark"
            value={draft.location.district || 'Not added'}
          />
          <PreviewRow
            label="Pincode"
            value={draft.location.pincode || 'Not added'}
          />
          <PreviewRow
            label="Size"
            value={draft.areaSqFt ? `${draft.areaSqFt} sq ft` : 'Not added'}
          />
          {draft.bhk ? <PreviewRow label="BHK" value={draft.bhk} /> : null}
          <PreviewRow label="Facing" value={draft.facing || 'Not added'} />
          <PreviewRow
            label="Road Width"
            value={draft.roadWidthFt ? `${draft.roadWidthFt} ft` : 'Not added'}
          />
          <PreviewRow
            label="Furnishing"
            value={draft.furnishing || 'Not added'}
          />
          <PreviewRow label="Ready State" value={draft.readyState} />
          <PreviewRow label="Ownership Type" value={draft.ownerType} />
          <PreviewRow
            label="Registry"
            value={draft.verified ? 'Registry Ready' : 'Not Ready'}
          />
          <PreviewRow
            label="Amenities"
            value={
              draft.amenities.length ? draft.amenities.join(', ') : 'None added'
            }
          />
          <PreviewRow label="Photos" value={String(draft.media.length)} />
          <PreviewRow
            label="Documents"
            value={String(draft.documents.length)}
          />
        </View>

        <PrimaryButton
          disabled={isSavingDraft || isDeleting}
          label={submitLabel}
          loading={isPublishing}
          onPress={handlePublish}
        />
        {publishError ? (
          <InlineAsyncState
            error={publishError}
            isLoading={false}
            loadingLabel=""
            onRetry={handlePublish}
          />
        ) : null}
        <SecondaryTextButton
          disabled={isPublishing || isDeleting}
          label="Save as Draft"
          loading={isSavingDraft}
          onPress={handleSaveDraft}
        />
        {draftSaveError ? (
          <InlineAsyncState
            error={draftSaveError}
            isLoading={false}
            loadingLabel=""
            onRetry={handleSaveDraft}
          />
        ) : null}
        {isExisting ? (
          <SecondaryTextButton
            disabled={isPublishing || isSavingDraft}
            label="Delete Property"
            loading={isDeleting}
            onPress={() => setShowDeleteConfirm(true)}
          />
        ) : null}
      </ScrollView>

      <ConfirmationModal
        confirmLabel="Delete"
        message="This will permanently delete the property from your account."
        onCancel={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
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
  descriptionText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.sm,
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
