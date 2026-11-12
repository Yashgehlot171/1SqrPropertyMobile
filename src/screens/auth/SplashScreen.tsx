import React, { useEffect, useRef } from 'react';
import {
  Animated,
  ImageBackground,
  StatusBar,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ROUTES } from '@/constants/routes';
import { getSession } from '@/services/authApi';
import { useAuthStore } from '@/store/authStore';
import type { AuthStackParamList } from '@/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Splash'>;

const splashBackground = require('@/assets/splashscreen.png');
const appLogo = require('@/assets/appicon.gif');

export function SplashScreen({ navigation }: Props) {
  const hydrateSession = useAuthStore(state => state.hydrateSession);
  const finishBootstrap = useAuthStore(state => state.finishBootstrap);
  const { width, height } = useWindowDimensions();
  const logoOpacity = useRef(new Animated.Value(0)).current;

  const shortestSide = Math.min(width, height);
  const logoSize = Math.min(Math.max(shortestSide * 0.3, 92), 152);

  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      const startedAt = Date.now();

      try {
        const session = await getSession();
        const elapsed = Date.now() - startedAt;
        const remaining = Math.max(0, 2000 - elapsed);

        setTimeout(() => {
          if (!isMounted) {
            return;
          }

          if (session.isLoggedIn) {
            hydrateSession(session);
            return;
          }

          finishBootstrap();
          navigation.replace(ROUTES.auth.login);
        }, remaining);
      } catch {
        finishBootstrap();
        navigation.replace(ROUTES.auth.login);
      }
    };

    bootstrap();

    return () => {
      isMounted = false;
    };
  }, [finishBootstrap, hydrateSession, navigation]);

  useEffect(() => {
    Animated.timing(logoOpacity, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true,
    }).start();
  }, [logoOpacity]);

  return (
    <ImageBackground
      source={splashBackground}
      resizeMode="cover"
      style={styles.background}
      imageStyle={styles.backgroundImage}
    >
      {/* Overrides the app-wide dark-content default: full-bleed dark hero image, no SafeAreaView, needs light icons. */}
      <StatusBar
        backgroundColor="transparent"
        barStyle="light-content"
        translucent
      />
      <View style={styles.overlay}>
        <View style={styles.centerContent}>
          <Animated.Image
            source={appLogo}
            resizeMode="contain"
            style={[
              styles.logo,
              {
                width: logoSize,
                height: logoSize,
                opacity: logoOpacity,
                transform: [
                  {
                    scale: logoOpacity.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.96, 1],
                    }),
                  },
                ],
              },
            ]}
          />
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    maxWidth: '48%',
    maxHeight: '26%',
  },
});
