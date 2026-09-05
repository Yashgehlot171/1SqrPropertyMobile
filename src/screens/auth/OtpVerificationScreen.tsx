import React, {useState} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';

import {AppButton, AppHeader, AppInput, ScreenContainer} from '@/components';
import {colors} from '@/constants/colors';
import {ROUTES} from '@/constants/routes';
import {spacing} from '@/constants/spacing';
import {typography} from '@/constants/typography';
import {sendOtp, verifyOtp} from '@/services/authApi';
import {useAuthStore} from '@/store/authStore';
import type {AuthStackParamList} from '@/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'OtpVerification'>;

export function OtpVerificationScreen({navigation, route}: Props) {
  const [otp, setOtp] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const setPendingMobile = useAuthStore(state => state.setPendingMobile);

  const handleVerifyOtp = async () => {
    setIsVerifying(true);
    setErrorMessage('');

    try {
      const result = await verifyOtp({mobile: route.params.mobile, otp});

      if (!result.verified) {
        setErrorMessage('Unable to verify OTP.');
        return;
      }

      setPendingMobile(route.params.mobile);
      navigation.navigate(ROUTES.auth.roleSelection);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Unable to verify OTP.',
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    setIsResending(true);
    setErrorMessage('');

    try {
      await sendOtp({mobile: route.params.mobile});
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Unable to resend OTP.',
      );
    } finally {
      setIsResending(false);
    }
  };

  return (
    <ScreenContainer>
      <AppHeader
        title="Verify OTP"
        subtitle="Enter the OTP sent to your mobile number"
        onBackPress={navigation.goBack}
      />
      <View style={styles.card}>
      <View style={styles.otpBadge}>
        <Text style={styles.otpBadgeText}>OTP</Text>
      </View>
      <Text style={styles.mobileText}>Mobile: {route.params.mobile}</Text>
      <AppInput
        errorMessage={errorMessage}
        keyboardType="number-pad"
        label="OTP"
        maxLength={6}
        onChangeText={value => {
          setOtp(value.replace(/[^0-9]/g, ''));
          if (errorMessage) {
            setErrorMessage('');
          }
        }}
        required
        value={otp}
      />
      <AppButton
        label="Verify OTP"
        loading={isVerifying}
        onPress={handleVerifyOtp}
      />
      <Pressable disabled={isResending} onPress={handleResendOtp}>
        <Text style={styles.resendLink}>
          {isResending ? 'Resending OTP...' : 'Resend OTP'}
        </Text>
      </Pressable>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: spacing.radiusXl,
    padding: spacing.xl,
    gap: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.darkPurple,
    shadowOpacity: 0.05,
    shadowRadius: 16,
    shadowOffset: {width: 0, height: 10},
    elevation: 2,
  },
  otpBadge: {
    width: 64,
    height: 64,
    borderRadius: 22,
    backgroundColor: colors.purpleLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpBadgeText: {
    color: colors.primary,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
  mobileText: {
    color: colors.textPrimary,
    fontWeight: typography.fontWeight.semiBold,
  },
  resendLink: {
    color: colors.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});
