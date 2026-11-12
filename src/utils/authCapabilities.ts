import type {UserProfile} from '@/types';

/** UI selectors only. The backend checks the current capability for every builder API. */
export function isBroker(user?: UserProfile): boolean {
  return user?.capabilities?.isBroker ?? user?.role === 'broker';
}

export function canAddProperty(user?: UserProfile): boolean {
  return user?.capabilities?.canAddProperty ?? Boolean(user);
}

export function canUseConstructionCustomer(user?: UserProfile): boolean {
  return user?.capabilities?.canUseConstructionCustomer ?? Boolean(user);
}

export function canUseConstructionBuilder(user?: UserProfile): boolean {
  return user?.capabilities?.canUseConstructionBuilder === true;
}
