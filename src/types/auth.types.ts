import type {Identifier, UserRole} from './common.types';

export interface UserProfile {
  id: Identifier;
  name: string;
  mobile: string;
  email: string;
  city: string;
  role: UserRole;
  avatar?: string;
}

export interface LoginPayload {
  mobile: string;
}

export interface VerifyOtpPayload {
  mobile: string;
  otp: string;
}

export interface CompleteProfilePayload {
  name: string;
  email: string;
  city: string;
  avatar?: string;
}

export interface AuthSession {
  isLoggedIn: boolean;
  token?: string;
  user?: UserProfile;
  selectedRole?: UserRole;
}
