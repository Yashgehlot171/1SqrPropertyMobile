import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {ROUTES} from '@/constants/routes';
import {
  CompleteProfileScreen,
  LoginScreen,
  OtpVerificationScreen,
  RoleSelectionScreen,
  SplashScreen,
} from '@/navigation/screenExports';
import type {AuthStackParamList} from '@/types';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthNavigator() {
  return (
    <Stack.Navigator initialRouteName={ROUTES.auth.splash} screenOptions={{headerShown: false}}>
      <Stack.Screen component={SplashScreen} name={ROUTES.auth.splash} />
      <Stack.Screen component={LoginScreen} name={ROUTES.auth.login} />
      <Stack.Screen component={OtpVerificationScreen} name={ROUTES.auth.otpVerification} />
      <Stack.Screen component={RoleSelectionScreen} name={ROUTES.auth.roleSelection} />
      <Stack.Screen component={CompleteProfileScreen} name={ROUTES.auth.completeProfile} />
    </Stack.Navigator>
  );
}
