import React, {useState} from 'react';
import {StyleSheet, Text} from 'react-native';

import {
  AppButton,
  AppHeader,
  AppInput,
  ScreenContainer,
} from '@/components';
import {colors} from '@/constants/colors';
import {useAuthStore} from '@/store/authStore';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {ProfileStackParamList} from '@/types';
import {showToast} from '@/utils/toast';
import {normalizeApiError} from '@/api';

type Props = NativeStackScreenProps<ProfileStackParamList, 'EditProfile'>;

interface FieldErrors {
  name?: string;
  email?: string;
  city?: string;
  general?: string;
}

function mapFieldErrors(error: unknown): FieldErrors {
  const normalized = normalizeApiError(error);
  const fieldErrors: FieldErrors = {general: normalized.message};

  if (Array.isArray(normalized.errors)) {
    normalized.errors.forEach(item => {
      if (
        item &&
        typeof item === 'object' &&
        'field' in item &&
        'message' in item
      ) {
        const field = String(item.field);
        const message = String(item.message);

        if (field === 'name' || field === 'email' || field === 'city') {
          fieldErrors[field] = message;
        }

        if (field === 'cityId') {
          fieldErrors.city = message;
        }
      }
    });
  }

  return fieldErrors;
}

export function EditProfileScreen({navigation}: Props) {
  const user = useAuthStore(state => state.user);
  const updateUser = useAuthStore(state => state.updateUser);
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [city, setCity] = useState(user?.city ?? '');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  const handleSave = async () => {
    if (loading) {
      return;
    }

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedCity = city.trim();
    const nextErrors: FieldErrors = {};

    if (!trimmedName) {
      nextErrors.name = 'Name is required.';
    }

    if (!/^\S+@\S+\.\S+$/.test(trimmedEmail)) {
      nextErrors.email = 'Enter a valid email address.';
    }

    if (!trimmedCity) {
      nextErrors.city = 'City is required.';
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      await updateUser({
        name: trimmedName,
        email: trimmedEmail,
        cityId: user?.cityId,
      });
      showToast('Profile updated successfully.');
      navigation.goBack();
    } catch (error) {
      setErrors(mapFieldErrors(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <AppHeader
        title="Edit Profile"
        subtitle="Update your local account details"
        onBackPress={navigation.goBack}
      />
      <AppInput
        errorMessage={errors.name}
        label="Name"
        onChangeText={value => {
          setName(value);
          if (errors.name || errors.general) {
            setErrors(current => ({
              ...current,
              name: undefined,
              general: undefined,
            }));
          }
        }}
        required
        value={name}
      />
      <AppInput
        errorMessage={errors.email}
        keyboardType="email-address"
        label="Email"
        onChangeText={value => {
          setEmail(value);
          if (errors.email || errors.general) {
            setErrors(current => ({
              ...current,
              email: undefined,
              general: undefined,
            }));
          }
        }}
        required
        value={email}
      />
      <AppInput
        errorMessage={errors.city}
        label="City"
        onChangeText={value => {
          setCity(value);
          if (errors.city || errors.general) {
            setErrors(current => ({
              ...current,
              city: undefined,
              general: undefined,
            }));
          }
        }}
        required
        value={city}
      />
      {errors.general ? (
        <Text style={styles.errorText}>{errors.general}</Text>
      ) : null}
      <AppButton
        label="Save Changes"
        loading={loading}
        onPress={handleSave}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  errorText: {
    color: colors.error,
  },
});
