import React, {useState} from 'react';

import {
  AppButton,
  AppHeader,
  AppInput,
  ScreenContainer,
} from '@/components';
import {useAuthStore} from '@/store/authStore';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {ProfileStackParamList} from '@/types';
import {showToast} from '@/utils/toast';

type Props = NativeStackScreenProps<ProfileStackParamList, 'EditProfile'>;

export function EditProfileScreen({navigation}: Props) {
  const user = useAuthStore(state => state.user);
  const updateUser = useAuthStore(state => state.updateUser);
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [city, setCity] = useState(user?.city ?? '');

  return (
    <ScreenContainer>
      <AppHeader
        title="Edit Profile"
        subtitle="Update your local account details"
        onBackPress={navigation.goBack}
      />
      <AppInput label="Name" onChangeText={setName} required value={name} />
      <AppInput
        keyboardType="email-address"
        label="Email"
        onChangeText={setEmail}
        required
        value={email}
      />
      <AppInput label="City" onChangeText={setCity} required value={city} />
      <AppButton
        label="Save Changes"
        onPress={async () => {
          if (!name.trim() || !email.trim() || !city.trim()) {
            showToast('Name, email and city are required.');
            return;
          }

          await updateUser({
            name: name.trim(),
            email: email.trim(),
            city: city.trim(),
          });
          showToast('Profile updated locally.');
          navigation.goBack();
        }}
      />
    </ScreenContainer>
  );
}
