import {apiRequest} from '@/api';
import {ApiRouteService} from '@/config/app-reference';

/**
 * Exhaustive list of valid `type` values for GET /masters/:type, confirmed via the
 * backend's own Zod enum validation error message (src/validators/master.validator.ts).
 *
 * Note: "banks" is intentionally NOT included here. Bank data lives at a separate,
 * auth-required endpoint (GET /loans/banks, ApiRouteService.loans.banks) that belongs
 * to a future loan module, not the masters endpoint.
 *
 * Note: the UI concept "issue type" (used for support ticket forms) maps to the
 * `support-categories` master type, not a dedicated "issue-types" type. The backend
 * stores a support ticket's `issueTypeId` as `supportCategoryId`
 * (see supportTicket.validator.ts / supportTicket.service.ts), so a support ticket
 * issue-type dropdown should call getMasterData('support-categories').
 */
export type MasterType =
  | 'states'
  | 'cities'
  | 'areas'
  | 'property-types'
  | 'property-categories'
  | 'listing-types'
  | 'bhk-options'
  | 'facing-directions'
  | 'amenities'
  | 'construction-qualities'
  | 'lead-statuses'
  | 'lead-sources'
  | 'support-categories'
  | 'support-statuses'
  | 'legal-statuses'
  | 'loan-statuses'
  | 'banner-types'
  | 'app-content-types'
  | 'ready-states'
  | 'property-statuses'
  | 'material-categories'
  | 'service-roles'
  | 'broker-statuses'
  | 'supplier-statuses'
  | 'provider-statuses'
  | 'notification-targets';

export interface MasterRecord {
  id: number;
  type: string;
  name: string;
  code: string | null;
  description: string | null;
  parentId: number | null;
  sortOrder: number;
  status: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface MasterPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface MasterListParams {
  search?: string;
  page?: number;
  limit?: number;
}

export interface MasterListResult {
  items: MasterRecord[];
  pagination: MasterPagination;
}

interface BackendMasterItem {
  id: number;
  type?: string;
  name?: string;
  code?: string | null;
  description?: string | null;
  parentId?: number | null;
  sortOrder?: number;
  status?: string;
  metadata?: Record<string, unknown> | null;
  createdAt?: string;
  updatedAt?: string;
}

interface BackendMasterListResponse {
  items?: BackendMasterItem[];
  pagination?: Partial<MasterPagination>;
}

export function buildQueryString(params?: object): string {
  if (!params) {
    return '';
  }

  const searchParams = new URLSearchParams();
  Object.entries(params as Record<string, unknown>).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });

  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

export function normalizeMasterRecord(item: BackendMasterItem): MasterRecord {
  return {
    id: item.id,
    type: item.type ?? '',
    name: item.name ?? '',
    code: item.code ?? null,
    description: item.description ?? null,
    parentId: item.parentId ?? null,
    sortOrder: item.sortOrder ?? 0,
    status: item.status ?? 'active',
    metadata: item.metadata ?? {},
    createdAt: item.createdAt ?? '',
    updatedAt: item.updatedAt ?? '',
  };
}

export function normalizeMasterPagination(
  pagination: Partial<MasterPagination> | undefined,
  fallbackTotal = 0,
): MasterPagination {
  return {
    page: pagination?.page ?? 1,
    limit: pagination?.limit ?? fallbackTotal,
    total: pagination?.total ?? fallbackTotal,
    totalPages: pagination?.totalPages ?? 1,
  };
}

export async function getMasterData(
  type: MasterType,
  params?: MasterListParams,
): Promise<MasterListResult> {
  const endpoint = `${ApiRouteService.masters.byType.replace(':type', type)}${buildQueryString(
    params,
  )}`;

  const response = await apiRequest<BackendMasterListResponse>({
    endpoint,
    method: 'GET',
    auth: 'none',
  });

  const items = (response.items ?? []).map(normalizeMasterRecord);

  return {
    items,
    pagination: normalizeMasterPagination(response.pagination, items.length),
  };
}
