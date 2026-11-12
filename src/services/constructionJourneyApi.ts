import { apiRequest } from '@/api';
import { getAllPages } from './remoteData';
import type {FloorRequirement} from '@/store/constructionJourneyStore';

export interface EligibleBuilder {
  id: string;
  name: string;
  serviceType: string;
  cityId?: number | null;
  areaId?: number | null;
  experienceYears?: number | null;
  isVerified: boolean;
  minPrice?: number | null;
}

export interface ConstructionRequirementSnapshot {
  plot: {
    widthFt: number;
    lengthFt: number;
    plotAreaSqFt: number;
    location: {state: string; city: string; area: string; address: string; landmark?: string};
    facing: string;
    isCornerPlot: boolean;
  };
  floors: Array<Omit<FloorRequirement, 'balconies'> & {balconies: Array<FloorRequirement['balconies'][number] & {areaSqFt: number}>}>;
  preferences: {quality: string; optionalFeatures: string[]; specialRequirement: string};
  calculations: {plotAreaSqFt: number; frontBalconyAreaSqFt: number; sideBalconyAreaSqFt: number; totalProposedBalconyAreaSqFt: number};
}

export interface RfqInvitation {
  id: string;
  status: 'SENT' | 'VIEWED' | 'CLARIFICATION_REQUIRED' | 'DECLINED';
  sentAt: string;
  viewedAt?: string | null;
  respondedAt?: string | null;
  declinedAt?: string | null;
  provider: EligibleBuilder;
}

export interface ConstructionRfq {
  id: string;
  requestNo: string;
  rfqStatus: string;
  createdAt: string;
  cityId: number;
  areaId: number;
  requirementSnapshot: ConstructionRequirementSnapshot;
  invitations: RfqInvitation[];
}

export interface BuilderRfqInvitation {
  id: string;
  status: string;
  sentAt: string;
  request: Pick<ConstructionRfq, 'id' | 'requestNo' | 'rfqStatus' | 'createdAt' | 'requirementSnapshot'>;
  declineReason?: string | null;
  clarifications?: BuilderClarification[];
  siteVisitRequest?: BuilderSiteVisit | null;
}

export interface BuilderClarification {id: string; question: string; status: string; createdAt: string}
export interface BuilderSiteVisit {id: string; preferredDate: string; timeSlot: string; note?: string | null; status: string; createdAt: string}
export interface BuilderDashboardSummary {newRfqs: number; pendingActions: number; siteVisitRequests: number; totalRfqs: number}

interface PaginatedResult<T> {
  items: T[];
  pagination: {page: number; limit: number; total: number; totalPages: number};
}

type BackendBuilder = Omit<EligibleBuilder, 'id'> & {id: string | number};
type BackendInvitation = Omit<RfqInvitation, 'id' | 'provider'> & {id: string | number; provider: BackendBuilder};
type BackendRfq = Omit<ConstructionRfq, 'id' | 'invitations'> & {id: string | number; invitations?: BackendInvitation[]};

function normalizeBuilder(item: BackendBuilder): EligibleBuilder {
  return {...item, id: String(item.id)};
}

function normalizeRfq(item: BackendRfq): ConstructionRfq {
  return {...item, id: String(item.id), invitations: (item.invitations ?? []).map(invitation => ({...invitation, id: String(invitation.id), provider: normalizeBuilder(invitation.provider)}))};
}

export async function listEligibleConstructionBuilders(params: {cityId: number; areaId: number; search?: string}): Promise<PaginatedResult<EligibleBuilder>> {
  const query = new URLSearchParams({cityId: String(params.cityId), areaId: String(params.areaId)});
  if (params.search?.trim()) query.set('search', params.search.trim());
  const response = await apiRequest<PaginatedResult<BackendBuilder>>({endpoint: `/construction/builders?${query.toString()}`, method: 'GET'});
  return {...response, items: response.items.map(normalizeBuilder)};
}

export async function createConstructionRfq(input: {cityId: number; areaId: number; builderIds: string[]; requirementSnapshot: ConstructionRequirementSnapshot}): Promise<ConstructionRfq> {
  const response = await apiRequest<BackendRfq>({endpoint: '/construction/rfqs', method: 'POST', body: {...input, builderIds: input.builderIds.map(id => Number(id))}});
  return normalizeRfq(response);
}

export async function listMyConstructionRfqs(): Promise<PaginatedResult<ConstructionRfq>> {
  const response = await apiRequest<PaginatedResult<BackendRfq>>({endpoint: '/me/construction/rfqs', method: 'GET'});
  return {...response, items: response.items.map(normalizeRfq)};
}

export async function getConstructionRfq(id: string): Promise<ConstructionRfq> {
  const response = await apiRequest<BackendRfq>({endpoint: `/construction/rfqs/${encodeURIComponent(id)}`, method: 'GET'});
  return normalizeRfq(response);
}

export async function listBuilderRfqInvitations(): Promise<PaginatedResult<BuilderRfqInvitation>> {
  const response = await apiRequest<PaginatedResult<Omit<BuilderRfqInvitation, 'id' | 'request'> & {id: string | number; request: Omit<BuilderRfqInvitation['request'], 'id'> & {id: string | number}}>>({endpoint: '/me/construction/invitations', method: 'GET'});
  return {...response, items: response.items.map(item => ({...item, id: String(item.id), request: {...item.request, id: String(item.request.id)}}))};
}

