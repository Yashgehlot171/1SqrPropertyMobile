import {apiRequest} from '@/api';
import {buildQueryString} from '@/services/masterApi';

export interface BrokerBuyerLead {
  requirementId: string;
  buyerDisplayName: 'Buyer';
  propertyType: {id: number; name: string} | null;
  city: {id: number; name: string} | null;
  localities: {id: number; name: string}[];
  nearbyLocalityAccepted: boolean;
  preferences: Record<string, unknown>;
  area: {min: string | null; max: string | null; unit: string | null};
  budget: {min: string | null; max: string | null};
  purchaseTimeline: string | null;
  targetPurchaseDate: string | null;
  paymentPreference: string | null;
  loanIntent: {occupation: string | null; amount: string | null; status: string | null} | null;
  additionalRequirement: string | null;
  publishedAt: string | null;
  purchase: BrokerLeadPurchaseState | null;
}

export interface BrokerLeadPurchaseState {
  purchaseStatus: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | null;
  isPurchased: boolean;
  isAvailable: boolean;
  buyerLeadPrice: string | null;
  currency: string;
  remainingSlots: number | null;
}

export interface BrokerLeadPurchaseIntent {
  id: string;
  requirementId: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';
  price: string;
  currency: string;
  createdAt: string;
  purchasedAt: string | null;
  paymentMode: 'GATEWAY_PENDING';
  contactUnlocked: false;
}

export interface PurchasedBuyerContact {
  buyerName: string;
  mobile: string;
  canCall: boolean;
  canWhatsApp: boolean;
}

export interface BrokerLeadFilters {
  cityId?: number;
  localityId?: number;
  propertyTypeId?: number;
  budgetMin?: string;
  budgetMax?: string;
  bhk?: string;
  purchaseTimeline?: string;
  paymentPreference?: string;
  page?: number;
  limit?: number;
}

export interface BrokerLeadPage {
  items: BrokerBuyerLead[];
  pagination: {page: number; limit: number; total: number; totalPages: number};
  configurationMessage?: string;
}

export const getBrokerBuyerLeads = (filters: BrokerLeadFilters = {}) =>
  apiRequest<BrokerLeadPage>({endpoint: `/me/property-leads${buildQueryString(filters)}`, method: 'GET'});

export const getBrokerBuyerLead = (id: string) =>
  apiRequest<BrokerBuyerLead>({endpoint: `/me/property-leads/${encodeURIComponent(id)}`, method: 'GET'});

export const createBrokerLeadPurchaseIntent = (id: string, idempotencyKey: string) =>
  apiRequest<BrokerLeadPurchaseIntent, {idempotencyKey: string}>({endpoint: `/me/property-leads/${encodeURIComponent(id)}/purchase`, method: 'POST', body: {idempotencyKey}});

export const getPurchasedBuyerContact = (id: string) =>
  apiRequest<PurchasedBuyerContact>({endpoint: `/me/property-leads/${encodeURIComponent(id)}/contact`, method: 'GET'});
