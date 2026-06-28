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

import { ConfirmationModal } from '@/components';
import { colors } from '@/constants/colors';
import { ROUTES } from '@/constants/routes';
import { spacing } from '@/constants/spacing';
import { typography } from '@/constants/typography';
import { generateId } from '@/services/serviceUtils';
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

const previewImages = [
  require('@/assets/images/home1.jpg'),
  require('@/assets/images/homeimage2.jpg'),
  require('@/assets/images/homeimage3.jpg'),
];

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
  const addDraftMedia = usePropertyStore(state => state.addDraftMedia);
  const removeDraftMedia = usePropertyStore(state => state.removeDraftMedia);
  const [selectedDocument, setSelectedDocument] =
    useState<UploadedDocument | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<PropertyMedia | null>(
    null,
  );

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

  const createMedia = (type: PropertyMedia['type']) => {
    addDraftMedia({
      id: generateId(type),
      type,
      uri: `placeholder://${type}-${mediaCount + 1}`,
    });
    showToast(`${type === 'image' ? 'Photo' : 'Video'} added locally.`);
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <AddPropertyHeader
          onBackPress={navigation.goBack}
          step={4}
          title="Add Property"
        />
        <StepProgress step={4} />
        <ScreenIntro
          subtitle="Add property images and documents"
          title="Photos & Documents"
        />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Property Photos</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.photoRow}>
              {[0, 1, 2].map(index => {
                const media = draft.media[index];

                return (
                  <Pressable
                    key={index}
                    onPress={() =>
                      media ? setSelectedMedia(media) : createMedia('image')
                    }
                    style={styles.photoTile}
                  >
                    <Image
                      source={previewImages[index % previewImages.length]}
                      style={styles.photo}
                    />
                    {media ? (
                      <View style={styles.uploadedBadge}>
                        <Icon color={colors.white} name="checkmark" size={13} />
                      </View>
                    ) : null}
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
          <Pressable
            onPress={() => createMedia('image')}
            style={styles.addMore}
          >
            <Icon color={colors.textPrimary} name="add" size={18} />
            <Text style={styles.addMoreText}>Add More</Text>
          </Pressable>
          <Text style={styles.helperText}>
            Add at least 3 photos for better visibility
          </Text>
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

        <PrimaryButton
          label="Save & Next"
          onPress={() =>
            navigation.navigate(ROUTES.addProperty.propertyPreview, {
              propertyId: route.params?.propertyId,
            })
          }
        />
      </ScrollView>

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
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
  },
  photoRow: {
    flexDirection: 'row',
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
  uploadedBadge: {
    alignItems: 'center',
    backgroundColor: colors.brandPurple,
    borderRadius: 10,
    height: 20,
    justifyContent: 'center',
    position: 'absolute',
    right: spacing.xs,
    top: spacing.xs,
    width: 20,
  },
  addMore: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderColor: colors.chipBorder,
    borderRadius: spacing.radiusMd,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.xs,
    minHeight: 38,
    paddingHorizontal: spacing.md,
  },
  addMoreText: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
  },
  helperText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.xs,
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
