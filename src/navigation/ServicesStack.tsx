import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {ROUTES} from '@/constants/routes';
import {
  ConstructionDashboardScreen,
  ConstructionCostCalculatorScreen,
  ConstructionQuotationResultScreen,
  ContractorDirectoryScreen,
  EmiResultScreen,
  FinanceTeamDetailScreen,
  HouseConstructionPackagesScreen,
  LegalRequestDetailScreen,
  LegalRequestTrackingScreen,
  LegalServicesDashboardScreen,
  LegalTeamDetailScreen,
  LoanApplicationScreen,
  LoanCalculatorScreen,
  LoanMarketplaceScreen,
  LoanRequestDetailScreen,
  LoanRequestTrackingScreen,
  MaterialInformationScreen,
  PropertyRegistrationRequestScreen,
  PropertyVerificationRequestScreen,
  ServicesDashboardScreen,
  SupplierDirectoryScreen,
  SupportDashboardScreen,
  SupportTicketDetailScreen,
  SupportTicketFormScreen,
} from '@/navigation/screenExports';
import type {ServicesStackParamList} from '@/types';

const Stack = createNativeStackNavigator<ServicesStackParamList>();

export function ServicesStack() {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen component={ServicesDashboardScreen} name={ROUTES.services.servicesDashboard} />
      <Stack.Screen component={ConstructionDashboardScreen} name={ROUTES.services.constructionDashboard} />
      <Stack.Screen component={HouseConstructionPackagesScreen} name={ROUTES.services.houseConstructionPackages} />
      <Stack.Screen component={ConstructionCostCalculatorScreen} name={ROUTES.services.constructionCostCalculator} />
      <Stack.Screen component={ConstructionQuotationResultScreen} name={ROUTES.services.quotationResult} />
      <Stack.Screen component={MaterialInformationScreen} name={ROUTES.services.materialInformation} />
      <Stack.Screen component={SupplierDirectoryScreen} name={ROUTES.services.supplierDirectory} />
      <Stack.Screen component={ContractorDirectoryScreen} name={ROUTES.services.contractorDirectory} />
      <Stack.Screen component={LoanCalculatorScreen} name={ROUTES.services.loanCalculator} />
      <Stack.Screen component={EmiResultScreen} name={ROUTES.services.emiResult} />
      <Stack.Screen component={LoanMarketplaceScreen} name={ROUTES.services.loanMarketplace} />
      <Stack.Screen component={LoanApplicationScreen} name={ROUTES.services.loanApplication} />
      <Stack.Screen component={LoanRequestTrackingScreen} name={ROUTES.services.loanRequestTracking} />
      <Stack.Screen component={FinanceTeamDetailScreen} name={ROUTES.services.financeTeamDetail} />
      <Stack.Screen component={LoanRequestDetailScreen} name={ROUTES.services.loanRequestDetail} />
      <Stack.Screen component={LegalServicesDashboardScreen} name={ROUTES.services.legalServicesDashboard} />
      <Stack.Screen component={PropertyVerificationRequestScreen} name={ROUTES.services.propertyVerificationRequest} />
      <Stack.Screen component={PropertyRegistrationRequestScreen} name={ROUTES.services.propertyRegistrationRequest} />
      <Stack.Screen component={LegalRequestTrackingScreen} name={ROUTES.services.legalRequestTracking} />
      <Stack.Screen component={LegalTeamDetailScreen} name={ROUTES.services.legalTeamDetail} />
      <Stack.Screen component={LegalRequestDetailScreen} name={ROUTES.services.legalRequestDetail} />
      <Stack.Screen component={SupportDashboardScreen} name={ROUTES.services.supportDashboard} />
      <Stack.Screen component={SupportTicketFormScreen} name={ROUTES.services.supportTicketForm} />
      <Stack.Screen component={SupportTicketDetailScreen} name={ROUTES.services.supportTicketDetail} />
    </Stack.Navigator>
  );
}
