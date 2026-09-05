import React, {useState} from 'react';
import {StyleSheet, Text} from 'react-native';

import {
  AppButton,
  AppHeader,
  AppInput,
  ScreenContainer,
  UploadBox,
} from '@/components';
import {colors} from '@/constants/colors';
import {completeProfile} from '@/services/authApi';
import {useAuthStore} from '@/store/authStore';

export function CompleteProfileScreen() {
  const selectedRole = useAuthStore(state => state.selectedRole ?? 'buyer');
  const pendingMobile = useAuthStore(
    state => state.pendingMobile ?? '',
  );
  const login = useAuthStore(state => state.login);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSaveProfile = async () => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedCity = city.trim();

    if (!trimmedName) {
      setErrorMessage('Name is required.');
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(trimmedEmail)) {
      setErrorMessage('Enter a valid email address.');
      return;
    }

    if (!trimmedCity) {
      setErrorMessage('City is required.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const session = await completeProfile({
        name: trimmedName,
        email: trimmedEmail,
        city: trimmedCity,
        avatarFileId: undefined,
        mobile: pendingMobile,
        selectedRole,
      });
      login(session);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Unable to save profile.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <AppHeader
        title="Complete Profile"
        subtitle="Finish setup before entering the app"
      />
      <Text style={styles.metaText}>
        Mobile: {pendingMobile} | Role: {selectedRole}
      </Text>
      <UploadBox
        title="Profile Image"
        subtitle="Placeholder upload box for local workflow"
      />
      <AppInput
        errorMessage={errorMessage === 'Name is required.' ? errorMessage : undefined}
        label="Name"
        onChangeText={value => {
          setName(value);
          if (errorMessage) {
            setErrorMessage('');
          }
        }}
        required
        value={name}
      />
      <AppInput
        errorMessage={
          errorMessage === 'Enter a valid email address.'
            ? errorMessage
            : undefined
        }
        keyboardType="email-address"
        label="Email"
        onChangeText={value => {
          setEmail(value);
          if (errorMessage) {
            setErrorMessage('');
          }
        }}
        required
        value={email}
      />
      <AppInput
        errorMessage={errorMessage === 'City is required.' ? errorMessage : undefined}
        label="City"
        onChangeText={value => {
          setCity(value);
          if (errorMessage) {
            setErrorMessage('');
          }
        }}
        required
        value={city}
      />
      {errorMessage &&
      errorMessage !== 'Name is required.' &&
      errorMessage !== 'Enter a valid email address.' &&
      errorMessage !== 'City is required.' ? (
        <Text style={styles.errorText}>{errorMessage}</Text>
      ) : null}
      <AppButton
        label="Save Profile"
        loading={loading}
        onPress={handleSaveProfile}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  metaText: {
    color: colors.textSecondary,
  },
  errorText: {
    color: colors.error,
  },
});
