type NavigatorScreenParams<ParamList extends Record<string, object | undefined>> = {
  screen?: keyof ParamList;
  params?: ParamList[keyof ParamList];
};

export type AuthStackParamList = {
  Splash: undefined;
  Login: undefined;
  OtpVerification: {
    mobile: string;
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
  ContractorDirectory: undefined;
  LoanCalculator: undefined;
  EmiResult: {
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
