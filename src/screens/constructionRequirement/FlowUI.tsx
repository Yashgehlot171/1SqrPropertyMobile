import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { KeyboardAwareScrollView } from '@/components';

export const flow = {
  blue: '#0867E8',
  blueSoft: '#EAF3FF',
  ink: '#0E1B32',
  muted: '#52627A',
  line: '#E3EAF2',
  surface: '#FFFFFF',
  background: '#F9FBFE',
  green: '#109B53',
  greenSoft: '#E5F8EC',
  red: '#D63736',
  amber: '#E9A21B',
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
  secondary?: { label: string; onPress: () => void };
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
  headerTitle: { fontSize: 16, fontWeight: '700', color: flow.ink },
  progressWrap: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: flow.surface,
  },
  progressTrack: {
    flex: 1,
    height: 5,
    borderRadius: 5,
    backgroundColor: '#DCE8F7',
    overflow: 'hidden',
  },
  progressFill: { height: 5, borderRadius: 5, backgroundColor: flow.blue },
  progressText: { fontSize: 11, color: flow.muted, fontWeight: '600' },
  content: { padding: 18, paddingBottom: 28, gap: 16 },
  footer: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 12,
    gap: 8,
    backgroundColor: flow.surface,
    borderTopWidth: 1,
    borderTopColor: flow.line,
  },
  button: {
    minHeight: 47,
    borderRadius: 5,
    backgroundColor: flow.blue,
    borderColor: flow.blue,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  outlineButton: { backgroundColor: flow.surface },
  disabled: { opacity: 0.5 },
  buttonText: { fontSize: 13, fontWeight: '700', color: flow.surface },
  outlineText: { color: flow.blue },
  section: { gap: 10 },
  sectionTitle: { color: flow.ink, fontSize: 15, fontWeight: '700' },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: flow.line,
  },
  infoLabel: { fontSize: 12, color: flow.muted, flex: 1 },
  infoValue: {
    fontSize: 12,
    color: flow.ink,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  infoStrong: { fontSize: 15, color: flow.blue, fontWeight: '800' },
});
