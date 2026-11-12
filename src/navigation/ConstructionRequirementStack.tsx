import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { ROUTES } from '@/constants/routes';
import {
  BudgetTimelineScreen,
  AreaBudgetSummaryScreen,
  HomeRequirementScreen,
  AdditionalPreferencesScreen,
  ConstructionEntryScreen,
  MatchingBuildersScreen,
  PackageComparisonScreen,
  ProjectRequirementScreen,
  ReviewRequirementScreen,
  ReviewRfqScreen,
  RfqSuccessScreen,
  MyRfqsScreen,
  RfqDetailScreen,
  BuilderInvitationsScreen,
  ConstructionBusinessDashboardScreen,
  BuilderRfqDetailScreen,
} from '@/navigation/screenExports';
import type { ConstructionRequirementStackParamList } from '@/types';
import { ConstructionJourneyScreen } from '@/screens/constructionRequirement/ConstructionJourneyScreen';

const Stack =
  createNativeStackNavigator<ConstructionRequirementStackParamList>();

/** The mockup's construction journey lives in one nested Home stack. */
export function ConstructionRequirementStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        component={ConstructionEntryScreen}
        name={ROUTES.constructionRequirement.entry}
      />
      <Stack.Screen
        component={ProjectRequirementScreen}
        name={ROUTES.constructionRequirement.projectRequirement}
      />
      <Stack.Screen
        component={HomeRequirementScreen}
        name={ROUTES.constructionRequirement.homeRequirement}
      />
      <Stack.Screen
        component={BudgetTimelineScreen}
        name={ROUTES.constructionRequirement.budgetTimeline}
      />
      <Stack.Screen
        component={AreaBudgetSummaryScreen}
        name={ROUTES.constructionRequirement.areaBudgetSummary}
      />
      <Stack.Screen
        component={AdditionalPreferencesScreen}
        name={ROUTES.constructionRequirement.additionalPreferences}
      />
      <Stack.Screen
        component={ReviewRequirementScreen}
        name={ROUTES.constructionRequirement.reviewRequirement}
      />
      <Stack.Screen component={ReviewRfqScreen} name={ROUTES.constructionRequirement.reviewRfq} />
      <Stack.Screen component={RfqSuccessScreen} name={ROUTES.constructionRequirement.rfqSuccess} />
      <Stack.Screen component={MyRfqsScreen} name={ROUTES.constructionRequirement.myRfqs} />
      <Stack.Screen component={RfqDetailScreen} name={ROUTES.constructionRequirement.rfqDetail} />
      <Stack.Screen component={BuilderInvitationsScreen} name={ROUTES.constructionRequirement.builderInvitations} />
      <Stack.Screen component={ConstructionBusinessDashboardScreen} name={ROUTES.constructionRequirement.constructionBusinessDashboard} />
      <Stack.Screen component={BuilderRfqDetailScreen} name={ROUTES.constructionRequirement.builderRfqDetail} />
      <Stack.Screen
        component={MatchingBuildersScreen}
        name={ROUTES.constructionRequirement.matchingBuilders}
      />
      <Stack.Screen
        component={PackageComparisonScreen}
        name={ROUTES.constructionRequirement.packageComparison}
      />
      <Stack.Screen
        component={ConstructionJourneyScreen}
        name={ROUTES.constructionRequirement.planOverview}
      />
      <Stack.Screen
        component={ConstructionJourneyScreen}
        name={ROUTES.constructionRequirement.structureSteel}
      />
      <Stack.Screen
        component={ConstructionJourneyScreen}
        name={ROUTES.constructionRequirement.detailedSpecifications}
      />
      <Stack.Screen
        component={PackageComparisonScreen}
        name={ROUTES.constructionRequirement.comparePlans}
      />
      <Stack.Screen
        component={ConstructionJourneyScreen}
        name={ROUTES.constructionRequirement.finishingMaterials}
      />
      <Stack.Screen
        component={ConstructionJourneyScreen}
        name={ROUTES.constructionRequirement.kitchenAmenities}
      />
      <Stack.Screen
        component={ConstructionJourneyScreen}
        name={ROUTES.constructionRequirement.customizePlan}
      />
      <Stack.Screen
        component={ConstructionJourneyScreen}
        name={ROUTES.constructionRequirement.requestQuote}
      />
      <Stack.Screen
        component={ConstructionJourneyScreen}
        name={ROUTES.constructionRequirement.quoteRequests}
      />
      <Stack.Screen
        component={ConstructionJourneyScreen}
        name={ROUTES.constructionRequirement.quoteDetails}
      />
      <Stack.Screen
        component={ConstructionJourneyScreen}
        name={ROUTES.constructionRequirement.projectTracking}
      />
    </Stack.Navigator>
  );
}
