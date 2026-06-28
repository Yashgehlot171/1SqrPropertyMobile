import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {ROUTES} from '@/constants/routes';
import {
  EditProfileScreen,
  LeadDetailScreen,
  LeadListScreen,
  PortfolioDashboardScreen,
  ProfileScreen,
  SettingsScreen,
} from '@/navigation/screenExports';
import type {ProfileStackParamList} from '@/types';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen component={ProfileScreen} name={ROUTES.profile.profile} />
      <Stack.Screen component={EditProfileScreen} name={ROUTES.profile.editProfile} />
      <Stack.Screen component={SettingsScreen} name={ROUTES.profile.settings} />
      <Stack.Screen component={PortfolioDashboardScreen} name={ROUTES.portfolio.portfolioDashboard} />
      <Stack.Screen component={LeadListScreen} name={ROUTES.portfolio.leadList} />
      <Stack.Screen component={LeadDetailScreen} name={ROUTES.portfolio.leadDetail} />
    </Stack.Navigator>
  );
}
