import React, {useEffect} from 'react';
import {CommonActions} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {colors} from '@/constants/colors';
import {ROUTES} from '@/constants/routes';
import {AddPropertyStack} from '@/navigation/AddPropertyStack';
import {HomeStack} from '@/navigation/HomeStack';
import {ProfileStack} from '@/navigation/ProfileStack';
import {SavedStack} from '@/navigation/SavedStack';
import {ServicesStack} from '@/navigation/ServicesStack';
import {usePropertyStore} from '@/store/propertyStore';
import {useSavedStore} from '@/store/savedStore';
import type {MainTabParamList} from '@/types';

const Tab = createBottomTabNavigator<MainTabParamList>();

function tabIcon(routeName: keyof MainTabParamList, focused: boolean) {
  const iconMap: Record<keyof MainTabParamList, string> = {
    HomeTab: focused ? 'home' : 'home-outline',
    SavedTab: focused ? 'heart' : 'heart-outline',
    AddPropertyTab: focused ? 'add-circle' : 'add-circle-outline',
    ServicesTab: focused ? 'grid' : 'grid-outline',
    ProfileTab: focused ? 'person' : 'person-outline',
  };

  return iconMap[routeName];
}

export function MainTabNavigator() {
  const hydrateFavourites = useSavedStore(state => state.hydrateFavourites);
  const insets = useSafeAreaInsets();

  // MainTabNavigator only mounts once RootNavigator sees isLoggedIn === true (and
  // unmounts on logout), the same way MainTabNavigator's own mount/unmount is
  // already driven by that single auth flag — so a one-time hydrate here loads the
  // logged-in user's real favourites exactly once per login, without needing a
  // second auth-aware trigger elsewhere.
  useEffect(() => {
    hydrateFavourites();
  }, [hydrateFavourites]);

  return (
    <Tab.Navigator
      screenOptions={({
        route,
      }: {
        route: {name: keyof MainTabParamList};
      }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.secondary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
        tabBarStyle: {
          height: 75,
          marginHorizontal: 16,
          // 12 is the floating gap on a device with no nav inset; insets.bottom clears the system nav bar/gesture pill on top of that.
          marginBottom: 12 + insets.bottom,
          paddingTop: 8,
          paddingBottom: 10,
          borderRadius: 24,
          borderTopWidth: 0,
          backgroundColor: colors.white,
          shadowColor: colors.darkPurple,
          shadowOpacity: 0.12,
          shadowRadius: 18,
          shadowOffset: {width: 0, height: 8},
          elevation: 10,
        },
        tabBarItemStyle: {
          borderRadius: 18,
        },
        tabBarIcon: ({
          color,
          focused,
          size,
        }: {
          color: string;
          focused: boolean;
          size: number;
        }) => (
          <Icon
            color={focused ? colors.white : color}
            name={tabIcon(route.name, focused)}
            size={focused ? 20 : size}
            style={
              focused
                ? {
                    backgroundColor: colors.primary,
                    borderRadius: 18,
                    padding:4 ,
                    overflow: 'hidden',
                  }
                : undefined
            }
          />
        ),
      })}>
      <Tab.Screen component={HomeStack} name={ROUTES.tabs.homeStack} options={{title: 'Home'}} />
      <Tab.Screen component={SavedStack} name={ROUTES.tabs.savedStack} options={{title: 'Saved'}} />
      <Tab.Screen
        component={AddPropertyStack}
        listeners={({navigation, route}) => ({
          // Bottom tabs keep this nested stack mounted on whatever step it was
          // left on, so re-entering should start fresh. A plain navigate(tab,
          // {screen: 'AddPropertyBasic'}) won't do it: since every forward step
          // now uses replace(), the nested stack only ever has one entry (the
          // current step, not necessarily Basic), so navigating to a route not
          // already in it would push a second entry instead of clearing the
          // stale one. Resetting via the nested navigator's own state key does.
          tabPress: event => {
            if (navigation.isFocused()) {
              return;
            }
            event.preventDefault();
            usePropertyStore.getState().clearDraft();
            // `state` isn't part of RouteProp's public typing, but React
            // Navigation populates it at runtime once the nested navigator has
            // rendered — the documented way to target its reset from here.
            const nestedStateKey = (route as unknown as {
              state?: {key: string};
            }).state?.key;
            if (nestedStateKey) {
              navigation.dispatch({
                ...CommonActions.reset({
                  index: 0,
                  routes: [
                    {
                      name: ROUTES.addProperty.addPropertyBasic,
                      params: {propertyId: undefined},
                    },
                  ],
                }),
                target: nestedStateKey,
              });
            }
            // Switch tabs ourselves since preventDefault() above skipped it.
            navigation.dispatch(
              CommonActions.navigate({name: ROUTES.tabs.addPropertyStack}),
            );
          },
        })}
        name={ROUTES.tabs.addPropertyStack}
        options={{title: 'Add Property'}}
      />
      <Tab.Screen component={ServicesStack} name={ROUTES.tabs.servicesStack} options={{title: 'Services'}} />
      <Tab.Screen component={ProfileStack} name={ROUTES.tabs.profileStack} options={{title: 'Profile'}} />
    </Tab.Navigator>
  );
}
