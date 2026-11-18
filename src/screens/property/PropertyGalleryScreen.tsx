import React, {useMemo, useState} from 'react';
import {Image, Pressable, StyleSheet, Text, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';

import {AppButton, AppHeader, EmptyState, ScreenContainer} from '@/components';
import Icon from 'react-native-vector-icons/Ionicons';
import {colors} from '@/constants/colors';
import {spacing} from '@/constants/spacing';
import {typography} from '@/constants/typography';
import {usePropertyStore} from '@/store/propertyStore';
import type {HomeStackParamList, SavedStackParamList} from '@/types';
import {shareProperty} from '@/utils/propertyActions';

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
          description="The property details are no longer available. Return to the property list and try another listing."
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
          {property.media.length ? `${currentIndex + 1} / ${property.media.length}` : 'No photos available'}
        </Text>
        <Text style={styles.mediaLabel}>
          {currentMedia?.type.toUpperCase() ?? 'NO MEDIA'}
        </Text>
      </View>
      <View style={styles.previewCard}>
        {currentMedia?.type === 'image' && currentMedia.uri ? (
          <Image accessibilityLabel={property.title} resizeMode="cover" source={{uri: currentMedia.uri}} style={styles.previewImage} />
        ) : (
          <View style={styles.mediaFallback}>
            <Icon color={colors.brandPurple} name={currentMedia?.type === 'video' ? 'play-circle-outline' : 'image-outline'} size={38} />
            <Text style={styles.previewSubtext}>{currentMedia?.type === 'video' ? 'Video preview is unavailable.' : 'No preview is available for this media.'}</Text>
          </View>
        )}
        <Text numberOfLines={2} style={styles.previewTitle}>{property.title}</Text>
        <Text style={styles.previewSubtext}>{currentMedia?.type === 'video' ? 'Video' : 'Property photo'} {currentIndex + 1} of {property.media.length}</Text>
      </View>
      <View style={styles.controls}>
        <AppButton
          disabled={!property.media.length || currentIndex === 0}
          label="Previous"
          onPress={() => setCurrentIndex(index => Math.max(index - 1, 0))}
          style={styles.controlButton}
          variant="outlined"
        />
        <AppButton
          disabled={!property.media.length || currentIndex >= property.media.length - 1}
          label="Next"
          onPress={() =>
            setCurrentIndex(index => Math.min(index + 1, Math.max(property.media.length - 1, 0)))
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
      <AppButton label="Share Property" onPress={() => { void shareProperty(property); }} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.darkPurple,
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
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  previewImage: {
    width: '100%',
    aspectRatio: 1.25,
    borderRadius: spacing.radiusMd,
    backgroundColor: colors.background,
  },
  mediaFallback: {
    minHeight: 190,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: spacing.radiusMd,
    backgroundColor: colors.brandPurpleSubtle,
    padding: spacing.xl,
  },
  previewTitle: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semiBold,
    flexShrink: 1,
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
