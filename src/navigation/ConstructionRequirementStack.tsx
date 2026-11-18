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
  BuilderProfileScreen,
  PackageComparisonScreen,
  ProjectRequirementScreen,
  ReviewRequirementScreen,
  ReviewRfqScreen,
  RfqSuccessScreen,
  MyRfqsScreen,
  RfqDetailScreen,
  CustomerQuotesReceivedScreen,
  CustomerQuotationDetailScreen,
  CompareCustomerQuotationsScreen,
  BuilderQuotationRevisionsScreen,
  BuilderInvitationsScreen,
  ConstructionBusinessDashboardScreen,
  BuilderServiceAreasScreen,
  BuilderPortfolioScreen,
  BuilderRfqDetailScreen,
  MyConstructionPlansScreen,
  BuilderConstructionPlanEditorScreen,
  BuilderQuotationScreen,
  ConstructionProjectsScreen,
  ConstructionProjectDetailScreen,
  ConstructionPaymentsScreen,
  ConstructionChangeOrdersScreen,
  ConstructionMilestoneManageScreen,
} from '@/navigation/screenExports';
import type { ConstructionRequirementStackParamList } from '@/types';
import { ConstructionJourneyScreen } from '@/screens/constructionRequirement/ConstructionJourneyScreen';
import { useAuthStore } from '@/store/authStore';
import { canUseConstructionBuilder } from '@/utils/authCapabilities';

const Stack =
  createNativeStackNavigator<ConstructionRequirementStackParamList>();

/** The mockup's construction journey lives in one nested Home stack. */
export function ConstructionRequirementStack() {
  const canUseBuilder = canUseConstructionBuilder(useAuthStore(state => state.user));

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
      <Stack.Screen component={ConstructionProjectsScreen} name={ROUTES.constructionRequirement.constructionProjects} />
      <Stack.Screen component={ConstructionProjectDetailScreen} name={ROUTES.constructionRequirement.constructionProjectDetail} />
      <Stack.Screen component={ConstructionPaymentsScreen} name={ROUTES.constructionRequirement.constructionPayments} />
      <Stack.Screen component={ConstructionChangeOrdersScreen} name={ROUTES.constructionRequirement.constructionChangeOrders} />
      {canUseBuilder ? <Stack.Screen component={ConstructionMilestoneManageScreen} name={ROUTES.constructionRequirement.constructionMilestoneManage} /> : null}
      <Stack.Screen component={RfqDetailScreen} name={ROUTES.constructionRequirement.rfqDetail} />
      <Stack.Screen component={CustomerQuotesReceivedScreen} name={ROUTES.constructionRequirement.customerQuotesReceived} />
      <Stack.Screen component={CustomerQuotationDetailScreen} name={ROUTES.constructionRequirement.customerQuotationDetail} />
      <Stack.Screen component={CompareCustomerQuotationsScreen} name={ROUTES.constructionRequirement.compareCustomerQuotations} />
      {canUseBuilder ? <>
        <Stack.Screen component={BuilderQuotationRevisionsScreen} name={ROUTES.constructionRequirement.builderQuotationRevisions} />
        <Stack.Screen component={BuilderInvitationsScreen} name={ROUTES.constructionRequirement.builderInvitations} />
        <Stack.Screen component={ConstructionBusinessDashboardScreen} name={ROUTES.constructionRequirement.constructionBusinessDashboard} />
        <Stack.Screen component={BuilderServiceAreasScreen} name={ROUTES.constructionRequirement.builderServiceAreas} />
        <Stack.Screen component={BuilderPortfolioScreen} name={ROUTES.constructionRequirement.builderPortfolio} />
        <Stack.Screen component={BuilderRfqDetailScreen} name={ROUTES.constructionRequirement.builderRfqDetail} />
        <Stack.Screen component={MyConstructionPlansScreen} name={ROUTES.constructionRequirement.myConstructionPlans} />
        <Stack.Screen component={BuilderConstructionPlanEditorScreen} name={ROUTES.constructionRequirement.builderConstructionPlanEditor} />
        <Stack.Screen component={BuilderQuotationScreen} name={ROUTES.constructionRequirement.builderQuotation} />
      </> : null}
      <Stack.Screen
        component={MatchingBuildersScreen}
        name={ROUTES.constructionRequirement.matchingBuilders}
      />
      <Stack.Screen component={BuilderProfileScreen} name={ROUTES.constructionRequirement.builderProfile} />
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
