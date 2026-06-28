import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {ROUTES} from '@/constants/routes';
import {
  AddPropertyBasicScreen,
  AddPropertyDetailsScreen,
  AddPropertyLocationScreen,
  MyPropertiesScreen,
  PropertyPreviewScreen,
  UploadPropertyMediaScreen,
} from '@/navigation/screenExports';
import type {AddPropertyStackParamList} from '@/types';

const Stack = createNativeStackNavigator<AddPropertyStackParamList>();

export function AddPropertyStack() {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen component={AddPropertyBasicScreen} name={ROUTES.addProperty.addPropertyBasic} />
      <Stack.Screen component={AddPropertyLocationScreen} name={ROUTES.addProperty.addPropertyLocation} />
      <Stack.Screen component={AddPropertyDetailsScreen} name={ROUTES.addProperty.addPropertyDetails} />
      <Stack.Screen component={UploadPropertyMediaScreen} name={ROUTES.addProperty.uploadPropertyMedia} />
      <Stack.Screen component={PropertyPreviewScreen} name={ROUTES.addProperty.propertyPreview} />
      <Stack.Screen component={MyPropertiesScreen} name={ROUTES.addProperty.myProperties} />
    </Stack.Navigator>
  );
}