export async function getBuilderDashboard(): Promise<BuilderDashboardSummary> {
  return apiRequest<BuilderDashboardSummary>({endpoint: '/me/construction/dashboard', method: 'GET'});
}

export async function getBuilderRfqInvitation(id: string): Promise<BuilderRfqInvitation> {
  const item = await apiRequest<Omit<BuilderRfqInvitation, 'id' | 'request'> & {id: string | number; request: Omit<BuilderRfqInvitation['request'], 'id'> & {id: string | number}}>({endpoint: `/me/construction/invitations/${encodeURIComponent(id)}`, method: 'GET'});
  return {...item, id: String(item.id), request: {...item.request, id: String(item.request.id)}, clarifications: item.clarifications?.map(entry => ({...entry, id: String(entry.id)})), siteVisitRequest: item.siteVisitRequest ? {...item.siteVisitRequest, id: String(item.siteVisitRequest.id)} : null};
}

export async function updateBuilderRfqStatus(id: string, status: 'INTERESTED' | 'DECLINED', reason?: string): Promise<BuilderRfqInvitation> {
  return getNormalizedBuilderInvitation(`/me/construction/invitations/${encodeURIComponent(id)}/status`, 'PATCH', {status, reason});
}

export async function requestBuilderClarification(id: string, question: string): Promise<void> {
  await apiRequest({endpoint: `/me/construction/invitations/${encodeURIComponent(id)}/clarifications`, method: 'POST', body: {question}});
}

export async function requestBuilderSiteVisit(id: string, input: {preferredDate: string; timeSlot: string; note?: string}): Promise<void> {
  await apiRequest({endpoint: `/me/construction/invitations/${encodeURIComponent(id)}/site-visits`, method: 'POST', body: input});
}

async function getNormalizedBuilderInvitation(endpoint: string, method: 'PATCH', body: Record<string, unknown>): Promise<BuilderRfqInvitation> {
  const item = await apiRequest<BuilderRfqInvitation, Record<string, unknown>>({endpoint, method, body});
  return {...item, id: String(item.id), request: {...item.request, id: String(item.request.id)}};
}

export interface PlanRequest {
  id: string;
  requestNo?: string;
  title?: string;
  description?: string;
  status?: string;
  createdAt?: string;
  budgetMax?: string | number;
  followUpAt?: string;
  nextAction?: string;
  quotes?: {
    id: string;
    amount: string | number;
    createdAt?: string;
    validityDate?: string;
    notes?: string;
  }[];
  statusHistory?: {
    id: string;
    newStatus: string;
    createdAt?: string;
    remarks?: string;
  }[];
}

export async function createConstructionPlanRequest(input: {
  builderName: string;
  planName: string;
  location: string;
  plotAreaSqFt?: number;
  builtUpAreaSqFt: number;
  floors: number;
  estimate: number;
  upgrades: string[];
  notes?: string;
}): Promise<PlanRequest> {
  const result = await apiRequest<PlanRequest>({
    endpoint: '/construction/requests',
    method: 'POST',
    body: {
      title: `${input.planName} construction quote request`,
      description: `Preferred builder: ${
        input.builderName
      }. Selected upgrades: ${
        input.upgrades.join(', ') || 'None'
      }. Estimated cost: INR ${input.estimate}. Additional notes: ${
        input.notes?.trim() || 'None'
      }. Please share a final quotation.`,
      plotAreaSqft: input.plotAreaSqFt,
      builtUpAreaSqft: input.builtUpAreaSqFt,
      floors: input.floors,
      address: input.location,
      budgetMax: input.estimate,
      priority: 'medium',
    },
  });
  // Keep the complete request response. The request can include a generated
  // number, quotation and status timeline, all of which are rendered in the
  // later quote and tracking screens.
  return { ...result, id: String(result.id) };
}

export async function getConstructionPlanRequest(
  id: string,
): Promise<PlanRequest> {
  const result = await apiRequest<PlanRequest>({
    endpoint: `/construction/requests/${encodeURIComponent(id)}`,
  });
  // Do not discard quote, status-history and pricing details needed by the
  // quote-detail and project-tracking steps.
  return { ...result, id: String(result.id) };
}

export async function listConstructionPlanRequests(): Promise<PlanRequest[]> {
  return getAllPages<PlanRequest>('/me/construction/requests');
}

export async function acceptConstructionQuote(
  requestId: string,
  quoteId: string,
): Promise<PlanRequest> {
  return apiRequest<PlanRequest>({
    endpoint: `/construction/requests/${encodeURIComponent(
      requestId,
    )}/accept-quote`,
    method: 'POST',
    body: { quoteId },
  });
}

export async function requestConstructionMeeting(
  requestId: string,
  preferredAt: string,
): Promise<PlanRequest> {
  return apiRequest<PlanRequest>({
    endpoint: `/construction/requests/${encodeURIComponent(
      requestId,
    )}/request-meeting`,
    method: 'POST',
    body: { preferredAt },
  });
}
