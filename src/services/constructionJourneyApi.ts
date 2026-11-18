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
  matchLevel?: 'LOCALITY_MATCH' | 'CITY_MATCH';
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
  status: 'SENT' | 'VIEWED' | 'INTERESTED' | 'CLARIFICATION_REQUIRED' | 'SITE_VISIT_REQUESTED' | 'DECLINED' | 'SELECTED' | 'NOT_SELECTED';
  sentAt: string;
  viewedAt?: string | null;
  respondedAt?: string | null;
  declinedAt?: string | null;
  provider: EligibleBuilder;
  siteVisitRequest?: BuilderSiteVisit | null;
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
export interface BuilderSiteVisit {id: string; preferredDate: string; timeSlot: string; note?: string | null; responseNote?: string | null; status: string; createdAt: string; updatedAt?: string; history?: {id: string; status: string; preferredDate: string; timeSlot: string; note?: string | null; createdAt: string}[]}
export interface CustomerBuilderProfile {
  id: string; name: string; firmName: string; officeLocation?: string | null; city?: string | null;
  about?: string | null;
  serviceLocalities: {id: number; name: string}[]; experienceYears?: number | null; reraNumber?: string | null; gstNumber?: string | null;
  verified: boolean; constructionCapability: string; servesSelectedLocality: boolean;
  profileImageUrl?: string | null; instagramUrl?: string | null; youtubeUrl?: string | null;
  verifiedProjects?: {id: string; title: string; projectType: string; city?: string | null; locality?: string | null; completedAt?: string | null; verified: true; images: {url: string; thumbnailUrl: string}[]}[];
  portfolio?: {id: string; title: string; description?: string | null; city?: string | null; projectType?: string | null; completedAt?: string | null; label: 'Builder Portfolio'; images: {url: string; thumbnailUrl: string}[]}[];
  customerReviews?: {averageRating: number | null; verifiedReviewCount: number; reviews: {id: string; rating: number; workQualityRating: number | null; communicationRating: number | null; timelinessRating: number | null; valueForMoneyRating: number | null; reviewText: string | null; createdAt: string; updatedAt: string; verified: true; customerDisplayName: string}[]};
  plans: {id: string; name: string; versionId: string; version: number; status: 'APPROVED'; content: import('./builderConstructionPlanApi').BuilderPlanContent}[];
}
export interface BuilderDashboardSummary {newRfqs: number; pendingActions: number; siteVisitRequests: number; totalRfqs: number}
export interface QuotationPlan {
  id: string; version: number; planId: string; name: string; status: string;
  pricingBasis?: string | null; indicativeRatePerSqFt?: number | string | null;
  content: import('./builderConstructionPlanApi').BuilderPlanContent;
}
export interface BuilderQuotationDraft {
  planVersionId?: string | null; billableAreaSqFt?: number | null; areaAssessmentNote?: string;
  pricingBasis?: 'PER_SQ_FT' | 'FIXED'; ratePerSqFt?: number | null; baseAmount?: number | null; pricingNote?: string;
  additionalWork?: {name: string; description?: string; calculationType: 'QUANTITY_RATE' | 'FIXED'; quantity?: number; unit?: string; rate?: number; amount?: number}[];
  discount?: {type: 'FIXED' | 'PERCENTAGE'; value: number} | null;
  timeline?: {duration: number; unit: 'DAYS' | 'MONTHS'; expectedStartNote?: string; notes?: string};
  paymentSchedule?: {type: 'PERCENTAGE'; milestones: {sequence: number; name: string; percentage: number; description?: string}[]};
  inclusions?: string[]; exclusions?: string[];
  warranty?: {duration?: number | null; unit?: 'MONTHS' | 'YEARS' | null; description?: string};
  terms?: string; additionalNotes?: string;
}
export interface BuilderQuotation {
  id?: string; status: 'DRAFT' | 'SUBMITTED' | null; quoteNo?: string | null; version?: number | null;
  submittedAt?: string | null; amount?: string | number | null; draftData?: BuilderQuotationDraft | null;
  snapshot?: {request: {id: string; requestNo: string; requirementSnapshot: ConstructionRequirementSnapshot}; plan: {id: string; name: string; versionId: string; version: number; content: import('./builderConstructionPlanApi').BuilderPlanContent}; commercial: Record<string, unknown>} | null;
  request?: {id: string; requestNo: string; requirementSnapshot: ConstructionRequirementSnapshot};
  latestSubmittedVersion?: number | null;
  openRevision?: {id: string; sourceVersionId: string; status: 'OPEN'; message: string; createdAt: string} | null;
}

