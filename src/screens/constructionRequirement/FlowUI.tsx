import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { KeyboardAwareScrollView } from '@/components';
import {colors} from '@/constants/colors';
import {spacing} from '@/constants/spacing';
import {typography} from '@/constants/typography';

export const flow = {
  blue: colors.primary,
  blueSoft: colors.primarySoft,
  ink: colors.textPrimary,
  muted: colors.textSecondary,
  line: colors.border,
  surface: colors.surface,
  background: colors.background,
  green: colors.success,
  greenSoft: colors.successSoft,
  red: colors.error,
  amber: colors.accent,
};

export function FlowPage({
  title,
  onBack,
  step,
  totalSteps = 5,
  children,
  primary,
  secondary,
}: {
  title: string;
  onBack: () => void;
  step?: number;
  totalSteps?: number;
  children: React.ReactNode;
  primary?: {
    label: string;
    onPress: () => void;
    disabled?: boolean;
    loading?: boolean;
  };
  secondary?: { label: string; onPress: () => void; disabled?: boolean; loading?: boolean };
}) {
  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safe}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          onPress={onBack}
          style={styles.back}
        >
          <Icon name="chevron-back" size={23} color={flow.ink} />
        </Pressable>
        <Text style={styles.headerTitle}>{title}</Text>
        <View style={styles.back} />
      </View>
      {step ? (
        <View style={styles.progressWrap}>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.min(100, (step / totalSteps) * 100)}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {step} of {totalSteps}
          </Text>
        </View>
      ) : null}
      <KeyboardAwareScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </KeyboardAwareScrollView>
      {primary || secondary ? (
        <View style={styles.footer}>
          {primary ? <FlowButton {...primary} /> : null}
          {secondary ? <FlowButton {...secondary} outline /> : null}
        </View>
      ) : null}
    </SafeAreaView>
  );
}

export function FlowButton({
  label,
  onPress,
  outline = false,
  disabled = false,
  loading = false,
}: {
  label: string;
  onPress: () => void;
  outline?: boolean;
  disabled?: boolean;
  loading?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={onPress}
      style={[
        styles.button,
        outline && styles.outlineButton,
        (disabled || loading) && styles.disabled,
      ]}
    >
      <Text style={[styles.buttonText, outline && styles.outlineText]}>
        {loading ? 'Please wait...' : label}
      </Text>
    </Pressable>
  );
}

export function FlowSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

export function FlowState({
  icon = 'information-circle-outline',
  title,
  message,
}: {
  icon?: string;
  title: string;
  message: string;
}) {
  return (
    <View style={styles.stateCard}>
      <View style={styles.stateIcon}>
        <Icon name={icon} size={24} color={flow.blue} />
      </View>
      <Text style={styles.stateTitle}>{title}</Text>
      <Text style={styles.stateMessage}>{message}</Text>
    </View>
  );
}

export function FlowInfo({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, strong && styles.infoStrong]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: flow.background },
  header: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    backgroundColor: flow.surface,
    borderBottomWidth: 1,
    borderBottomColor: flow.line,
  },
  back: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: typography.fontSize.md, lineHeight: typography.lineHeight.md, fontWeight: typography.fontWeight.bold, color: colors.darkPurple },
  progressWrap: {
    paddingHorizontal: spacing.screenHorizontal,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: flow.surface,
  },
  progressTrack: {
    flex: 1,
    height: spacing.xs,
    borderRadius: spacing.radiusPill,
    backgroundColor: colors.primarySoft,
    overflow: 'hidden',
  },
  progressFill: { height: spacing.xs, borderRadius: spacing.radiusPill, backgroundColor: flow.blue },
  progressText: { fontSize: typography.fontSize.xs, color: flow.muted, fontWeight: typography.fontWeight.semiBold },
  content: { width: '100%', padding: spacing.lg, paddingBottom: spacing.xxxl, gap: spacing.lg },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    gap: 8,
    backgroundColor: flow.surface,
    borderTopWidth: 1,
    borderTopColor: flow.line,
  },
  button: {
    minHeight: spacing.buttonHeight,
    borderRadius: spacing.radiusLg,
    backgroundColor: flow.blue,
    borderColor: flow.blue,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  outlineButton: { backgroundColor: flow.surface },
  disabled: { opacity: 0.5 },
  buttonText: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.bold, color: flow.surface },
  outlineText: { color: flow.blue },
  section: { gap: spacing.md },
  sectionTitle: { color: flow.ink, ...typography.styles.sectionTitle },
  stateCard: { alignItems: 'center', gap: spacing.md, padding: spacing.xl, borderRadius: spacing.radiusLg, borderWidth: 1, borderColor: flow.line, backgroundColor: flow.surface },
  stateIcon: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: spacing.radiusMd, backgroundColor: flow.blueSoft },
  stateTitle: { textAlign: 'center', color: colors.darkPurple, ...typography.styles.cardTitle },
  stateMessage: { textAlign: 'center', color: flow.muted, ...typography.styles.bodySmall },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: flow.line,
  },
  infoLabel: { ...typography.styles.bodySmall, color: flow.muted, flex: 1 },
  infoValue: {
    ...typography.styles.bodySmall,
    color: flow.ink,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
    flexShrink: 1,
  },
  infoStrong: {fontSize: typography.fontSize.md, lineHeight: typography.lineHeight.md, color: flow.blue, fontWeight: typography.fontWeight.bold},
});
