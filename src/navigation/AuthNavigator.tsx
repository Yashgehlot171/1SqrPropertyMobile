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
import {useAuthStore} from '@/store/authStore';
import type {AuthStackParamList} from '@/types';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthNavigator() {
  // Bootstrap (cold app start, session not checked yet) still goes through
  // Splash. A logout that happens after bootstrap — either the user tapping
  // Logout or a forced logout from an expired refresh token — should land
  // directly on Login instead of replaying the Splash animation/delay.
  const isBootstrapping = useAuthStore(state => state.isBootstrapping);
  const initialRouteName = isBootstrapping ? ROUTES.auth.splash : ROUTES.auth.login;

  return (
    <Stack.Navigator initialRouteName={initialRouteName} screenOptions={{headerShown: false}}>
      <Stack.Screen component={SplashScreen} name={ROUTES.auth.splash} />
      <Stack.Screen component={LoginScreen} name={ROUTES.auth.login} />
      <Stack.Screen component={OtpVerificationScreen} name={ROUTES.auth.otpVerification} />
      <Stack.Screen component={RoleSelectionScreen} name={ROUTES.auth.roleSelection} />
      <Stack.Screen component={CompleteProfileScreen} name={ROUTES.auth.completeProfile} />
    </Stack.Navigator>
  );
}