export interface CustomerQuotationSummary {
  id: string; quoteNo: string; version: number; status: string; submittedAt: string; amount: string;
  builder: {name: string}; request: {requestNo: string}; plan: {name: string; version: number};
  commercial: {billableAreaSqFt: string | null; pricingBasis: 'PER_SQ_FT' | 'FIXED' | null; ratePerSqFt: string | null; totalAmount: string; timeline: Record<string, unknown> | null};
  selectionStatus?: 'SELECTED' | 'NOT_SELECTED' | 'AVAILABLE'; selectedVersionId?: string | null;
}
export interface CustomerQuotation extends Omit<CustomerQuotationSummary, 'request' | 'plan' | 'commercial'> {
  request: {requestNo: string; requirement: ConstructionRequirementSnapshot};
  plan: {name: string; version: number; description: string | null; specifications: {category: string; data: Record<string, unknown>}[]};
  commercial: {
    billableAreaSqFt: string | null; areaAssessmentNote: string | null; pricingBasis: 'PER_SQ_FT' | 'FIXED' | null;
    ratePerSqFt: string | null; baseAmount: string | null; pricingNote: string | null;
    additionalWork: {name: string; description: string | null; calculationType: string; quantity: string | null; unit: string | null; rate: string | null; amount: string}[];
    subtotal: string | null; discount: {type: string; value: string | null} | null; discountAmount: string | null; taxAmount: string; taxApplied: boolean;
    totalAmount: string; timeline: Record<string, unknown> | null; paymentSchedule: Record<string, unknown> | null;
    inclusions: string[]; exclusions: string[]; warranty: Record<string, unknown> | null; terms: string | null; additionalNotes: string | null;
  };
}
export interface CustomerQuotationVersions {
  id: string; quoteNo: string | null; versions: {id: string; version: number; status: string; amount: string; submittedAt: string}[];
  revisionRequests: {id: string; sourceVersionId: string; status: string; message: string; categories?: string[] | null; resultingVersionId: string | null; createdAt: string}[];
}
export interface CustomerRfqSelection {requestNo: string; rfqStatus: string; builder: {name: string}; quoteId: string; quoteNo: string | null; versionId: string; version: number; amount: string; billableAreaSqFt: string | null; timeline: Record<string, unknown> | null; selectedAt: string}
export interface ConstructionProject {
  id: string; projectNo: string; status: string; createdAt: string; updatedAt: string;
  customer: {id?: string; name?: string}; builder: {userId?: string; providerId?: string; name?: string; providerName?: string; verified?: boolean};
  requirement: ConstructionRequirementSnapshot; plan: Record<string, unknown> | null;
  quotation: Record<string, any>; commercial: Record<string, any>;
  source: {selectionId: string; requestId: string; requestNo: string; invitationId: string; quoteId: string; quoteNo?: string | null; quoteVersionId: string; quoteVersion: number; quoteSubmittedAt: string};
  agreement: null | {id: string; agreementNo: string; version: number; status: string; amount: string; billableAreaSqFt: string | null; customerAcceptedAt: string | null; builderAcceptedAt: string | null; acceptedAt: string | null; snapshot: Record<string, unknown>};
}
export interface ConstructionMilestoneProgress {
  projectId: string; projectNo: string; projectStatus: string; actualStartDate?: string | null; agreementAccepted: boolean; overallProgress: number;
  plan: null | {id: string; status: 'DRAFT' | 'SUBMITTED' | 'ACCEPTED'; revision: number; submittedAt?: string | null; acceptedAt?: string | null; milestones: ConstructionMilestone[]};
}
export interface ConstructionMilestone {id: string; title: string; description?: string | null; sequence: number; plannedStartDate?: string | null; plannedEndDate?: string | null; status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'; progressPercentage: number; notes?: string | null; startedAt?: string | null; completedAt?: string | null; delayed: boolean; updates: {id: string; updateDate: string; progressPercentage: number; workCompleted: string; nextWork?: string | null; issues?: string | null; builderNote?: string | null; createdAt: string; photos: {id: string; fileId: string; url: string; uploadedAt: string}[]}[]}
export interface BuilderQuotationRevision {id: string; message: string; categories?: string[] | null; status: string; createdAt: string; quoteId: string; quoteNo: string | null; invitationId: string; currentVersion: number | null; sourceVersionId: string; request: {id: string; requestNo: string}}
type BackendCustomerQuote<T> = Omit<T, 'id'> & {id: string | number};
export async function listCustomerQuotations(rfqId: string): Promise<CustomerQuotationSummary[]> {
  const rows = await apiRequest<BackendCustomerQuote<CustomerQuotationSummary>[]>({endpoint: `/construction/rfqs/${encodeURIComponent(rfqId)}/quotations`});
  return rows.map(row => ({...row, id: String(row.id)}));
}
export async function getCustomerQuotation(rfqId: string, quoteId: string): Promise<CustomerQuotation> {
  const row = await apiRequest<BackendCustomerQuote<CustomerQuotation>>({endpoint: `/construction/rfqs/${encodeURIComponent(rfqId)}/quotations/${encodeURIComponent(quoteId)}`});
  return {...row, id: String(row.id)};
}
export async function getCustomerQuotationVersion(rfqId: string, quoteId: string, version: number): Promise<CustomerQuotation> {
  const row = await apiRequest<BackendCustomerQuote<CustomerQuotation>>({endpoint: `/construction/rfqs/${encodeURIComponent(rfqId)}/quotations/${encodeURIComponent(quoteId)}?version=${version}`});
  return {...row, id: String(row.id)};
}
export async function getCustomerQuotationVersions(rfqId: string, quoteId: string): Promise<CustomerQuotationVersions> {
  const row = await apiRequest<Omit<CustomerQuotationVersions, 'id'> & {id: string | number; versions: (Omit<CustomerQuotationVersions['versions'][number], 'id'> & {id: string | number})[]}>({endpoint: `/construction/rfqs/${encodeURIComponent(rfqId)}/quotations/${encodeURIComponent(quoteId)}/versions`});
  return {...row, id: String(row.id), versions: row.versions.map(item => ({...item, id: String(item.id)}))};
}
export async function requestCustomerQuotationRevision(rfqId: string, quoteId: string, message: string): Promise<void> {
  await apiRequest({endpoint: `/construction/rfqs/${encodeURIComponent(rfqId)}/quotations/${encodeURIComponent(quoteId)}/revisions`, method: 'POST', body: {message}});
}
export async function selectCustomerQuotationVersion(rfqId: string, quoteId: string, version: number): Promise<void> {
  await apiRequest({endpoint: `/construction/rfqs/${encodeURIComponent(rfqId)}/quotations/${encodeURIComponent(quoteId)}/versions/${version}/select`, method: 'POST'});
}
export async function getCustomerRfqSelection(rfqId: string): Promise<CustomerRfqSelection | null> {
  try { return await apiRequest<CustomerRfqSelection>({endpoint: `/construction/rfqs/${encodeURIComponent(rfqId)}/selection`}); }
  catch (error) { if (error instanceof Error && /not found|404/i.test(error.message)) return null; throw error; }
}
export async function initializeConstructionProject(requestId: string): Promise<ConstructionProject> {return apiRequest<ConstructionProject>({endpoint: '/construction/projects/from-selection', method: 'POST', body: {requestId}});}
export async function listCustomerConstructionProjects(): Promise<ConstructionProject[]> {return apiRequest<ConstructionProject[]>({endpoint: '/construction/projects'});}
export async function getCustomerConstructionProject(id: string): Promise<ConstructionProject> {return apiRequest<ConstructionProject>({endpoint: `/construction/projects/${encodeURIComponent(id)}`});}
export async function acceptCustomerConstructionAgreement(id: string): Promise<ConstructionProject> {return apiRequest<ConstructionProject>({endpoint: `/construction/projects/${encodeURIComponent(id)}/agreement/accept`, method: 'POST', body: {confirmed: true}});}
export async function listBuilderConstructionProjects(): Promise<ConstructionProject[]> {return apiRequest<ConstructionProject[]>({endpoint: '/me/construction/projects'});}
export async function getBuilderConstructionProject(id: string): Promise<ConstructionProject> {return apiRequest<ConstructionProject>({endpoint: `/me/construction/projects/${encodeURIComponent(id)}`});}
export async function acceptBuilderConstructionAgreement(id: string): Promise<ConstructionProject> {return apiRequest<ConstructionProject>({endpoint: `/me/construction/projects/${encodeURIComponent(id)}/agreement/accept`, method: 'POST', body: {confirmed: true}});}
export async function getCustomerMilestones(id: string): Promise<ConstructionMilestoneProgress> {return apiRequest<ConstructionMilestoneProgress>({endpoint: `/construction/projects/${encodeURIComponent(id)}/milestones`});}
export async function acceptCustomerMilestonePlan(id: string): Promise<ConstructionMilestoneProgress> {return apiRequest<ConstructionMilestoneProgress>({endpoint: `/construction/projects/${encodeURIComponent(id)}/milestones/accept`, method: 'POST', body: {confirmed: true}});}
export async function getBuilderMilestones(id: string): Promise<ConstructionMilestoneProgress> {return apiRequest<ConstructionMilestoneProgress>({endpoint: `/me/construction/projects/${encodeURIComponent(id)}/milestones`});}
export async function saveBuilderMilestonePlan(id: string, input: {expectedRevision?: number; milestones: {title: string; description?: string; sequence: number; plannedStartDate?: string; plannedEndDate?: string; notes?: string}[]}): Promise<ConstructionMilestoneProgress['plan']> {return apiRequest({endpoint: `/me/construction/projects/${encodeURIComponent(id)}/milestones/draft`, method: 'PUT', body: input});}
export async function submitBuilderMilestonePlan(id: string, expectedRevision: number): Promise<ConstructionMilestoneProgress> {return apiRequest({endpoint: `/me/construction/projects/${encodeURIComponent(id)}/milestones/submit`, method: 'POST', body: {expectedRevision}});}
export async function startBuilderProject(id: string, startDate: string): Promise<ConstructionMilestoneProgress> {return apiRequest({endpoint: `/me/construction/projects/${encodeURIComponent(id)}/start`, method: 'POST', body: {startDate}});}
export async function startBuilderMilestone(projectId: string, milestoneId: string): Promise<ConstructionMilestoneProgress> {return apiRequest({endpoint: `/me/construction/projects/${encodeURIComponent(projectId)}/milestones/${encodeURIComponent(milestoneId)}/start`, method: 'POST'});}
export async function postBuilderProgress(projectId: string, milestoneId: string, input: {idempotencyKey: string; updateDate: string; progressPercentage: number; workCompleted: string; nextWork?: string; issues?: string; builderNote?: string; fileIds?: string[]}): Promise<ConstructionMilestoneProgress> {return apiRequest({endpoint: `/me/construction/projects/${encodeURIComponent(projectId)}/milestones/${encodeURIComponent(milestoneId)}/progress`, method: 'POST', body: {...input, fileIds: (input.fileIds ?? []).map(Number)}});}

export interface ConstructionPaymentSummary {projectId: string; originalContractAmount: string; acceptedChangeOrdersTotal: string; contractAmount: string; verifiedPaid: string; pendingVerification: string; outstanding: string; availableForPayment: string; stages: ConstructionPaymentStage[]}
export interface ConstructionPaymentStage {id: string; sequence: number; title: string; description?: string | null; percentage: string; amount: string; verifiedPaid: string; pendingVerification: string; remaining: string; status: 'NOT_PAID' | 'PARTIALLY_PAID' | 'PENDING_VERIFICATION' | 'PAID'; payments: ConstructionPaymentRecord[]}
export interface ConstructionPaymentRecord {id: string; amount: string; paymentDate: string; method: string; referenceNo?: string | null; note?: string | null; status: 'SUBMITTED' | 'VERIFIED' | 'REJECTED'; submittedAt: string; verifiedAt?: string | null; rejectedAt?: string | null; rejectionReason?: string | null; proof?: {id: string; url: string; name?: string | null} | null}
export async function getCustomerConstructionPayments(id: string): Promise<ConstructionPaymentSummary> {return apiRequest({endpoint: `/construction/projects/${encodeURIComponent(id)}/payments`});}
export async function getBuilderConstructionPayments(id: string): Promise<ConstructionPaymentSummary> {return apiRequest({endpoint: `/me/construction/projects/${encodeURIComponent(id)}/payments`});}
export async function submitCustomerConstructionPayment(id: string, input: {scheduleItemId: string; amount: string; paymentDate: string; paymentMethod: 'BANK_TRANSFER' | 'UPI' | 'CHEQUE' | 'CASH' | 'OTHER'; referenceNo?: string; customerNote?: string; proofFileId?: string; idempotencyKey: string}): Promise<ConstructionPaymentSummary> {return apiRequest({endpoint: `/construction/projects/${encodeURIComponent(id)}/payments`, method: 'POST', body: input});}
export async function verifyBuilderConstructionPayment(projectId: string, paymentId: string): Promise<ConstructionPaymentSummary> {return apiRequest({endpoint: `/me/construction/projects/${encodeURIComponent(projectId)}/payments/${encodeURIComponent(paymentId)}/verify`, method: 'POST', body: {confirmed: true}});}
export async function rejectBuilderConstructionPayment(projectId: string, paymentId: string, reason: string): Promise<ConstructionPaymentSummary> {return apiRequest({endpoint: `/me/construction/projects/${encodeURIComponent(projectId)}/payments/${encodeURIComponent(paymentId)}/reject`, method: 'POST', body: {reason}});}
export interface ConstructionPaymentProof {id: string; name?: string | null; type: string; url?: string | null}
export async function getCustomerConstructionPaymentProof(projectId: string, paymentId: string): Promise<ConstructionPaymentProof> {return apiRequest({endpoint: `/construction/projects/${encodeURIComponent(projectId)}/payments/${encodeURIComponent(paymentId)}/proof`});}
export async function getBuilderConstructionPaymentProof(projectId: string, paymentId: string): Promise<ConstructionPaymentProof> {return apiRequest({endpoint: `/me/construction/projects/${encodeURIComponent(projectId)}/payments/${encodeURIComponent(paymentId)}/proof`});}
export async function listBuilderQuotationRevisions(): Promise<BuilderQuotationRevision[]> {
  return apiRequest<BuilderQuotationRevision[]>({endpoint: '/me/construction/quotation-revisions'});
}
export async function prepareBuilderQuotationRevision(invitationId: string, revisionId: string): Promise<void> {
  await apiRequest({endpoint: `/me/construction/invitations/${encodeURIComponent(invitationId)}/quotation/revisions/${encodeURIComponent(revisionId)}/prepare`, method: 'POST'});
}
export async function submitBuilderQuotationRevision(invitationId: string, revisionId: string): Promise<BuilderQuotation> {
  const item = await apiRequest<Omit<BuilderQuotation, 'id'> & {id: string | number; quoteId?: string | number}>({endpoint: `/me/construction/invitations/${encodeURIComponent(invitationId)}/quotation/revisions/${encodeURIComponent(revisionId)}/submit`, method: 'POST'});
  return {...item, id: String(item.quoteId ?? item.id), request: item.snapshot?.request ? {...item.snapshot.request, id: String(item.snapshot.request.id)} : undefined};
}

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
  return {...item, id: String(item.id), invitations: (item.invitations ?? []).map(invitation => ({...invitation, id: String(invitation.id), provider: normalizeBuilder(invitation.provider), siteVisitRequest: invitation.siteVisitRequest ? normalizeSiteVisit(invitation.siteVisitRequest) : null}))};
}

