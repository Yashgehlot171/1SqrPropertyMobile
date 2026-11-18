import {apiRequest} from '@/api';
import {buildQueryString} from '@/services/masterApi';

export type BrokerLeadCrmStatus = 'PURCHASED' | 'CONTACTED' | 'INTERESTED' | 'SITE_VISIT' | 'NEGOTIATING' | 'DEAL_CLOSED' | 'NOT_INTERESTED';
export type BrokerLeadCrmFollowUp = 'DUE' | 'UPCOMING';
export interface BrokerLeadCrmSummary {
  id: string;
  requirementId: string;
  purchaseId: string;
  propertyType: string;
  city: string | null;
  localities: string[];
  budget: {min: string | null; max: string | null};
  area: {min: string | null; max: string | null; unit: string | null};
  status: BrokerLeadCrmStatus;
  nextFollowUpAt: string | null;
  lastContactedAt: string | null;
  purchasedAt: string | null;
  updatedAt: string;
}
export interface BrokerLeadCrmDetail extends BrokerLeadCrmSummary {
  contactEntitlementAvailable: boolean;
  allowedNextStatuses: BrokerLeadCrmStatus[];
  notes: {id: string; note: string; createdAt: string}[];
  activities: {id: string; type: string; previousValue: string | null; newValue: string | null; createdAt: string}[];
  historyTruncated: boolean;
}
export interface BrokerLeadCrmFilters {
  page?: number;
  limit?: number;
  status?: BrokerLeadCrmStatus;
  propertyTypeId?: number;
  cityId?: number;
  localityId?: number;
  followUp?: BrokerLeadCrmFollowUp;
}
export interface BrokerLeadCrmPage {
  items: BrokerLeadCrmSummary[];
  pagination: {page: number; limit: number; total: number; totalPages: number};
}

export const getBrokerLeadCrmLeads = (filters: BrokerLeadCrmFilters = {}) =>
  apiRequest<BrokerLeadCrmPage>({endpoint: `/me/property-leads/crm${buildQueryString(filters)}`, method: 'GET'});
export const getBrokerLeadCrmDetail = (leadId: string) =>
  apiRequest<BrokerLeadCrmDetail>({endpoint: `/me/property-leads/crm/${encodeURIComponent(leadId)}`, method: 'GET'});
export const updateBrokerLeadCrmStatus = (leadId: string, status: BrokerLeadCrmStatus) =>
  apiRequest<BrokerLeadCrmDetail, {status: BrokerLeadCrmStatus}>({endpoint: `/me/property-leads/crm/${encodeURIComponent(leadId)}/status`, method: 'PATCH', body: {status}});
export const addBrokerLeadCrmNote = (leadId: string, note: string) =>
  apiRequest<BrokerLeadCrmDetail, {note: string}>({endpoint: `/me/property-leads/crm/${encodeURIComponent(leadId)}/notes`, method: 'POST', body: {note}});
export const setBrokerLeadCrmFollowUp = (leadId: string, nextFollowUpAt: string | null) =>
  apiRequest<BrokerLeadCrmDetail, {nextFollowUpAt: string | null}>({endpoint: `/me/property-leads/crm/${encodeURIComponent(leadId)}/follow-up`, method: 'PUT', body: {nextFollowUpAt}});
