import React from 'react';
import {
  ActivityIndicator,
  KeyboardTypeOptions,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { typography } from '@/constants/typography';

export function AddPropertyHeader({
  title = 'Add Property',
  step,
  onBackPress,
}: {
  title?: string;
  step: number;
  onBackPress?: () => void;
}) {
  return (
    <View style={styles.header}>
      <Pressable onPress={onBackPress} style={styles.headerButton}>
        <Icon color={colors.textPrimary} name="chevron-back" size={22} />
      </Pressable>
      <View style={styles.headerCopy}>
        <Text style={styles.headerTitle}>{title}</Text>
        <Text style={styles.headerStep}>Step {step} of 5</Text>
      </View>
    </View>
  );
}

export function StepProgress({ step }: { step: number }) {
  return (
    <View style={styles.stepper}>
      {[1, 2, 3, 4, 5].map(item => (
        <React.Fragment key={item}>
          <View
            style={[
              styles.stepCircle,
              item <= step ? styles.stepCircleActive : null,
            ]}
          >
            <Text
              style={[
                styles.stepNumber,
                item <= step ? styles.stepNumberActive : null,
              ]}
            >
              {item}
            </Text>
          </View>
          {item < 5 ? <View style={styles.stepLine} /> : null}
        </React.Fragment>
      ))}
    </View>
  );
}

export function ScreenIntro({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <View style={styles.intro}>
      <Text style={styles.introTitle}>{title}</Text>
      <Text style={styles.introSubtitle}>{subtitle}</Text>
    </View>
  );
}

export function FieldLabel({
  label,
  required,
}: {
  label: string;
  required?: boolean;
}) {
  return (
    <Text style={styles.fieldLabel}>
      {label}
      {required ? <Text style={styles.required}> *</Text> : null}
    </Text>
  );
}

export function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  required,
  errorMessage,
  keyboardType,
  maxLength,
  multiline,
  rightLabel,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  errorMessage?: string;
  keyboardType?: KeyboardTypeOptions;
  maxLength?: number;
  multiline?: boolean;
  rightLabel?: string;
}) {
  return (
    <View style={styles.field}>
      <FieldLabel label={label} required={required} />
      <View
        style={[
          styles.inputWrap,
          multiline ? styles.textAreaWrap : null,
          errorMessage ? styles.inputError : null,
        ]}
      >
        <TextInput
          keyboardType={keyboardType}
          maxLength={maxLength}
          multiline={multiline}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          style={[styles.input, multiline ? styles.textArea : null]}
          textAlignVertical={multiline ? 'top' : 'center'}
          value={value}
        />
        {rightLabel ? (
          <Text style={styles.inputRightLabel}>{rightLabel}</Text>
        ) : null}
      </View>
      {errorMessage ? (
        <Text style={styles.errorText}>{errorMessage}</Text>
      ) : null}
    </View>
  );
}

export function SelectField({
  label,
  value,
  placeholder,
  required,
  onPress,
  disabled,
  errorMessage,
}: {
  label: string;
  value: string;
  placeholder?: string;
  required?: boolean;
  onPress?: () => void;
  disabled?: boolean;
  errorMessage?: string;
}) {
  const content = (
    <View
      style={[
        styles.inputWrap,
        errorMessage ? styles.inputError : null,
        disabled ? styles.inputDisabled : null,
      ]}
    >
      <Text
        numberOfLines={1}
        style={value ? styles.selectValue : styles.selectPlaceholder}
      >
        {value || placeholder || 'Select'}
      </Text>
      <Icon color={colors.textSecondary} name="chevron-down" size={16} />
    </View>
  );

  return (
    <View style={styles.field}>
      <FieldLabel label={label} required={required} />
      {onPress ? (
        <Pressable disabled={disabled} onPress={onPress}>
          {content}
        </Pressable>
      ) : (
        content
      )}
      {errorMessage ? (
        <Text style={styles.errorText}>{errorMessage}</Text>
      ) : null}
    </View>
  );
}

/**
 * Shared loading/error/retry block for option pickers backed by live
 * masterApi/locationApi data, matching the pattern already used in
 * MyPropertiesScreen (ActivityIndicator while loading, inline message +
 * retry button on failure).
 */
