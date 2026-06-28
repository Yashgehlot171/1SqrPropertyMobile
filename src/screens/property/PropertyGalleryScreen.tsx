import React, {useMemo, useState} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';

import {AppButton, AppHeader, EmptyState, ScreenContainer} from '@/components';
import {colors} from '@/constants/colors';
import {spacing} from '@/constants/spacing';
import {typography} from '@/constants/typography';
import {usePropertyStore} from '@/store/propertyStore';
import type {HomeStackParamList, SavedStackParamList} from '@/types';
import {shareProperty} from '@/utils/propertyActions';
import {showToast} from '@/utils/toast';

type Props =
  | NativeStackScreenProps<HomeStackParamList, 'PropertyGallery'>
  | NativeStackScreenProps<SavedStackParamList, 'PropertyGallery'>;

export function PropertyGalleryScreen({navigation, route}: Props) {
  const properties = usePropertyStore(state => state.properties);
  const property = properties.find(item => item.id === route.params.propertyId);
  const initialIndex = useMemo(() => {
    if (!property || !route.params.selectedMediaId) {
      return 0;
    }

    const matchedIndex = property.media.findIndex(
      item => item.id === route.params.selectedMediaId,
    );

    return matchedIndex >= 0 ? matchedIndex : 0;
  }, [property, route.params.selectedMediaId]);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const currentMedia = useMemo(
    () => property?.media[currentIndex],
    [currentIndex, property],
  );

  if (!property) {
    return (
      <ScreenContainer>
        <AppHeader title="Gallery" onBackPress={navigation.goBack} />
        <EmptyState
          description="This property is not available in the local dataset."
          title="Property not found"
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <AppHeader title="Property Gallery" onBackPress={navigation.goBack} />
      <View style={styles.hero}>
        <Text style={styles.counter}>
          {currentIndex + 1} / {property.media.length}
        </Text>
        <Text style={styles.mediaLabel}>
          {currentMedia?.type.toUpperCase() ?? 'IMAGE'}
        </Text>
      </View>
      <View style={styles.previewCard}>
        <Text style={styles.previewTitle}>{property.title}</Text>
        <Text style={styles.previewSubtext}>
          Media ID: {currentMedia?.id ?? 'Unavailable'}
        </Text>
        <Text style={styles.previewSubtext}>
          URI placeholder: {currentMedia?.uri ?? 'Unavailable'}
        </Text>
      </View>
      <View style={styles.controls}>
        <AppButton
          disabled={currentIndex === 0}
          label="Previous"
          onPress={() => setCurrentIndex(index => Math.max(index - 1, 0))}
          style={styles.controlButton}
          variant="outlined"
        />
        <AppButton
          disabled={currentIndex === property.media.length - 1}
          label="Next"
          onPress={() =>
            setCurrentIndex(index => Math.min(index + 1, property.media.length - 1))
          }
          style={styles.controlButton}
          variant="outlined"
        />
      </View>
      <View style={styles.thumbnailRow}>
        {property.media.map((media, index) => (
          <Pressable
            key={media.id}
            onPress={() => setCurrentIndex(index)}
            style={[
              styles.thumbnail,
              index === currentIndex && styles.thumbnailSelected,
            ]}>
            <Text
              style={[
                styles.thumbnailLabel,
                index === currentIndex && styles.thumbnailLabelSelected,
              ]}>
              {index + 1}
            </Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.controls}>
        <AppButton
          label="Share Property"
          onPress={() => {
            void shareProperty(property);
          }}
          style={styles.controlButton}
        />
        <AppButton
          label="Download Placeholder"
          onPress={() => showToast('Download flow will be connected during media integration.')}
          style={styles.controlButton}
          variant="outlined"
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.primary,
    borderRadius: spacing.radiusXl,
    padding: spacing.xl,
    gap: spacing.sm,
  },
  counter: {
    color: colors.accent,
    fontWeight: typography.fontWeight.semiBold,
  },
  mediaLabel: {
    color: colors.white,
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
  },
  previewCard: {
    backgroundColor: colors.white,
    borderRadius: spacing.radiusXl,
    padding: spacing.xl,
    gap: spacing.sm,
  },
  previewTitle: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semiBold,
  },
  previewSubtext: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
  },
  controls: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  controlButton: {
    flex: 1,
  },
  thumbnailRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  thumbnail: {
    width: 48,
    height: 48,
    borderRadius: spacing.radiusMd,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  thumbnailSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  thumbnailLabel: {
    color: colors.textPrimary,
    fontWeight: typography.fontWeight.semiBold,
  },
  thumbnailLabelSelected: {
    color: colors.white,
  },
});
