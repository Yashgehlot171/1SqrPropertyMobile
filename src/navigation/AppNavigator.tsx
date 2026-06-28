import React from 'react';
import {DefaultTheme, NavigationContainer} from '@react-navigation/native';

import Colors from '@/Themes/Colors';
import {navigationRef} from '@/navigation/NavigationService';
import {RootNavigator} from '@/navigation/RootNavigator';

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: Colors.background,
    card: Colors.cardBackground,
    text: Colors.textPrimary,
    border: Colors.border,
    primary: Colors.secondary,
  },
};

export default function AppNavigator() {
  return (
    <NavigationContainer ref={navigationRef} theme={navigationTheme}>
      <RootNavigator />
    </NavigationContainer>
  );
}
