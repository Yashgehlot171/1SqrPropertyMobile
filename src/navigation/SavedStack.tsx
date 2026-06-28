import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {ROUTES} from '@/constants/routes';
import {
  PropertyDetailScreen,
  PropertyGalleryScreen,
  SavedPropertiesScreen,
} from '@/navigation/screenExports';
import type {SavedStackParamList} from '@/types';

const Stack = createNativeStackNavigator<SavedStackParamList>();

export function SavedStack() {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen component={SavedPropertiesScreen} name={ROUTES.saved.savedProperties} />
      <Stack.Screen component={PropertyDetailScreen} name={ROUTES.home.propertyDetail} />
      <Stack.Screen component={PropertyGalleryScreen} name={ROUTES.home.propertyGallery} />
    </Stack.Navigator>
  );
}
