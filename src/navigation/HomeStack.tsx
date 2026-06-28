import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {ROUTES} from '@/constants/routes';
import {
  HomeDashboardScreen,
  NotificationsScreen,
  PropertyDetailScreen,
  PropertyFilterScreen,
  PropertyGalleryScreen,
  PropertyListingScreen,
} from '@/navigation/screenExports';
import type {HomeStackParamList} from '@/types';

const Stack = createNativeStackNavigator<HomeStackParamList>();

export function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen component={HomeDashboardScreen} name={ROUTES.home.dashboard} />
      <Stack.Screen component={PropertyListingScreen} name={ROUTES.home.propertyListing} />
      <Stack.Screen component={PropertyFilterScreen} name={ROUTES.home.propertyFilter} />
      <Stack.Screen component={PropertyDetailScreen} name={ROUTES.home.propertyDetail} />
      <Stack.Screen component={PropertyGalleryScreen} name={ROUTES.home.propertyGallery} />
      <Stack.Screen component={NotificationsScreen} name={ROUTES.home.notifications} />
    </Stack.Navigator>
  );
}
