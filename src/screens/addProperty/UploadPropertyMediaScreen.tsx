import React, { useEffect, useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';

import { BottomSheet, ConfirmationModal } from '@/components';
import { colors } from '@/constants/colors';
import { ROUTES } from '@/constants/routes';
import { spacing } from '@/constants/spacing';
import { typography } from '@/constants/typography';
import { generateId } from '@/services/serviceUtils';
import {
  MAX_PROPERTY_IMAGES,
  usePropertyImagePicker,
} from '@/hooks/usePropertyImagePicker';
import { usePropertyStore } from '@/store/propertyStore';
import type {
  AddPropertyStackParamList,
  PropertyMedia,
  UploadedDocument,
} from '@/types';
import { showToast } from '@/utils/toast';

import {
  AddPropertyHeader,
  PrimaryButton,
  ScreenIntro,
  StepProgress,
} from './shared';

type Props = NativeStackScreenProps<
  AddPropertyStackParamList,
  'UploadPropertyMedia'
>;

const documentTypes: Array<{
  label: string;
  uploadLabel: string;
  type: UploadedDocument['type'];
}> = [
  { label: 'Property Document', uploadLabel: 'property-document', type: 'PDF' },
  { label: 'Registry Document', uploadLabel: 'registry-document', type: 'PDF' },
  { label: 'ID Proof', uploadLabel: 'id-proof', type: 'PDF' },
  { label: 'Other Document', uploadLabel: 'other-document', type: 'JPG' },
];

export function UploadPropertyMediaScreen({ navigation, route }: Props) {
  const draft = usePropertyStore(state => state.editorDraft);
  const editorPropertyId = usePropertyStore(state => state.editorPropertyId);
  const initializeDraft = usePropertyStore(state => state.initializeDraft);
  const addDraftDocument = usePropertyStore(state => state.addDraftDocument);
  const removeDraftDocument = usePropertyStore(
    state => state.removeDraftDocument,
  );
  const addDraftMediaBatch = usePropertyStore(
    state => state.addDraftMediaBatch,
  );
  const removeDraftMedia = usePropertyStore(state => state.removeDraftMedia);
  const [selectedDocument, setSelectedDocument] =
    useState<UploadedDocument | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<PropertyMedia | null>(
    null,
  );
  const [showMediaError, setShowMediaError] = useState(false);

  useEffect(() => {
    if (
      !draft ||
      (route.params?.propertyId && route.params.propertyId !== editorPropertyId)
    ) {
      initializeDraft(route.params?.propertyId);
    }
  }, [draft, editorPropertyId, initializeDraft, route.params?.propertyId]);

  const mediaCount = useMemo(
    () => draft?.media.length ?? 0,
    [draft?.media.length],
  );

  const handleImagesPicked = (media: PropertyMedia[]) => {
    if (!media.length) {
      return;
    }
    addDraftMediaBatch(media);
    setShowMediaError(false);
    showToast(
      media.length === 1 ? 'Photo added.' : `${media.length} photos added.`,
    );
  };

  const {isSheetVisible, openSheet, closeSheet, takePhoto, chooseFromGallery} =
    usePropertyImagePicker(mediaCount, handleImagesPicked);

  if (!draft) {
    return null;
  }

  const createDocument = (label: string, type: UploadedDocument['type']) => {
    addDraftDocument({
      id: generateId('document'),
      name: `${label}-${draft.documents.length + 1}.${type.toLowerCase()}`,
      type,
      uri: `placeholder://${label.toLowerCase()}`,
      uploadedAt: new Date().toISOString(),
      status: 'uploaded',
    });
    showToast(`${label} uploaded locally.`);
  };

  const handleNext = () => {
    if (mediaCount < 1) {
      setShowMediaError(true);
      return;
    }
    // replace(), not navigate(): see AddPropertyBasicScreen's handleNext for why.
    navigation.replace(ROUTES.addProperty.propertyPreview, {
      propertyId: route.params?.propertyId,
    });
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <AddPropertyHeader
          onBackPress={() =>
            navigation.replace(ROUTES.addProperty.addPropertyDetails, {
              propertyId: route.params?.propertyId,
            })
          }
          step={4}
          title="Add Property"
        />
        <StepProgress step={4} />
        <ScreenIntro
          subtitle="Add property images and documents"
          title="Photos & Documents"
        />

        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>
              Property Photos<Text style={styles.required}> *</Text>
            </Text>
            <Text style={styles.counterText}>
              {mediaCount} / {MAX_PROPERTY_IMAGES} photos
            </Text>
          </View>

          <View style={styles.photoGrid}>
            {draft.media.map(media => (
              <View key={media.id} style={styles.photoTile}>
                <Image source={{ uri: media.uri }} style={styles.photo} />
                <Pressable
                  hitSlop={8}
                  onPress={() => setSelectedMedia(media)}
                  style={styles.removeBadge}
                >
                  <Icon color={colors.white} name="close" size={13} />
                </Pressable>
              </View>
            ))}

            {mediaCount < MAX_PROPERTY_IMAGES ? (
              <Pressable
                onPress={openSheet}
                style={[styles.photoTile, styles.addPhotoTile]}
              >
                <Icon color={colors.brandPurple} name="add" size={22} />
                <Text style={styles.addPhotoText}>Add Photo</Text>
              </Pressable>
            ) : null}
          </View>

          <Text style={styles.helperText}>
            {mediaCount >= MAX_PROPERTY_IMAGES
              ? 'Maximum 10 photos reached'
              : 'Add at least 1 photo (up to 10) for better visibility'}
          </Text>
          {showMediaError ? (
            <Text style={styles.errorText}>At least 1 photo is required</Text>
          ) : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Documents (Optional)</Text>
          <View style={styles.documentCard}>
            {documentTypes.map(item => {
              const uploaded = draft.documents.find(document =>
                document.name.startsWith(item.uploadLabel),
              );

              return (
                <View key={item.label} style={styles.documentRow}>
                  <Icon
                    color={colors.textPrimary}
                    name="document-text-outline"
                    size={20}
                  />
                  <Text style={styles.documentName}>{item.label}</Text>
                  <Pressable
                    onPress={() =>
                      uploaded
                        ? setSelectedDocument(uploaded)
                        : createDocument(item.uploadLabel, item.type)
                    }
                  >
                    <Text style={styles.uploadText}>
                      {uploaded ? 'Remove' : 'Upload File'}
                    </Text>
                  </Pressable>
                </View>
              );
            })}
          </View>
        </View>

        <PrimaryButton label="Save & Next" onPress={handleNext} />
      </ScrollView>

      <BottomSheet onClose={closeSheet} visible={isSheetVisible}>
        <Text style={styles.sheetTitle}>Add Photo</Text>
        <Pressable onPress={takePhoto} style={styles.sheetOption}>
          <Icon color={colors.textPrimary} name="camera-outline" size={20} />
          <Text style={styles.sheetOptionText}>Take Photo</Text>
        </Pressable>
        <Pressable onPress={chooseFromGallery} style={styles.sheetOption}>
          <Icon color={colors.textPrimary} name="images-outline" size={20} />
          <Text style={styles.sheetOptionText}>Choose from Gallery</Text>
        </Pressable>
      </BottomSheet>

      <ConfirmationModal
        confirmLabel="Delete"
        message={
          selectedDocument
            ? `Remove ${selectedDocument.name} from this draft?`
            : 'Remove selected document?'
        }
        onCancel={() => setSelectedDocument(null)}
        onConfirm={() => {
          if (selectedDocument) {
            removeDraftDocument(selectedDocument.id);
            showToast('Document removed from draft.');
          }
          setSelectedDocument(null);
        }}
        title="Delete Document"
        visible={Boolean(selectedDocument)}
      />
      <ConfirmationModal
        confirmLabel="Delete"
        message="Remove this media item from the draft?"
        onCancel={() => setSelectedMedia(null)}
        onConfirm={() => {
          if (selectedMedia) {
            removeDraftMedia(selectedMedia.id);
            showToast('Media removed from draft.');
          }
          setSelectedMedia(null);
        }}
        title="Delete Media"
        visible={Boolean(selectedMedia)}
      />
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
  section: {
    gap: spacing.sm,
  },
  sectionHeaderRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
  },
  required: {
    color: colors.error,
  },
  counterText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  photoTile: {
    borderRadius: spacing.radiusMd,
    height: 88,
    overflow: 'hidden',
    width: 106,
  },
  photo: {
    height: '100%',
    width: '100%',
  },
  removeBadge: {
    alignItems: 'center',
    backgroundColor: colors.overlayStrong,
    borderRadius: 10,
    height: 20,
    justifyContent: 'center',
    position: 'absolute',
    right: spacing.xs,
    top: spacing.xs,
    width: 20,
  },
  addPhotoTile: {
    alignItems: 'center',
    borderColor: colors.chipBorder,
    borderStyle: 'dashed',
    borderWidth: 1,
    gap: spacing.xs,
    justifyContent: 'center',
  },
  addPhotoText: {
    color: colors.brandPurple,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },
  helperText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.xs,
  },
  errorText: {
    color: colors.error,
    fontSize: typography.fontSize.xs,
  },
  sheetTitle: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.md,
  },
  sheetOption: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 52,
  },
  sheetOptionText: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  documentCard: {
    backgroundColor: colors.surface,
    borderColor: colors.chipBorder,
    borderRadius: spacing.radiusMd,
    borderWidth: 1,
    overflow: 'hidden',
  },
  documentRow: {
    alignItems: 'center',
    borderBottomColor: colors.divider,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 58,
    paddingHorizontal: spacing.md,
  },
  documentName: {
    color: colors.textPrimary,
    flex: 1,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  uploadText: {
    color: colors.brandPurple,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },
});
