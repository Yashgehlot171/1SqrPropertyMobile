import {apiRequest, ApiError} from '@/api';
import {ApiRouteService} from '@/config/app-reference';
import {buildQueryString} from '@/services/masterApi';
import type {Lead, LeadStatus, LocationInfo, Remark, UserRole, UserSummary} from '@/types';

// ---------------------------------------------------------------------------
// Backend response shapes (from lead.service.ts's serialize(), lead.repository.ts's
// leadInclude/findById, and the live-verified payloads captured 2026-09-07 against
// http://3.109.54.6/api/v1). Loosely typed on purpose, following propertyApi.ts's
// established pattern: nested refs only ever need the fields actually consumed here.
// ---------------------------------------------------------------------------

interface BackendLeadStatusRef {
  id: number;
  name: string;
  slug: string;
}

interface BackendLeadUserSummary {
  id: number | string;
  fullName?: string | null;
  email?: string | null;
  mobile?: string | null;
  selectedRole?: string | null;
}

interface BackendLeadNamedRef {
  id: number;
  name: string;
  [key: string]: unknown;
}

interface BackendLeadLocation {
  cityId?: number | null;
  areaId?: number | null;
  city?: BackendLeadNamedRef | null;
  area?: BackendLeadNamedRef | null;
}

// Verified against lead.repository.ts's leadInclude: the embedded property relation
// is explicitly select()ed to only id/title/slug/ownerId/assignedAgentId/location —
// `price` is never selected, hence its absence below (see normalizeLeadProperty's
// price: 0 placeholder further down).
interface BackendLeadProperty {
  id: number | string;
  title?: string | null;
  slug?: string | null;
  ownerId?: number | string | null;
  assignedAgentId?: number | string | null;
  location?: BackendLeadLocation | null;
}

// Raw LeadRemark row (POST /leads/:leadId/remarks response, and each item of a
// lead's `remarks` array). No joined `user` relation is returned anywhere in this
// module — only a bare `userId` — so there is no display name available for who
// added a remark (see normalizeRemark's addedBy handling below).
interface BackendLeadRemark {
  id: number | string;
  leadId?: number | string;
  userId?: number | string | null;
  remark: string;
  visibility?: 'internal' | 'public' | null;
  attachmentFileId?: number | string | null;
  createdAt: string;
}

