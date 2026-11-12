type NavigatorScreenParams<ParamList extends Record<string, object | undefined>> = {
  screen?: keyof ParamList;
  params?: ParamList[keyof ParamList];
};

export type AuthStackParamList = {
  Splash: undefined;
  Login: undefined;
  OtpVerification: {
    mobile: string;
    testingOtp?: string;
  };
  RoleSelection: undefined;
  CompleteProfile: undefined;
};

export type HomeStackParamList = {
  HomeDashboard: undefined;
  PropertyListing: {
    category?: string;
    query?: string;
  };
  PropertyFilter: undefined;
  PropertyDetail: {
    propertyId: string;
  };
  PropertyGallery: {
    propertyId: string;
    selectedMediaId?: string;
  };
  Notifications: undefined;
  ConstructionRequirement: NavigatorScreenParams<ConstructionRequirementStackParamList>;
};

// "Build Your Dream Home" construction-requirement flow, entered from Home.
export type ConstructionRequirementStackParamList = {
  ConstructionEntry: undefined;
  ProjectRequirement: undefined;
  HomeRequirement: undefined;
  BudgetTimeline: {
    location?: string;
    buildType?: string;
  };
  AreaBudgetSummary: undefined;
  AdditionalPreferences: undefined;
  ReviewRequirement: undefined;
  ReviewRfq: undefined;
  RfqSuccess: {rfq: import('../services/constructionJourneyApi').ConstructionRfq};
  MyRfqs: undefined;
  RfqDetail: {rfqId: string};
  BuilderInvitations: undefined;
  ConstructionBusinessDashboard: undefined;
  BuilderRfqDetail: {invitationId: string};
  MatchingBuilders: {
    location?: string;
    buildType?: string;
    budgetRange?: string;
    floors?: number;
    constructionStart?: string;
  };
    PackageComparison:
      | {
          planId?: string;
        }
      | undefined;
    PlanOverview: undefined;
    DetailedSpecifications: undefined;
    ComparePlans: undefined;
    StructureSteel: undefined;
    FinishingMaterials: undefined;
    KitchenAmenities: undefined;
    CustomizePlan: undefined;
    RequestQuote: undefined;
    QuoteRequests: undefined;
    QuoteDetails: undefined;
    ProjectTracking: undefined;
};

export type SavedStackParamList = {
  SavedProperties: undefined;
  PropertyDetail: {
    propertyId: string;
  };
  PropertyGallery: {
    propertyId: string;
    selectedMediaId?: string;
  };
};

export type AddPropertyStackParamList = {
  AddPropertyBasic: {
    propertyId?: string;
  } | undefined;
  AddPropertyLocation: {
    propertyId?: string;
  };
  AddPropertyDetails: {
    propertyId?: string;
  };
  UploadPropertyMedia: {
    propertyId?: string;
  };
  PropertyPreview: {
    propertyId?: string;
  };
  MyProperties: undefined;
  // Same route/screen as HomeStackParamList/SavedStackParamList's PropertyDetail —
  // registered here too so MyPropertiesScreen can open the real listing-detail view
  // for an already-live property without leaving the AddProperty stack.
  PropertyDetail: {
    propertyId: string;
  };
};

export type ServicesStackParamList = {
  ServicesDashboard: undefined;
  ConstructionDashboard: undefined;
  HouseConstructionPackages: undefined;
  ConstructionCostCalculator:
    | {
        selectedPackageId?: string;
      }
    | undefined;
  QuotationResult: {
    quoteId: string;
  };
  MaterialInformation: undefined;
  SupplierDirectory: undefined;
  ContractorDirectory: {serviceType?: string; title?: string} | undefined;
  LoanCalculator: undefined;
  EmiResult: {
    result?: import('./loan.types').EmiResult;
    loanAmount: number;
    interestRate: number;
    tenureYears: number;
    downPayment: number;
    bankId?: string;
  };
  LoanMarketplace: undefined;
  LoanApplication:
    | {
        requestId?: string;
        bankId?: string;
        loanAmount?: number;
        interestRate?: number;
        tenureYears?: number;
        downPayment?: number;
      }
    | undefined;
  LoanRequestTracking: undefined;
  FinanceTeamDetail: {
    bankId: string;
  };
  LoanRequestDetail: {
    requestId: string;
  };
  LegalServicesDashboard: undefined;
  PropertyVerificationRequest:
    | {
        requestId?: string;
      }
    | undefined;
  PropertyRegistrationRequest:
    | {
        requestId?: string;
      }
    | undefined;
  LegalRequestTracking: undefined;
  LegalTeamDetail: {
    teamId: string;
  };
  LegalRequestDetail: {
    requestId: string;
  };
  SupportDashboard: undefined;
  SupportTicketForm:
    | {
        ticketId?: string;
      }
    | undefined;
  SupportTicketDetail: {
    ticketId: string;
  };
};

export type ProfileStackParamList = {
  Profile: undefined;
  EditProfile: undefined;
  Settings: undefined;
  PortfolioDashboard: undefined;
  LeadList: undefined;
  LeadDetail: {
    leadId: string;
  };
};

export type MainTabParamList = {
  HomeTab: NavigatorScreenParams<HomeStackParamList>;
  SavedTab: NavigatorScreenParams<SavedStackParamList>;
  AddPropertyTab: NavigatorScreenParams<AddPropertyStackParamList>;
  ServicesTab: NavigatorScreenParams<ServicesStackParamList>;
  ProfileTab: NavigatorScreenParams<ProfileStackParamList>;
};

export type RootStackParamList = {
  AuthNavigator: NavigatorScreenParams<AuthStackParamList>;
  MainTabNavigator: NavigatorScreenParams<MainTabParamList>;
};
