import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {ROUTES} from '@/constants/routes';
import {
  LeadListScreen,
  PortfolioDashboardScreen,
} from '@/navigation/screenExports';
import type {ProfileStackParamList} from '@/types';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export function PortfolioStack() {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen
        component={PortfolioDashboardScreen}
        name={ROUTES.portfolio.portfolioDashboard}
      />
      <Stack.Screen component={LeadListScreen} name={ROUTES.portfolio.leadList} />
    </Stack.Navigator>
  );
}