// Raw LeadFollowUp row (PATCH /leads/:leadId/follow-up response, and each item of a
// lead's `followUps` array).
interface BackendLeadFollowUp {
  id: number | string;
  leadId?: number | string;
  assignedToId?: number | string | null;
  followUpAt: string;
  status?: string | null;
  priority?: string | null;
  nextAction?: string | null;
  reminderAt?: string | null;
  notes?: string | null;
  completedAt?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

// Only present on GET /leads/:leadId (single detail), never on GET /me/leads list
// items — lead.repository.ts's findById() extends leadInclude with statusHistory
// (plus assignments/activities, neither of which this module surfaces), while list
// items only get the base leadInclude. lead.service.ts's serialize() always emits
// the key as `lead.statusHistory ?? undefined`, so on a list item it serializes to
// `undefined` and is dropped entirely by JSON — the presence check in normalizeLead
// below relies on exactly that.
interface BackendLeadStatusHistoryEntry {
  id: number | string;
  leadId?: number | string;
  oldStatusId?: number | null;
  newStatusId?: number;
  changedById?: number | string | null;
  remarks?: string | null;
  createdAt: string;
  newStatus?: BackendLeadStatusRef | null;
}

interface BackendLead {
  id: number | string;
  leadNo?: string | null;
  status?: BackendLeadStatusRef | null;
  source?: BackendLeadStatusRef | null;
  customer?: BackendLeadUserSummary | null;
  property?: BackendLeadProperty | null;
  assignedTo?: BackendLeadUserSummary | null;
  name?: string | null;
  mobile?: string | null;
  email?: string | null;
  message?: string | null;
  budgetMin?: number | null;
  budgetMax?: number | null;
  priority?: string | null;
  nextAction?: string | null;
  requirement?: Record<string, unknown> | null;
  remarks?: BackendLeadRemark[] | null;
  followUps?: BackendLeadFollowUp[] | null;
  statusHistory?: BackendLeadStatusHistoryEntry[];
  createdAt: string;
  updatedAt?: string | null;
}

interface BackendLeadListResponse {
  items?: BackendLead[];
  pagination?: {page: number; limit: number; total: number; totalPages: number};
  // Not consumed here: GET /me/leads's analytics block (leadCount/callCount/
  // whatsAppCount/interestedCount/convertedCount/lostCount/averageResponseTimeMinutes)
  // has no mock equivalent and no place to put it on the mock Lead[] return shape.
  analytics?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Status mapping.
//
// Unlike property's status mapping (11 backend values -> 5 mock values, a genuinely
// lossy many-to-one reduction), leads are a clean 1:1: leadStatusSlugSchema
// (lead.validator.ts) has exactly 8 lowercase-kebab slugs, and the mobile LeadStatus
// union (lead.types.ts) has the same 8 values in Title Case. 'Converted' was added to
// LeadStatus specifically to keep this mapping total rather than lossy.
// ---------------------------------------------------------------------------
const STATUS_SLUG_TO_LABEL: Record<string, LeadStatus> = {
  new: 'New',
  contacted: 'Contacted',
  interested: 'Interested',
  'site-visit': 'Site Visit',
  negotiation: 'Negotiation',
  closed: 'Closed',
  lost: 'Lost',
  converted: 'Converted',
};

const LABEL_TO_STATUS_SLUG: Record<LeadStatus, string> = {
  New: 'new',
  Contacted: 'contacted',
  Interested: 'interested',
  'Site Visit': 'site-visit',
  Negotiation: 'negotiation',
  Closed: 'closed',
  Lost: 'lost',
  Converted: 'converted',
};

function mapLeadStatus(slug?: string | null): LeadStatus {
  if (!slug) {
    return 'New';
  }
  const mapped = STATUS_SLUG_TO_LABEL[slug];
  if (!mapped) {
    // Defensive fallback only: leadStatusSlugSchema is a closed 8-value enum on the
    // backend, so an unrecognized slug here would indicate real backend/DB drift
    // (e.g. a new status added server-side without a matching mobile release), not
    // an expected case.
    console.warn(`leadApi: unrecognized backend lead status slug "${slug}"`);
    return 'New';
  }
  return mapped;
}

function toBackendLeadStatusSlug(status: LeadStatus): string {
  return LABEL_TO_STATUS_SLUG[status];
}

// Statuses for which updateLeadStatusSchema's superRefine requires a non-empty
// `remark`, and the one status requiring `visitDate` — enforced client-side too so a
// missing-field mistake fails fast instead of round-tripping to the backend for a
// 422 (mirrors this schema's own validation rules exactly).
const STATUS_SLUGS_REQUIRING_REMARK = new Set(['closed', 'lost', 'converted']);
const STATUS_SLUG_REQUIRING_VISIT_DATE = 'site-visit';

// ---------------------------------------------------------------------------
// Shared normalizers.
// ---------------------------------------------------------------------------

const USER_ROLE_VALUES: UserRole[] = ['buyer', 'seller', 'broker'];

function toUserRole(value?: string | null): UserRole {
  return USER_ROLE_VALUES.find(role => role === value) ?? 'buyer';
}

// Known gap (same reasoning as propertyApi.ts's FALLBACK_OWNER): the customer/
// assignedTo summaries returned here have no city field at all, but the mock's
// UserSummary requires city: string (non-optional). Defaulting to '' rather than
// inventing a fake city.
function normalizeLeadUserSummary(user?: BackendLeadUserSummary | null): UserSummary | undefined {
  if (!user) {
    return undefined;
  }
  return {
    id: String(user.id),
    name: user.fullName ?? '',
    mobile: user.mobile ?? '',
    email: user.email ?? undefined,
    role: toUserRole(user.selectedRole),
    city: '',
    avatar: undefined,
  };
}

const FALLBACK_LEAD_BUYER: UserSummary = {
  id: '',
  name: '',
  mobile: '',
  role: 'buyer',
  city: '',
};

function normalizeLeadLocation(location?: BackendLeadLocation | null): LocationInfo {
  return {
    city: location?.city?.name ?? '',
    // No state is ever returned on the embedded lead.property.location (only
    // cityId/areaId/city/area per leadInclude) — same data gap as propertyApi.ts's
    // normalizeLocation, defaulted to '' rather than fabricated.
    state: '',
    area: location?.area?.name ?? undefined,
  };
}

// Known gap: lead.repository.ts's leadInclude selects only id/title/slug/ownerId/
// assignedAgentId/location for the embedded property — `price` is never returned.
// Defaulted to 0 (least-surprising placeholder for a genuinely-missing numeric
// field, matching propertyApi.ts's own placeholder-default choices) rather than
// fabricating a nonzero value or making Lead.property.price optional (which would
// ripple into every consumer of the shared Property/Lead types).
function normalizeLeadProperty(property?: BackendLeadProperty | null): Lead['property'] {
  return {
    id: property ? String(property.id) : '',
    title: property?.title ?? '',
    price: 0,
    location: normalizeLeadLocation(property?.location),
  };
}

// No joined `user` relation is ever returned for a remark's author — only a bare
// `userId`. String(userId) is used rather than a generic "You" placeholder: it is
// almost always the current user's own id (remarks are self-authored from this app),
// but a real identifier is more information-preserving than a fabricated label, and
// still correctly distinguishes remarks left by someone else (e.g. an admin/broker)
// on a lead this user can read.
function normalizeRemark(raw: BackendLeadRemark): Remark {
  return {
    id: String(raw.id),
    text: raw.remark,
    addedBy: raw.userId !== undefined && raw.userId !== null ? String(raw.userId) : 'Unknown',
    date: raw.createdAt,
  };
}

// Only populated from getLeadById's response (see BackendLead.statusHistory's
// comment above) — list items from getLeads have no statusHistory at all, so
// normalizeLead maps `history: []` for them rather than guessing.
function normalizeStatusHistoryEntry(
  raw: BackendLeadStatusHistoryEntry,
): Lead['history'][number] {
  return {
    id: String(raw.id),
    status: mapLeadStatus(raw.newStatus?.slug),
    // Same author-name gap as normalizeRemark above: changedById is a bare id, no
    // joined user relation.
    updatedBy:
      raw.changedById !== undefined && raw.changedById !== null
        ? String(raw.changedById)
        : 'Unknown',
    updatedAt: raw.createdAt,
    note: raw.remarks ?? undefined,
  };
}

function normalizeLead(raw: BackendLead): Lead {
  // Both remarks (leadInclude: orderBy createdAt desc) and followUps (leadInclude:
  // orderBy followUpAt desc) already arrive newest-first from the backend, matching
  // the mock's own newest-first convention (leadStore's addRemark/updateLeadStatus
  // used unshift) — no client-side re-sort needed.
  const remarks = (raw.remarks ?? []).map(normalizeRemark);
  const followUps = raw.followUps ?? [];

  return {
    id: String(raw.id),
    buyer: normalizeLeadUserSummary(raw.customer) ?? FALLBACK_LEAD_BUYER,
    property: normalizeLeadProperty(raw.property),
    status: mapLeadStatus(raw.status?.slug),
    lastRemark: remarks[0]?.text,
    // followUps[0] is the newest by followUpAt (orderBy desc on the backend), used
    // here purely as a convenience "most recent follow-up date" field — the mock
    // model never had a richer follow-up concept than this single optional string.
    followUpDate: followUps[0]?.followUpAt ?? undefined,
    remarks,
    // list items (getLeads) never carry statusHistory at all (see BackendLead's
    // comment); only getLeadById's single-detail response does.
    history: raw.statusHistory ? raw.statusHistory.map(normalizeStatusHistoryEntry) : [],
    createdAt: raw.createdAt ?? '',
  };
}

// ---------------------------------------------------------------------------
// GET /me/leads (myLeadRouter, auth: 'access'). leadListQuerySchema supports more
// filters (search, assignedUserId, cityId, areaId, source, customerId, brokerId,
// dateFrom, dateTo) than are exposed here — only the subset this module's screens
// plausibly need (status/propertyId/page/limit/sortBy/sortOrder) is surfaced,
// matching this module's established "don't over-build params nobody asked for"
// pattern (see propertyApi.ts's getMyProperties/getSavedProperties, which only take
// page/limit).
// ---------------------------------------------------------------------------

export interface LeadListParams {
  status?: LeadStatus;
  propertyId?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'priority';
  sortOrder?: 'asc' | 'desc';
}

export async function getLeads(params?: LeadListParams): Promise<Lead[]> {
  const query = {
    status: params?.status ? toBackendLeadStatusSlug(params.status) : undefined,
    propertyId: params?.propertyId,
    page: params?.page,
    limit: params?.limit,
    sortBy: params?.sortBy,
    sortOrder: params?.sortOrder,
  };
  const endpoint = `${ApiRouteService.leads.mine}${buildQueryString(query)}`;

  const response = await apiRequest<BackendLeadListResponse>({
    endpoint,
    method: 'GET',
    auth: 'access',
  });

  // response.analytics is intentionally not consumed/returned — see
  // BackendLeadListResponse's comment above.
  return (response.items ?? []).map(normalizeLead);
}

// ---------------------------------------------------------------------------
// GET /leads/:leadId (leadRouter, auth: 'access') — a new function; the mock never
// had single-lead detail, it only ever derived "detail" by finding an item in the
// already-fetched list. Same ApiError/status===404 -> undefined idiom as
// propertyApi.ts's getPropertyById/fetchRawProperty.
// ---------------------------------------------------------------------------

export async function getLeadById(leadId: string): Promise<Lead | undefined> {
  const endpoint = ApiRouteService.leads.detail.replace(':leadId', leadId);

  try {
    const response = await apiRequest<BackendLead>({
      endpoint,
      method: 'GET',
      auth: 'access',
    });
    return response ? normalizeLead(response) : undefined;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return undefined;
    }
    throw error;
  }
}

// ---------------------------------------------------------------------------
// PATCH /leads/:leadId/status (auth: 'access'). updateLeadStatusSchema requires
// `remark` when status is closed/lost/converted, and `visitDate` when status is
// site-visit (live-confirmed 2026-09-07) — enforced client-side below so a missing
// field fails fast with a clear message instead of a round-trip 422.
//
// Signature widened from the mock's `(leadId, status)` to add an `options` param
// carrying remark/visitDate. LeadDetailScreen calls this function directly.
// ---------------------------------------------------------------------------

export interface UpdateLeadStatusOptions {
  remark?: string;
  visitDate?: string;
}

export async function updateLeadStatus(
  leadId: string,
  status: LeadStatus,
  options: UpdateLeadStatusOptions = {},
): Promise<Lead | undefined> {
  const slug = toBackendLeadStatusSlug(status);

  if (STATUS_SLUGS_REQUIRING_REMARK.has(slug) && !options.remark?.trim()) {
    throw new Error(
      `updateLeadStatus: a remark is required when moving a lead to "${status}"`,
    );
  }
  if (slug === STATUS_SLUG_REQUIRING_VISIT_DATE && !options.visitDate) {
    throw new Error(
      'updateLeadStatus: a visitDate is required when moving a lead to "Site Visit"',
    );
  }

  const endpoint = ApiRouteService.leads.updateStatus.replace(':leadId', leadId);

  try {
    const response = await apiRequest<
      BackendLead,
      {status: string; remark?: string; visitDate?: string}
    >({
      endpoint,
      method: 'PATCH',
      body: {status: slug, remark: options.remark, visitDate: options.visitDate},
      auth: 'access',
    });
    return response ? normalizeLead(response) : undefined;
  } catch (error) {
    // Matches getLeadById's missing-resource-is-not-exceptional reasoning.
    if (error instanceof ApiError && error.status === 404) {
      return undefined;
    }
    throw error;
  }
}

// ---------------------------------------------------------------------------
// POST /leads/:leadId/remarks (auth: 'access') — leadRemarkSchema. Body widened
// from the mock's plain `text` to `{remark, visibility}`; `visibility` is exposed
// as an optional third param (defaulting to 'internal', matching the schema's own
// default) rather than forcing every call site to pass it.
//
// LeadDetailScreen's remark UI calls this function directly.
// ---------------------------------------------------------------------------

export async function addLeadRemark(
  leadId: string,
  text: string,
  visibility: 'internal' | 'public' = 'internal',
): Promise<Remark | undefined> {
  const endpoint = ApiRouteService.leads.addRemark.replace(':leadId', leadId);

  try {
    const response = await apiRequest<
      BackendLeadRemark,
      {remark: string; visibility: 'internal' | 'public'}
    >({
      endpoint,
      method: 'POST',
      body: {remark: text, visibility},
      auth: 'access',
    });
    return response ? normalizeRemark(response) : undefined;
  } catch (error) {
    // Mirrors the mock's original contract of resolving to `undefined` for a lead
    // that can't be found/acted on, rather than the caller having to catch a reject.
    if (error instanceof ApiError && error.status === 404) {
      return undefined;
    }
    throw error;
  }
}

// ---------------------------------------------------------------------------
// PATCH /leads/:leadId/follow-up (auth: 'access') — leadFollowupSchema. Entirely
// new: the mock had no follow-up concept beyond a bare `followUpDate?: string`
// convenience field on Lead itself. Return type is the normalized raw
// LeadFollowUp row confirmation — there is no existing mock type to map it into.
// ---------------------------------------------------------------------------

export interface ScheduleLeadFollowUpInput {
  // ISO 8601 date string; leadFollowupSchema's `followUpAt: z.coerce.date()`
  // accepts a string and coerces it server-side.
  followUpAt: string;
  // Required, 1-150 chars per leadFollowupSchema.
  nextAction: string;
  reminderAt?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  notes?: string;
  assignedToId?: string;
}

export interface LeadFollowUp {
  id: string;
  leadId: string;
  followUpAt: string;
  status: string;
  priority: string;
  nextAction: string;
  reminderAt?: string;
  notes?: string;
  assignedToId?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

function normalizeFollowUp(raw: BackendLeadFollowUp): LeadFollowUp {
  return {
    id: String(raw.id),
    leadId: raw.leadId !== undefined ? String(raw.leadId) : '',
    followUpAt: raw.followUpAt,
    status: raw.status ?? '',
    priority: raw.priority ?? '',
    nextAction: raw.nextAction ?? '',
    reminderAt: raw.reminderAt ?? undefined,
    notes: raw.notes ?? undefined,
    assignedToId: raw.assignedToId !== undefined && raw.assignedToId !== null
      ? String(raw.assignedToId)
      : undefined,
    completedAt: raw.completedAt ?? undefined,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt ?? raw.createdAt,
  };
}

export async function scheduleLeadFollowUp(
  leadId: string,
  input: ScheduleLeadFollowUpInput,
): Promise<LeadFollowUp | undefined> {
  const endpoint = ApiRouteService.leads.followUp.replace(':leadId', leadId);

  try {
    const response = await apiRequest<
      BackendLeadFollowUp,
      {
        followUpAt: string;
        nextAction: string;
        reminderAt?: string;
        priority?: string;
        notes?: string;
        assignedToId?: number;
      }
    >({
      endpoint,
      method: 'PATCH',
      body: {
        followUpAt: input.followUpAt,
        nextAction: input.nextAction,
        reminderAt: input.reminderAt,
        priority: input.priority,
        notes: input.notes,
        assignedToId: input.assignedToId ? Number(input.assignedToId) : undefined,
      },
      auth: 'access',
    });
    return response ? normalizeFollowUp(response) : undefined;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return undefined;
    }
    throw error;
  }
}

// NOTE: There is no mobile-facing "create a lead" endpoint. Leads only ever get
// created server-side as a side-effect of property contact actions (call/whatsapp/
// interested/contact/save/share — see propertyApi.ts's trackPropertyCall/
// trackPropertyWhatsapp/markPropertyInterested/trackPropertyContact/saveProperty/
// trackPropertyShare). This module is intentionally read/manage-existing-leads only.
