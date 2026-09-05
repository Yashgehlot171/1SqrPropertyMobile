import {
  completeProfile,
  logout,
  saveRole,
  sendOtp,
  verifyOtp,
} from '@/services/authApi';
import {getMe, updateMe} from '@/services/profileApi';

import {useApiMutation} from './useApiMutation';

export function useSendOtpMutation() {
  return useApiMutation(sendOtp);
}

export function useVerifyOtpMutation() {
  return useApiMutation(verifyOtp);
}

export function useSelectRoleMutation() {
  return useApiMutation(saveRole);
}

export function useCompleteProfileMutation() {
  return useApiMutation(completeProfile);
}

export function useGetMeMutation() {
  return useApiMutation(getMe);
}

export function useUpdateMeMutation() {
  return useApiMutation(updateMe);
}

export function useLogoutMutation() {
  return useApiMutation(logout);
}
