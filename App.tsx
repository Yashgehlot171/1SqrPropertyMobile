import React from 'react';
import {StatusBar} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';

import AppNavigator from '@/navigation/AppNavigator';
import Colors from '@/Themes/Colors';

function App(): React.JSX.Element {
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <SafeAreaProvider>
        {/* Android 15+ (SDK 36) ignores StatusBar.backgroundColor (edge-to-edge enforced) — every screen's own light top background is what actually shows, so dark-content is the correct global default. SplashScreen overrides locally (dark hero image). */}
        <StatusBar
          backgroundColor={Colors.white}
          barStyle="dark-content"
        />
        <AppNavigator />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default App;
