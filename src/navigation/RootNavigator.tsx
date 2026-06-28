import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {ROUTES} from '@/constants/routes';
import {AuthNavigator} from '@/navigation/AuthNavigator';
import {MainTabNavigator} from '@/navigation/MainTabNavigator';
import {useAuthStore} from '@/store/authStore';
import type {RootStackParamList} from '@/types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const isLoggedIn = useAuthStore(state => state.isLoggedIn);

  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      {isLoggedIn ? (
        <Stack.Screen component={MainTabNavigator} name={ROUTES.root.main} />
      ) : (
        <Stack.Screen component={AuthNavigator} name={ROUTES.root.auth} />
      )}
    </Stack.Navigator>
  );
}
