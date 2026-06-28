import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';

import {colors} from '@/constants/colors';
import {spacing} from '@/constants/spacing';
import {typography} from '@/constants/typography';

type AppButtonVariant = 'primary' | 'secondary' | 'outlined' | 'danger';

interface AppButtonProps {
  label: string;
  onPress?: () => void;
  variant?: AppButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

const variantStyles: Record<AppButtonVariant, ViewStyle> = {
  primary: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.darkPurple,
    borderColor: colors.secondary,
  },
  outlined: {
    backgroundColor: colors.white,
    borderColor: colors.border,
  },
  danger: {
    backgroundColor: colors.error,
    borderColor: colors.error,
  },
};

export function AppButton({
  label,
  onPress,
  variant = 'primary',
  disabled,
  loading,
  style,
}: AppButtonProps) {
  const textColor = variant === 'outlined' ? colors.primary : colors.white;
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      onPress={onPress}
      style={({pressed}) => [
        styles.button,
        variantStyles[variant],
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={[styles.label, {color: textColor}]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    borderRadius: spacing.radiusMd,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    shadowColor: colors.primary,
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: 6},
    elevation: 3,
  },
  label: {
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.md,
    fontWeight: typography.fontWeight.bold,
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.86,
    transform: [{scale: 0.99}],
  },
});
