import React, {useCallback, useEffect, useRef, useState} from 'react';
import {ActivityIndicator, StyleSheet, Text, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';

import {normalizeApiError} from '@/api';
import {AppButton, AppHeader, AppInput, LocationMasterPicker, ScreenContainer} from '@/components';
import {colors} from '@/constants/colors';
import {getCitiesByState, getStates} from '@/services/locationApi';
import type {MasterRecord} from '@/services/masterApi';
import {useAuthStore} from '@/store/authStore';
import type {ProfileStackParamList} from '@/types';
import {showToast} from '@/utils/toast';

type Props = NativeStackScreenProps<ProfileStackParamList, 'EditProfile'>;
interface FieldErrors {name?: string; email?: string; state?: string; city?: string; address?: string; general?: string}

function mapFieldErrors(error: unknown): FieldErrors {
  const normalized = normalizeApiError(error);
  const fieldErrors: FieldErrors = {general: normalized.message};
  normalized.errors?.forEach(item => {
    if (!item || typeof item !== 'object' || !('field' in item) || !('message' in item)) return;
    const field = String(item.field);
    const message = String(item.message);
    if (field === 'name' || field === 'email' || field === 'state' || field === 'address') fieldErrors[field] = message;
    if (field === 'cityId') fieldErrors.city = message;
  });
  return fieldErrors;
}

export function EditProfileScreen({navigation}: Props) {
  const user = useAuthStore(state => state.user);
  const updateUser = useAuthStore(state => state.updateUser);
  const refreshProfile = useAuthStore(state => state.refreshProfile);
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [stateId, setStateId] = useState<number>();
  const [stateName, setStateName] = useState('');
  const [cityId, setCityId] = useState<number>();
  const [cityName, setCityName] = useState('');
  const [address, setAddress] = useState('');
  const selectedStateId = useRef<number | undefined>(undefined);
  const [states, setStates] = useState<MasterRecord[]>([]);
  const [cities, setCities] = useState<MasterRecord[]>([]);
  const [statesLoading, setStatesLoading] = useState(true);
  const [citiesLoading, setCitiesLoading] = useState(false);
  const [statesError, setStatesError] = useState('');
  const [citiesError, setCitiesError] = useState('');
  const [profileLoading, setProfileLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  const loadStates = useCallback(async () => {
    setStatesLoading(true); setStatesError('');
    try {setStates((await getStates()).items);} catch {setStatesError('Unable to load States. Check your connection and retry.');} finally {setStatesLoading(false);}
  }, []);
  const loadCities = useCallback(async (requestedStateId: number) => {
    setCitiesLoading(true); setCitiesError('');
    try {
      const items = (await getCitiesByState(requestedStateId)).items;
      if (selectedStateId.current === requestedStateId) setCities(items);
      return items;
    } catch {
      if (selectedStateId.current === requestedStateId) {setCities([]); setCitiesError('Unable to load Cities for this State. Check your connection and retry.');}
      return [];
    } finally {if (selectedStateId.current === requestedStateId) setCitiesLoading(false);}
  }, []);

  useEffect(() => {
    let active = true;
    const initialize = async () => {
      setProfileLoading(true);
      setStatesLoading(true);
      try {
        await refreshProfile().catch(() => undefined);
        if (!active) return;
        const latestUser = useAuthStore.getState().user;
        const stateItems = (await getStates()).items;
        if (!active) return;
        setStates(stateItems);
        setStatesError('');

        if (latestUser) {
          setName(latestUser.name ?? '');
          setEmail(latestUser.email ?? '');
          setAddress(latestUser.address ?? '');
          const savedState = stateItems.find(item => item.id === latestUser.stateId) ??
            stateItems.find(item => item.name.toLowerCase() === latestUser.stateName?.toLowerCase());
          if (savedState) {
            selectedStateId.current = savedState.id;
            setStateId(savedState.id);
            setStateName(savedState.name);
            const cityItems = await loadCities(savedState.id);
            if (!active) return;
            const savedCity = cityItems.find(item => item.id === latestUser.cityId);
            setCityId(savedCity?.id);
            setCityName(savedCity?.name ?? '');
          } else {
            selectedStateId.current = undefined;
            setStateId(undefined);
            setStateName('');
            setCityId(undefined);
            setCityName('');
            setCities([]);
          }
        }
      } catch {
        if (active) setStatesError('Unable to load States. Check your connection and retry.');
      } finally {
        if (active) {setStatesLoading(false); setProfileLoading(false);}
      }
    };
    void initialize();
    return () => {active = false;};
  }, [loadCities, refreshProfile]);

  const clearFieldError = (field: keyof FieldErrors) => setErrors(current => ({...current, [field]: undefined, general: undefined}));
  const handleSave = async () => {
    if (saving) return;
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedAddress = address.trim();
    const nextErrors: FieldErrors = {};
    if (!trimmedName) nextErrors.name = 'Name is required.';
    if (!/^\S+@\S+\.\S+$/.test(trimmedEmail)) nextErrors.email = 'Enter a valid email address.';
    if (!stateId) nextErrors.state = 'State is required.';
    if (!cityId) nextErrors.city = 'City is required.';
    if (!trimmedAddress) nextErrors.address = 'Address is required.';
    if (Object.keys(nextErrors).length) {setErrors(nextErrors); return;}

    setSaving(true); setErrors({});
    try {
      await updateUser({name: trimmedName, email: trimmedEmail, cityId, address: trimmedAddress});
      showToast('Profile updated successfully.');
      navigation.goBack();
    } catch (error) {
      setErrors(mapFieldErrors(error));
    } finally {setSaving(false);}
  };

  if (profileLoading) return <ScreenContainer scrollable={false}><View style={styles.center}><ActivityIndicator color={colors.primary}/><Text style={styles.helper}>Loading profile…</Text></View></ScreenContainer>;

  return <ScreenContainer>
    <AppHeader title="Edit Profile" subtitle="Update your account details" onBackPress={navigation.goBack}/>
    <AppInput errorMessage={errors.name} label="Name" onChangeText={value => {setName(value); clearFieldError('name');}} required value={name}/>
    <AppInput errorMessage={errors.email} keyboardType="email-address" autoCapitalize="none" label="Email" onChangeText={value => {setEmail(value); clearFieldError('email');}} required value={email}/>
    <LocationMasterPicker label="State" value={stateName} placeholder="Select State" items={states} loading={statesLoading} errorMessage={errors.state || statesError} onRetry={loadStates} onSelect={item => {selectedStateId.current = item.id; setStateId(item.id); setStateName(item.name); setCityId(undefined); setCityName(''); setCities([]); setCitiesError(''); clearFieldError('state'); clearFieldError('city'); void loadCities(item.id);}}/>
    <LocationMasterPicker label="City" value={cityName} placeholder="Select City" items={cities} loading={citiesLoading} disabled={!stateId} errorMessage={errors.city || citiesError} onRetry={() => {if (stateId) void loadCities(stateId);}} onSelect={item => {setCityId(item.id); setCityName(item.name); clearFieldError('city');}}/>
    <AppInput errorMessage={errors.address} label="Address" multiline numberOfLines={4} textAlignVertical="top" placeholder="House / Flat, building, street, colony or landmark" onChangeText={value => {setAddress(value); clearFieldError('address');}} required value={address}/>
    {errors.general ? <Text style={styles.error}>{errors.general}</Text> : null}
    <AppButton label="Save Changes" loading={saving} onPress={handleSave}/>
  </ScreenContainer>;
}

const styles = StyleSheet.create({center: {flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12}, helper: {color: colors.textSecondary}, error: {color: colors.error}});