export function InlineAsyncState({
  isLoading,
  error,
  onRetry,
  loadingLabel,
  emptyLabel,
}: {
  isLoading: boolean;
  error?: string | null;
  onRetry: () => void;
  loadingLabel: string;
  emptyLabel?: string;
}) {
  if (isLoading) {
    return (
      <View style={styles.inlineState}>
        <ActivityIndicator color={colors.brandPurple} size="small" />
        <Text style={styles.inlineStateText}>{loadingLabel}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.inlineState}>
        <Text style={styles.inlineStateText}>{error}</Text>
        <Pressable onPress={onRetry} style={styles.inlineRetryButton}>
          <Text style={styles.inlineRetryText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  if (emptyLabel) {
    return (
      <View style={styles.inlineState}>
        <Text style={styles.inlineStateText}>{emptyLabel}</Text>
      </View>
    );
  }

  return null;
}

export function OptionChip({
  label,
  isSelected,
  onPress,
}: {
  label: string;
  isSelected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, isSelected ? styles.chipSelected : null]}
    >
      <Text
        style={[styles.chipLabel, isSelected ? styles.chipLabelSelected : null]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function TypeOptionCard({
  icon,
  label,
  isSelected,
  onPress,
}: {
  icon: string;
  label: string;
  isSelected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.typeCard, isSelected ? styles.typeCardSelected : null]}
    >
      <Icon
        color={isSelected ? colors.brandPurple : colors.textPrimary}
        name={icon}
        size={22}
      />
      <Text
        numberOfLines={1}
        style={[
          styles.typeCardText,
          isSelected ? styles.typeCardTextSelected : null,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function Section({
  title,
  required,
  children,
}: {
  title: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <FieldLabel label={title} required={required} />
      {children}
    </View>
  );
}

export function PrimaryButton({
  label,
  onPress,
  disabled,
  loading,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  const isDisabled = Boolean(disabled || loading);
  return (
    <Pressable
      disabled={isDisabled}
      onPress={onPress}
      style={[styles.primaryButton, isDisabled && styles.primaryButtonDisabled]}
    >
      {loading ? (
        <ActivityIndicator color={colors.white} size="small" />
      ) : (
        <Text style={styles.primaryButtonText}>{label}</Text>
      )}
    </Pressable>
  );
}

export function SecondaryTextButton({
  label,
  onPress,
  disabled,
  loading,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  const isDisabled = Boolean(disabled || loading);
  return (
    <Pressable
      disabled={isDisabled}
      onPress={onPress}
      style={[
        styles.secondaryTextButton,
        isDisabled && styles.secondaryTextButtonDisabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.brandPurple} size="small" />
      ) : (
        <Text style={styles.secondaryText}>{label}</Text>
      )}
    </Pressable>
  );
}

export function FieldSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Section title={title}>
      <View style={styles.wrapRow}>{children}</View>
    </Section>
  );
}

export function StepCaption({
  current,
  title,
}: {
  current: string;
  title: string;
}) {
  return (
    <View style={styles.legacyCaption}>
      <Text style={styles.headerStep}>{current}</Text>
      <Text style={styles.introSubtitle}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  headerButton: {
    alignItems: 'center',
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  headerCopy: {
    flex: 1,
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
  headerStep: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    marginTop: spacing.xs,
  },
  stepper: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  stepCircle: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.chipBorder,
    borderRadius: 13,
    borderWidth: 1,
    height: 26,
    justifyContent: 'center',
    width: 26,
  },
  stepCircleActive: {
    backgroundColor: colors.brandPurple,
    borderColor: colors.brandPurple,
  },
  stepNumber: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },
  stepNumberActive: {
    color: colors.white,
  },
  stepLine: {
    backgroundColor: colors.chipBorder,
    height: 1,
    width: 28,
  },
  intro: {
    gap: spacing.xs,
  },
  introTitle: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
  introSubtitle: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.sm,
  },
  field: {
    gap: spacing.sm,
  },
  fieldLabel: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
  },
  required: {
    color: colors.error,
  },
  inputWrap: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.chipBorder,
    borderRadius: spacing.radiusMd,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 48,
    paddingHorizontal: spacing.md,
  },
  inputError: {
    borderColor: colors.error,
  },
  inputDisabled: {
    opacity: 0.6,
  },
  input: {
    color: colors.textPrimary,
    flex: 1,
    fontSize: typography.fontSize.sm,
    minWidth: 0,
    paddingVertical: 0,
  },
  textAreaWrap: {
    alignItems: 'flex-start',
    minHeight: 112,
    paddingVertical: spacing.md,
  },
  textArea: {
    minHeight: 86,
  },
  inputRightLabel: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    marginLeft: spacing.sm,
  },
  selectValue: {
    color: colors.textPrimary,
    flex: 1,
    fontSize: typography.fontSize.sm,
  },
  selectPlaceholder: {
    color: colors.textSecondary,
    flex: 1,
    fontSize: typography.fontSize.sm,
  },
  errorText: {
    color: colors.error,
    fontSize: typography.fontSize.xs,
  },
  inlineState: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  inlineStateText: {
    color: colors.textSecondary,
    flex: 1,
    fontSize: typography.fontSize.xs,
  },
  inlineRetryButton: {
    borderColor: colors.brandPurple,
    borderRadius: spacing.radiusMd,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  inlineRetryText: {
    color: colors.brandPurple,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },
  chip: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.chipBorder,
    borderRadius: 999,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 42,
    paddingHorizontal: spacing.lg,
  },
  chipSelected: {
    backgroundColor: colors.brandPurple,
    borderColor: colors.brandPurple,
  },
  chipLabel: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  chipLabelSelected: {
    color: colors.white,
    fontWeight: typography.fontWeight.bold,
  },
  typeCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.chipBorder,
    borderRadius: spacing.radiusMd,
    borderWidth: 1,
    gap: spacing.sm,
    justifyContent: 'center',
    minHeight: 82,
    padding: spacing.sm,
    width: '30.5%',
  },
  typeCardSelected: {
    backgroundColor: colors.brandPurpleSubtle,
    borderColor: colors.brandPurple,
  },
  typeCardText: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    textAlign: 'center',
  },
  typeCardTextSelected: {
    color: colors.brandPurple,
    fontWeight: typography.fontWeight.bold,
  },
  section: {
    gap: spacing.sm,
  },
  wrapRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: colors.brandPurple,
    borderRadius: spacing.radiusMd,
    justifyContent: 'center',
    minHeight: 52,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  secondaryTextButton: {
    alignItems: 'center',
    minHeight: 42,
    justifyContent: 'center',
  },
  secondaryTextButtonDisabled: {
    opacity: 0.6,
  },
  secondaryText: {
    color: colors.brandPurple,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
  },
  legacyCaption: {
    gap: spacing.xs,
  },
});
