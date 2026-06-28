import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';

import { colors } from '@/constants/colors';
import { ROUTES } from '@/constants/routes';
import { spacing } from '@/constants/spacing';
import { typography } from '@/constants/typography';
import { saveRole } from '@/services/authApi';
import { useAuthStore } from '@/store/authStore';
import type { AuthStackParamList, UserRole } from '@/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'RoleSelection'>;

const roles: UserRole[] = ['buyer', 'seller', 'broker'];

const roleMeta: Record<
  UserRole,
  { title: string; description: string; icon: string }
> = {
  buyer: {
    title: 'Buyer',
    description: 'I want to buy or rent properties',
    icon: 'business-outline',
  },
  seller: {
    title: 'Seller',
    description: 'I want to sell or rent out my property',
    icon: 'key-outline',
  },
  broker: {
    title: 'Broker',
    description: 'I am a property broker/agent',
    icon: 'people-outline',
  },
};

export function RoleSelectionScreen({ navigation }: Props) {
  const currentRole = useAuthStore(state => state.selectedRole ?? 'buyer');
  const setRole = useAuthStore(state => state.setRole);
  const [selectedRole, setSelectedRole] = useState<UserRole>(currentRole);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleContinue = async () => {
    setLoading(true);
    setErrorMessage('');

    try {
      await saveRole(selectedRole);
      setRole(selectedRole);
      navigation.navigate(ROUTES.auth.completeProfile);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Unable to save role.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Pressable
          accessibilityRole="button"
          onPress={navigation.goBack}
          style={styles.backButton}
        >
          <Icon color={colors.textPrimary} name="chevron-back" size={22} />
        </Pressable>

        <View style={styles.header}>
          <Text style={styles.title}>Choose Your Role</Text>
          <Text style={styles.subtitle}>
            Select the option that best describes you
          </Text>
        </View>

        <View style={styles.roleList}>
          {roles.map(role => {
            const isSelected = role === selectedRole;
            const meta = roleMeta[role];

            return (
              <Pressable
                accessibilityRole="button"
                key={role}
                onPress={() => setSelectedRole(role)}
                style={[
                  styles.roleCard,
                  isSelected ? styles.roleCardSelected : null,
                ]}
              >
                <View
                  style={[
                    styles.iconWrap,
                    isSelected ? styles.iconWrapSelected : null,
                  ]}
                >
                  <Icon
                    color={isSelected ? colors.white : colors.iconPurple}
                    name={meta.icon}
                    size={24}
                  />
                </View>
                <View style={styles.roleCopy}>
                  <Text style={styles.roleTitle}>{meta.title}</Text>
                  <Text style={styles.roleDescription}>{meta.description}</Text>
                </View>
                {isSelected ? (
                  <View style={styles.selectedBadge}>
                    <Icon color={colors.white} name="checkmark" size={14} />
                  </View>
                ) : null}
              </Pressable>
            );
          })}
        </View>

        {errorMessage ? (
          <Text style={styles.errorText}>{errorMessage}</Text>
        ) : null}

        <View style={styles.footer}>
          <Pressable
            disabled={loading}
            onPress={handleContinue}
            style={({ pressed }) => [
              styles.continueButton,
              pressed && !loading ? styles.continueButtonPressed : null,
              loading ? styles.continueButtonDisabled : null,
            ]}
          >
            <Text style={styles.continueText}>
              {loading ? 'Saving...' : 'Continue'}
            </Text>
          </Pressable>
          <Text style={styles.footerText}>
            You can change this later from profile settings
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  container: {
    flex: 1,
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.xxl,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -spacing.md,
  },
  header: {
    marginTop: spacing.sm,
    marginBottom: spacing.xxl,
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    lineHeight: typography.lineHeight.lg,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.sm,
    marginTop: spacing.xs,
    maxWidth: 220,
  },
  roleList: {
    gap: spacing.lg,
  },
  roleCard: {
    minHeight: 116,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.roleCardBorder,
    borderRadius: spacing.radiusXl,
    borderWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    shadowColor: colors.roleCardShadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 3,
  },
  roleCardSelected: {
    borderColor: colors.brandPurple,
  },
  iconWrap: {
    width: 58,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 29,
    backgroundColor: colors.brandPurpleSoft,
    marginRight: spacing.lg,
  },
  iconWrapSelected: {
    backgroundColor: colors.brandPurple,
  },
  roleCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  roleTitle: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
  },
  roleDescription: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.xs,
    lineHeight: typography.lineHeight.xs,
  },
  selectedBadge: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: colors.brandPurple,
    marginLeft: spacing.md,
  },
  errorText: {
    color: colors.error,
    fontSize: typography.fontSize.sm,
    marginTop: spacing.md,
  },
  footer: {
    marginTop: 'auto',
    gap: spacing.lg,
  },
  continueButton: {
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: spacing.radiusLg,
    backgroundColor: colors.brandPurple,
    shadowColor: colors.brandPurple,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.24,
    shadowRadius: 18,
    elevation: 5,
  },
  continueButtonPressed: {
    opacity: 0.9,
  },
  continueButtonDisabled: {
    opacity: 0.72,
  },
  continueText: {
    color: colors.white,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
  },
  footerText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.xs,
    lineHeight: typography.lineHeight.xs,
    textAlign: 'center',
  },
});