function normalizeSiteVisit(item: BuilderSiteVisit): BuilderSiteVisit {return {...item, id: String(item.id), history: item.history?.map(event => ({...event, id: String(event.id)}))};}

export async function listEligibleConstructionBuilders(params: {cityId: number; areaId: number; search?: string}): Promise<PaginatedResult<EligibleBuilder>> {
  const query = new URLSearchParams({cityId: String(params.cityId), areaId: String(params.areaId)});
  if (params.search?.trim()) query.set('search', params.search.trim());
  const response = await apiRequest<PaginatedResult<BackendBuilder>>({endpoint: `/construction/builders?${query.toString()}`, method: 'GET'});
  return {...response, items: response.items.map(normalizeBuilder)};
}

export async function getCustomerBuilderProfile(builderId: string, cityId: number, areaId: number): Promise<CustomerBuilderProfile> {
  return apiRequest<CustomerBuilderProfile>({endpoint: `/construction/builders/${encodeURIComponent(builderId)}/profile?cityId=${cityId}&areaId=${areaId}`});
}

export async function getCustomerShowcaseConsent(projectId: string): Promise<{enabled: boolean; allowedAt?: string | null; revokedAt?: string | null}> {
  return apiRequest({endpoint: `/construction/projects/${encodeURIComponent(projectId)}/showcase-consent`, method: 'GET'});
}
export async function setCustomerShowcaseConsent(projectId: string, enabled: boolean): Promise<{enabled: boolean}> {
  return apiRequest({endpoint: `/construction/projects/${encodeURIComponent(projectId)}/showcase-consent`, method: 'PUT', body: {enabled}});
}
export type BuilderPortfolioItem = {id: string; title: string; description?: string | null; cityName?: string | null; projectType?: string | null; completedAt?: string | null; media: {fileId: string; file: {id: string; originalName: string}}[]};
export async function getMyBuilderPortfolio(): Promise<BuilderPortfolioItem[]> {return apiRequest({endpoint: '/me/construction/portfolio', method: 'GET'});}
export async function saveMyBuilderPortfolio(input: {id?: string; title: string; description?: string; cityName?: string; projectType?: string; completedAt?: string | null; fileIds: string[]}): Promise<BuilderPortfolioItem> {return apiRequest({endpoint: input.id ? `/me/construction/portfolio/${encodeURIComponent(input.id)}` : '/me/construction/portfolio', method: input.id ? 'PUT' : 'POST', body: input});}
export async function deleteMyBuilderPortfolio(id: string): Promise<void> {await apiRequest({endpoint: `/me/construction/portfolio/${encodeURIComponent(id)}`, method: 'DELETE'});}
export async function getMyBuilderSocialLinks(): Promise<{bio: string | null; instagramUrl: string | null; youtubeUrl: string | null}> {return apiRequest({endpoint: '/me/construction/profile/social-links', method: 'GET'});}
export async function saveMyBuilderSocialLinks(input: {bio: string | null; instagramUrl: string | null; youtubeUrl: string | null}): Promise<{bio: string | null; instagramUrl: string | null; youtubeUrl: string | null}> {return apiRequest({endpoint: '/me/construction/profile/social-links', method: 'PUT', body: input});}
export async function getMyProjectShowcaseMedia(projectId: string): Promise<{fileId: string; name: string}[]> {return apiRequest({endpoint: `/me/construction/projects/${encodeURIComponent(projectId)}/showcase-media`, method: 'GET'});}
export async function saveMyProjectShowcaseMedia(projectId: string, fileIds: string[]): Promise<{fileId: string; name: string}[]> {return apiRequest({endpoint: `/me/construction/projects/${encodeURIComponent(projectId)}/showcase-media`, method: 'PUT', body: {fileIds}});}

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

