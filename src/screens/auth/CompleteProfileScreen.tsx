import React, {useCallback, useEffect, useState} from 'react';
import {StyleSheet, Text} from 'react-native';

import {AppButton, AppHeader, AppInput, LocationMasterPicker, ScreenContainer, UploadBox} from '@/components';
import {colors} from '@/constants/colors';
import {getCitiesByState, getStates} from '@/services/locationApi';
import type {MasterRecord} from '@/services/masterApi';
import {completeProfile} from '@/services/authApi';
import {useAuthStore} from '@/store/authStore';

interface FieldErrors {name?: string; email?: string; state?: string; city?: string; address?: string; general?: string}

export function CompleteProfileScreen() {
  const selectedRole = useAuthStore(state => state.selectedRole ?? 'buyer');
  const pendingMobile = useAuthStore(state => state.pendingMobile ?? '');
  const login = useAuthStore(state => state.login);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [stateId, setStateId] = useState<number>();
  const [stateName, setStateName] = useState('');
  const [cityId, setCityId] = useState<number>();
  const [cityName, setCityName] = useState('');
  const [address, setAddress] = useState('');
  const [states, setStates] = useState<MasterRecord[]>([]);
  const [cities, setCities] = useState<MasterRecord[]>([]);
  const [statesLoading, setStatesLoading] = useState(true);
  const [citiesLoading, setCitiesLoading] = useState(false);
  const [statesError, setStatesError] = useState('');
  const [citiesError, setCitiesError] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);

  const loadStates = useCallback(async () => {
    setStatesLoading(true); setStatesError('');
    try {setStates((await getStates()).items);} catch {setStatesError('Unable to load States. Check your connection and retry.');} finally {setStatesLoading(false);}
  }, []);
  const loadCities = useCallback(async (selectedStateId: number) => {
    setCitiesLoading(true); setCitiesError('');
    try {setCities((await getCitiesByState(selectedStateId)).items);} catch {setCities([]); setCitiesError('Unable to load Cities for this State. Check your connection and retry.');} finally {setCitiesLoading(false);}
  }, []);

  useEffect(() => {void loadStates();}, [loadStates]);
  useEffect(() => {
    let active = true;
    if (!stateId) {setCities([]); setCitiesError(''); return () => {active = false;};}
    setCitiesLoading(true); setCitiesError('');
    getCitiesByState(stateId).then(result => {if (active) setCities(result.items);}).catch(() => {if (active) {setCities([]); setCitiesError('Unable to load Cities for this State. Check your connection and retry.');}}).finally(() => {if (active) setCitiesLoading(false);});
    return () => {active = false;};
  }, [stateId]);

  const clearFieldError = (field: keyof FieldErrors) => setErrors(current => ({...current, [field]: undefined, general: undefined}));
  const handleSaveProfile = async () => {
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

    setLoading(true); setErrors({});
    try {
      const session = await completeProfile({name: trimmedName, email: trimmedEmail, stateId, cityId, city: cityName, address: trimmedAddress, mobile: pendingMobile, selectedRole, avatarFileId: undefined});
      login(session);
    } catch (error) {
      setErrors({general: error instanceof Error ? error.message : 'Unable to save profile.'});
    } finally {setLoading(false);}
  };

  return <ScreenContainer>
    <AppHeader title="Complete Profile" subtitle="Finish setup before entering the app"/>
    <Text style={styles.metaText}>Mobile: {pendingMobile} | Role: {selectedRole}</Text>
    <UploadBox title="Profile Image" subtitle="Placeholder upload box for local workflow"/>
    <AppInput errorMessage={errors.name} label="Name" onChangeText={value => {setName(value); clearFieldError('name');}} required value={name}/>
    <AppInput errorMessage={errors.email} keyboardType="email-address" autoCapitalize="none" label="Email" onChangeText={value => {setEmail(value); clearFieldError('email');}} required value={email}/>
    <LocationMasterPicker label="State" value={stateName} placeholder="Select State" items={states} loading={statesLoading} errorMessage={errors.state || statesError} onRetry={loadStates} onSelect={item => {setStateId(item.id); setStateName(item.name); setCityId(undefined); setCityName(''); setCities([]); setCitiesError(''); clearFieldError('state'); clearFieldError('city');}}/>
    <LocationMasterPicker label="City" value={cityName} placeholder="Select City" items={cities} loading={citiesLoading} disabled={!stateId} errorMessage={errors.city || citiesError} onRetry={() => {if (stateId) void loadCities(stateId);}} onSelect={item => {setCityId(item.id); setCityName(item.name); clearFieldError('city');}}/>
    <AppInput errorMessage={errors.address} label="Address" multiline numberOfLines={4} textAlignVertical="top" placeholder="House / Flat, building, street, colony or landmark" onChangeText={value => {setAddress(value); clearFieldError('address');}} required value={address}/>
    {errors.general ? <Text style={styles.errorText}>{errors.general}</Text> : null}
    <AppButton label="Save Profile" loading={loading} onPress={handleSaveProfile}/>
  </ScreenContainer>;
}

const styles = StyleSheet.create({metaText: {color: colors.textSecondary}, errorText: {color: colors.error}});
