import {apiRequest} from '@/api';
import {ApiRouteService} from '@/config/app-reference';
import type {
  BrokerProfile,
  BrokerProfilePayload,
  ProfileUpdatePayload,
  UserProfile,
  UserRole,
} from '@/types';

type BackendUser = Partial<UserProfile> & {
  cityName?: string;
  city_name?: string;
  roleName?: UserRole;
  role_name?: UserRole;
  avatarUrl?: string;
  avatar_url?: string;
  account_status?: string;
  verification_status?: string;
  rejection_reason?: string;
};

type BackendBrokerProfile = Partial<BrokerProfile> & {
  user_id?: string | number;
  verification_status?: string;
  rejection_reason?: string;
  verification_remarks?: string;
  document_urls?: string[];
};

function compactPayload<T extends Record<string, unknown>>(payload: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined),
  ) as Partial<T>;
}

export function normalizeUser(user?: BackendUser | null): UserProfile | undefined {
  if (!user) {
    return undefined;
  }

  return {
    id: user.id ?? user.mobile ?? '',
    name: user.name ?? '',
    mobile: user.mobile ?? '',
    email: user.email ?? '',
    city: user.city ?? user.cityName ?? user.city_name ?? '',
    cityId: user.cityId,
    role: user.role ?? user.roleName ?? user.role_name ?? 'buyer',
    avatar: user.avatar ?? user.avatarUrl ?? user.avatar_url,
    avatarFileId: user.avatarFileId,
    status: user.status,
    accountStatus: user.accountStatus ?? user.account_status,
    verificationStatus: user.verificationStatus ?? user.verification_status,
    rejectionReason: user.rejectionReason ?? user.rejection_reason,
    remarks: user.remarks,
  };
}

export function normalizeBrokerProfile(
  profile?: BackendBrokerProfile | null,
): BrokerProfile | undefined {
  if (!profile) {
    return undefined;
  }

  return {
    id: profile.id,
    userId: profile.userId ?? profile.user_id,
    firmName: profile.firmName,
    officeAddress: profile.officeAddress,
    experienceYears: profile.experienceYears,
    reraNumber: profile.reraNumber,
    gstNumber: profile.gstNumber,
    officeCityId: profile.officeCityId,
    documentFileIds: profile.documentFileIds,
    documentUrls: profile.documentUrls ?? profile.document_urls,
    verificationStatus:
      profile.verificationStatus ?? profile.verification_status,
    status: profile.status,
    verified: profile.verified,
    rejectionReason: profile.rejectionReason ?? profile.rejection_reason,
    verificationRemarks:
      profile.verificationRemarks ?? profile.verification_remarks,
    remarks: profile.remarks,
  };
}

export async function getMe(): Promise<UserProfile> {
  const response = await apiRequest<BackendUser>({
    endpoint: ApiRouteService.profile.me,
    method: 'GET',
    auth: 'access',
  });

  const user = normalizeUser(response);
  if (!user) {
    throw new Error('Profile details were not returned.');
  }

  return user;
}

export async function updateMe(
  updates: ProfileUpdatePayload,
): Promise<UserProfile> {
  const body = compactPayload({
    name: updates.name,
    email: updates.email,
    cityId: updates.cityId,
    avatarFileId: updates.avatarFileId,
  });

  const response = await apiRequest<BackendUser, typeof body>({
    endpoint: ApiRouteService.profile.me,
    method: 'PATCH',
    body,
    auth: 'access',
  });

  const user = normalizeUser(response);
  if (!user) {
    throw new Error('Updated profile details were not returned.');
  }

  return user;
}

export async function deleteAccount(): Promise<void> {
  await apiRequest<null>({
    endpoint: ApiRouteService.profile.account,
    method: 'DELETE',
    auth: 'access',
  });
}

export async function getBrokerProfile(): Promise<BrokerProfile> {
  const response = await apiRequest<BackendBrokerProfile>({
    endpoint: ApiRouteService.profile.brokerProfile,
    method: 'GET',
    auth: 'access',
  });

  const profile = normalizeBrokerProfile(response);
  if (!profile) {
    throw new Error('Broker profile details were not returned.');
  }

  return profile;
}

export async function updateBrokerProfile(
  updates: BrokerProfilePayload,
): Promise<BrokerProfile> {
  const body = compactPayload({
    firmName: updates.firmName,
    officeAddress: updates.officeAddress,
    experienceYears: updates.experienceYears,
    reraNumber: updates.reraNumber,
    gstNumber: updates.gstNumber,
    officeCityId: updates.officeCityId,
    documentFileIds: updates.documentFileIds,
  });

  const response = await apiRequest<BackendBrokerProfile, typeof body>({
    endpoint: ApiRouteService.profile.brokerProfile,
    method: 'PATCH',
    body,
    auth: 'access',
  });

  const profile = normalizeBrokerProfile(response);
  if (!profile) {
    throw new Error('Updated broker profile details were not returned.');
  }

  return profile;
}