export async function listQuotationPlans(): Promise<QuotationPlan[]> {
  const items = await apiRequest<Array<Omit<QuotationPlan, 'id' | 'planId'> & {id: string | number; planId: string | number}>>({endpoint: '/me/construction/quotation-plans'});
  return items.map(item => ({...item, id: String(item.id), planId: String(item.planId)}));
}

export async function getBuilderQuotation(invitationId: string): Promise<BuilderQuotation> {
  const item = await apiRequest<Omit<BuilderQuotation, 'id'> & {id?: string | number}>({endpoint: `/me/construction/invitations/${encodeURIComponent(invitationId)}/quotation`});
  const request = item.request ?? item.snapshot?.request;
  return {...item, id: item.id == null ? undefined : String(item.id), request: request ? {...request, id: String(request.id)} : undefined};
}

export async function saveBuilderQuotationDraft(invitationId: string, body: BuilderQuotationDraft): Promise<void> {
  await apiRequest({endpoint: `/me/construction/invitations/${encodeURIComponent(invitationId)}/quotation/draft`, method: 'PUT', body});
}

export async function submitBuilderQuotation(invitationId: string): Promise<BuilderQuotation> {
  const item = await apiRequest<Omit<BuilderQuotation, 'id'> & {id: string | number}>({endpoint: `/me/construction/invitations/${encodeURIComponent(invitationId)}/quotation/submit`, method: 'POST'});
  return {...item, id: String(item.id), request: item.snapshot?.request ? {...item.snapshot.request, id: String(item.snapshot.request.id)} : undefined};
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

export async function respondToSiteVisit(rfqId: string, invitationId: string, input: {action: 'ACCEPT' | 'RESCHEDULE' | 'REJECT'; preferredDate?: string; timeSlot?: string; note?: string}): Promise<BuilderSiteVisit> {
  const item = await apiRequest<BuilderSiteVisit>({endpoint: `/construction/rfqs/${encodeURIComponent(rfqId)}/invitations/${encodeURIComponent(invitationId)}/site-visit`, method: 'PATCH', body: input});
  return normalizeSiteVisit(item);
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
