import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {ROUTES} from '@/constants/routes';
import {ConstructionRequirementStack} from '@/navigation/ConstructionRequirementStack';
import {
  HomeDashboardScreen,
  NotificationsScreen,
  PropertyDetailScreen,
  PropertyFilterScreen,
  PropertyGalleryScreen,
  PropertyListingScreen,
  PropertyRequirementJourneyScreen,
  MyPropertyRequirementsScreen,
  PropertyRequirementDetailScreen,
  BrokerLeadsScreen,
  BrokerBuyerLeadDetailScreen,
  BrokerLeadCrmDetailScreen,
} from '@/navigation/screenExports';
import type {HomeStackParamList} from '@/types';

const Stack = createNativeStackNavigator<HomeStackParamList>();

export function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen component={HomeDashboardScreen} name={ROUTES.home.dashboard} />
      <Stack.Screen component={PropertyListingScreen} name={ROUTES.home.propertyListing} />
      <Stack.Screen component={PropertyRequirementJourneyScreen} name={ROUTES.home.propertyRequirementJourney} />
      <Stack.Screen component={MyPropertyRequirementsScreen} name={ROUTES.home.myPropertyRequirements} />
      <Stack.Screen component={PropertyRequirementDetailScreen} name={ROUTES.home.propertyRequirementDetail} />
      <Stack.Screen component={BrokerLeadsScreen} name={ROUTES.home.brokerLeads} />
      <Stack.Screen component={BrokerBuyerLeadDetailScreen} name={ROUTES.home.brokerBuyerLeadDetail} />
      <Stack.Screen component={BrokerLeadCrmDetailScreen} name={ROUTES.home.brokerLeadCrmDetail} />
      <Stack.Screen component={PropertyFilterScreen} name={ROUTES.home.propertyFilter} />
      <Stack.Screen component={PropertyDetailScreen} name={ROUTES.home.propertyDetail} />
      <Stack.Screen component={PropertyGalleryScreen} name={ROUTES.home.propertyGallery} />
      <Stack.Screen component={NotificationsScreen} name={ROUTES.home.notifications} />
      <Stack.Screen
        component={ConstructionRequirementStack}
        name={ROUTES.home.constructionRequirement}
      />
    </Stack.Navigator>
  );
}
