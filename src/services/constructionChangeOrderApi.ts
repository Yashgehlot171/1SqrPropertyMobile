import {apiRequest} from '@/api';

export type ConstructionChangeOrderStatus = 'REQUESTED' | 'PROPOSED' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';
export type ConstructionChangeOrderInitiator = 'CUSTOMER' | 'BUILDER';
export interface ConstructionChangeOrderItem {
  id: string;
  sequenceNumber: number;
  initiatedBy: ConstructionChangeOrderInitiator;
  title: string;
  description: string;
  reason: string;
  status: ConstructionChangeOrderStatus;
  proposedAmountDelta: string | null;
  proposedDaysDelta: number | null;
  finalAmountDelta: string | null;
  finalDaysDelta: number | null;
  proposalNote: string | null;
  createdAt: string;
  proposedAt: string | null;
  customerDecisionAt: string | null;
  paymentScheduleItemId: string | null;
  history: {id: string; type: string; previousStatus: ConstructionChangeOrderStatus | null; newStatus: ConstructionChangeOrderStatus; amountDelta: string | null; daysDelta: number | null; note: string | null; createdAt: string}[];
}
export interface ConstructionChangeOrderSummary {
  projectId: string;
  projectStatus: string;
  agreementAccepted: boolean;
  originalContractAmount: string;
  acceptedChangeOrdersTotal: string;
  currentRevisedContractAmount: string;
  originalDuration: {value: number | null; unit: string | null};
  acceptedDaysDelta: number;
  items: ConstructionChangeOrderItem[];
}
export interface ChangeOrderRequest {title: string; description: string; reason: string}
export interface ChangeOrderProposal extends ChangeOrderRequest {amountDelta: string; daysDelta: number; proposalNote?: string}
export interface ChangeOrderTerms {amountDelta: string; daysDelta: number; proposalNote?: string}

export const getCustomerChangeOrders = (projectId: string) => apiRequest<ConstructionChangeOrderSummary>({endpoint: `/construction/projects/${encodeURIComponent(projectId)}/change-orders`});
export const getBuilderChangeOrders = (projectId: string) => apiRequest<ConstructionChangeOrderSummary>({endpoint: `/me/construction/projects/${encodeURIComponent(projectId)}/change-orders`});
export const createCustomerChangeRequest = (projectId: string, input: ChangeOrderRequest) => apiRequest<ConstructionChangeOrderSummary, ChangeOrderRequest>({endpoint: `/construction/projects/${encodeURIComponent(projectId)}/change-orders`, method: 'POST', body: input});
export const createBuilderChangeProposal = (projectId: string, input: ChangeOrderProposal) => apiRequest<ConstructionChangeOrderSummary, ChangeOrderProposal>({endpoint: `/me/construction/projects/${encodeURIComponent(projectId)}/change-orders`, method: 'POST', body: input});
export const proposeCustomerChangeOrder = (projectId: string, orderId: string, input: ChangeOrderTerms) => apiRequest<ConstructionChangeOrderSummary, ChangeOrderTerms>({endpoint: `/me/construction/projects/${encodeURIComponent(projectId)}/change-orders/${encodeURIComponent(orderId)}/proposal`, method: 'POST', body: input});
export const decideCustomerChangeOrder = (projectId: string, orderId: string, decision: 'ACCEPT' | 'REJECT') => apiRequest<ConstructionChangeOrderSummary, {decision: 'ACCEPT' | 'REJECT'; confirmed: true}>({endpoint: `/construction/projects/${encodeURIComponent(projectId)}/change-orders/${encodeURIComponent(orderId)}/decision`, method: 'POST', body: {decision, confirmed: true}});
export const cancelConstructionChangeOrder = (projectId: string, orderId: string, actor: 'customer' | 'builder') => apiRequest<ConstructionChangeOrderSummary, {confirmed: true}>({endpoint: `${actor === 'builder' ? '/me' : ''}/construction/projects/${encodeURIComponent(projectId)}/change-orders/${encodeURIComponent(orderId)}/cancel`, method: 'POST', body: {confirmed: true}});
