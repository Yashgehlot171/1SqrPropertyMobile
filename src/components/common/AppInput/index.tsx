import React from 'react';
import {
  KeyboardTypeOptions,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';

import {colors} from '@/constants/colors';
import {spacing} from '@/constants/spacing';
import {typography} from '@/constants/typography';

interface AppInputProps extends TextInputProps {
  label?: string;
  errorMessage?: string;
  keyboardType?: KeyboardTypeOptions;
  required?: boolean;
}

export function AppInput({
  label,
  errorMessage,
  style,
  multiline,
  required,
  ...rest
}: AppInputProps) {
  return (
    <View style={styles.container}>
      {label ? (
        <Text style={styles.label}>
          {label}
          {required ? <Text style={styles.required}> *</Text> : null}
        </Text>
      ) : null}
      <TextInput
        placeholderTextColor={colors.textSecondary}
        style={[styles.input, multiline && styles.multiline, style]}
        multiline={multiline}
        {...rest}
      />
      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  label: {
    fontSize: typography.fontSize.sm,
    color: colors.textPrimary,
    fontWeight: typography.fontWeight.semiBold,
  },
  input: {
    minHeight: 48,
    borderRadius: spacing.radiusMd,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    color: colors.textPrimary,
    fontSize: typography.fontSize.sm,
  },
  multiline: {
    minHeight: 120,
    paddingTop: spacing.lg,
    textAlignVertical: 'top',
  },
  error: {
    color: colors.error,
    fontSize: typography.fontSize.xs,
  },
  required: {
    color: colors.error,
  },
});
