import type {Identifier, UserRole} from './common.types';

export interface UserProfile {
  id: Identifier;
  name: string;
  mobile: string;
  email: string;
  city: string;
  cityId?: number;
  stateId?: number;
  stateName?: string;
  address?: string | null;
  role: UserRole;
  avatar?: string;
  avatarFileId?: Identifier | number | null;
  status?: string;
  accountStatus?: string;
  verificationStatus?: string;
  rejectionReason?: string;
  remarks?: string;
  capabilities?: UserCapabilities;
}

export interface UserCapabilities {
  canAddProperty: boolean;
  canUseConstructionCustomer: boolean;
  isBroker: boolean;
  canUseConstructionBuilder: boolean;
}

export interface LoginPayload {
  mobile: string;
}

export interface VerifyOtpPayload {
  mobile: string;
  otp: string;
}

export interface VerifyOtpResult {
  verified: boolean;
  tempToken?: string;
  accessToken?: string;
  refreshToken?: string;
  isProfileComplete?: boolean;
  user?: UserProfile;
}

export interface CompleteProfilePayload {
  name: string;
  email: string;
  city?: string;
  stateId?: number;
  cityId?: number;
  address?: string;
  avatarFileId?: string | number | null;
  brokerProfile?: BrokerProfilePayload;
}

export interface BrokerProfilePayload {
  firmName?: string;
  officeAddress?: string;
  experienceYears?: number;
  reraNumber?: string;
  gstNumber?: string;
  officeCityId?: number;
  documentFileIds?: Array<string | number>;
}

export interface AuthSession {
  isLoggedIn: boolean;
  token?: string;
  refreshToken?: string;
  tempToken?: string;
  user?: UserProfile;
  brokerProfile?: BrokerProfile;
  selectedRole?: UserRole;
}

export interface BrokerProfile extends BrokerProfilePayload {
  id?: Identifier;
  userId?: Identifier | number;
  verificationStatus?: string;
  status?: string;
  verified?: boolean;
  rejectionReason?: string;
  verificationRemarks?: string;
  remarks?: string;
  documentUrls?: string[];
}

export interface ProfileUpdatePayload {
  name?: string;
  email?: string;
  cityId?: number;
  address?: string;
  avatarFileId?: string | number | null;
}
