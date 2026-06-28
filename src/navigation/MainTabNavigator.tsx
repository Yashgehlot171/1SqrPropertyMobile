import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';

import {colors} from '@/constants/colors';
import {ROUTES} from '@/constants/routes';
import {AddPropertyStack} from '@/navigation/AddPropertyStack';
import {HomeStack} from '@/navigation/HomeStack';
import {ProfileStack} from '@/navigation/ProfileStack';
import {SavedStack} from '@/navigation/SavedStack';
import {ServicesStack} from '@/navigation/ServicesStack';
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
          height: 72,
          marginHorizontal: 16,
          marginBottom: 12,
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
            size={focused ? 19 : size}
            style={
              focused
                ? {
                    backgroundColor: colors.primary,
                    borderRadius: 18,
                    padding: 8,
                    overflow: 'hidden',
                  }
                : undefined
            }
          />
        ),
      })}>
      <Tab.Screen component={HomeStack} name={ROUTES.tabs.homeStack} options={{title: 'Home'}} />
      <Tab.Screen component={SavedStack} name={ROUTES.tabs.savedStack} options={{title: 'Saved'}} />
      <Tab.Screen component={AddPropertyStack} name={ROUTES.tabs.addPropertyStack} options={{title: 'Add Property'}} />
      <Tab.Screen component={ServicesStack} name={ROUTES.tabs.servicesStack} options={{title: 'Services'}} />
      <Tab.Screen component={ProfileStack} name={ROUTES.tabs.profileStack} options={{title: 'Profile'}} />
    </Tab.Navigator>
  );
}
