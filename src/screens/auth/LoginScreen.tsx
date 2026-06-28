import React, { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';

import { ROUTES } from '@/constants/routes';
import { sendOtp } from '@/services/authApi';
import { useAuthStore } from '@/store/authStore';
import type { AuthStackParamList } from '@/types';
import { Colors } from '@/Themes';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

const loginHomeImage = require('@/assets/login_home.png');

export function LoginScreen({ navigation }: Props) {
  const [mobile, setMobile] = useState('9998887776');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const setPendingMobile = useAuthStore(state => state.setPendingMobile);
  const { width } = useWindowDimensions();

  const heroWidth = Math.min(width * 0.76, 310);
  const heroHeight = heroWidth * 0.74;

  const handleSendOtp = async () => {
    setLoading(true);
    setErrorMessage('');

    try {
      const response = await sendOtp({ mobile });
      setPendingMobile(response.mobile);
      navigation.navigate(ROUTES.auth.otpVerification, {
        mobile: response.mobile,
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Unable to send OTP.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          bounces={false}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.welcomeText}>Welcome to</Text>
            <Text style={styles.brandText}>1Square Property</Text>
            <Text style={styles.subtitle}>Login / Signup to continue</Text>
          </View>

          <Image
            resizeMode="contain"
            source={loginHomeImage}
            style={[
              styles.heroImage,
              {
                width: heroWidth,
                height: heroHeight,
              },
            ]}
          />

          <View style={styles.form}>
            <Text style={styles.fieldLabel}>
              Mobile Number <Text style={styles.required}>*</Text>
            </Text>
            <View
              style={[
                styles.phoneField,
                errorMessage ? styles.phoneFieldError : null,
              ]}
            >
              <View style={styles.phoneIcon}>
                <Icon color={Colors.brandPurple} name="call-outline" size={15} />
              </View>
              <Text style={styles.countryCode}>+91</Text>
              <View style={styles.divider} />
              <TextInput
                keyboardType="number-pad"
                maxLength={10}
                onChangeText={value => {
                  setMobile(value.replace(/[^0-9]/g, ''));
                  if (errorMessage) {
                    setErrorMessage('');
                  }
                }}
                placeholder="Enter Mobile Number"
                placeholderTextColor={Colors.neutralIcon}
                style={styles.phoneInput}
                value={mobile}
              />
            </View>
            {errorMessage ? (
              <Text style={styles.errorText}>{errorMessage}</Text>
            ) : null}

            <Pressable
              disabled={loading}
              onPress={handleSendOtp}
              style={({ pressed }) => [
                styles.otpButton,
                pressed && !loading ? styles.otpButtonPressed : null,
                loading ? styles.otpButtonDisabled : null,
              ]}
            >
              <Text style={styles.otpButtonText}>
                {loading ? 'Sending...' : 'Send OTP'}
              </Text>
            </Pressable>

            <View style={styles.orRow}>
              <View style={styles.orLine} />
              <Text style={styles.orText}>or continue with</Text>
              <View style={styles.orLine} />
            </View>

            <View style={styles.socialRow}>
              <Pressable style={styles.socialButton}>
                <Icon color={Colors.info} name="logo-google" size={18} />
                <Text style={styles.socialText}>Google</Text>
              </Pressable>
              <Pressable style={styles.socialButton}>
                <Icon color={Colors.textPrimary} name="logo-apple" size={20} />
                <Text style={styles.socialText}>Apple</Text>
              </Pressable>
            </View>
          </View>

          <Text style={styles.termsText}>
            By continuing you agree to our Terms of Services & Privacy Policy
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingBottom: 22,
    paddingTop: 20,
  },
  header: {
    width: '100%',
    alignItems: 'flex-start',
    marginTop: 8,
  },
  welcomeText: {
       color: Colors.text.primary,
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 35,
    textAlign: 'left',
  },
  brandText: {
    color: Colors.text.primary,
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 35,
    textAlign: 'left',
  },
  subtitle: {
    color: Colors.text.secondary,
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
    textAlign: 'left',marginLeft:4
  },
  heroImage: {
    marginBottom: 24,
    marginTop: 32,
  },
  form: {
    width: '100%',
    maxWidth: 390,
  },
  fieldLabel: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  required: {
    color: Colors.error,
  },
  phoneField: {
    minHeight: 58,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.chipBorder,
    backgroundColor: Colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    shadowColor: Colors.homeCardShadow,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 22,
    elevation: 4,
  },
  phoneFieldError: {
    borderColor: Colors.error,
  },
  phoneIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.brandPurpleSubtle,
    marginRight: 10,
  },
  countryCode: {
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  divider: {
    width: 1,
    height: 22,
    backgroundColor: Colors.divider,
    marginHorizontal: 12,
  },
  phoneInput: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
    minWidth: 0,
    paddingVertical: 0,
  },
  errorText: {
    color: Colors.error,
    fontSize: 12,
    fontWeight: '500',
    marginTop: 8,
  },
  otpButton: {
    minHeight: 56,
    borderRadius: 18,
    backgroundColor: Colors.buttonBG,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    shadowColor: Colors.brandPurple,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.26,
    shadowRadius: 20,
    elevation: 5,
  },
  otpButtonPressed: {
    opacity: 0.9,
  },
  otpButtonDisabled: {
    opacity: 0.72,
  },
  otpButtonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '800',
  },
  orRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 28,
    marginBottom: 18,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.divider,
  },
  orText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    marginHorizontal: 12,
  },
  socialRow: {
    flexDirection: 'row',
    gap: 14,
  },
  socialButton: {
    flex: 1,
    minHeight: 54,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.roleCardBorder,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    shadowColor: Colors.homeCardShadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 2,
  },
  socialText: {
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  termsText: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 17,
    marginTop: 'auto',
    paddingTop: 24,
    textAlign: 'center',
    width: '100%',
  },
});
