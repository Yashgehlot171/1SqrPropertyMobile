import {apiRequest} from '@/api';
import {ApiRouteService} from '@/config/app-reference';
import {
  buildQueryString,
  normalizeMasterPagination,
  normalizeMasterRecord,
} from '@/services/masterApi';
import type {MasterPagination, MasterRecord} from '@/services/masterApi';

export type LocationType = 'state' | 'city' | 'area';

export interface LocationSearchRecord extends MasterRecord {
  locationType: LocationType;
}

export interface LocationListResult {
  items: MasterRecord[];
  pagination: MasterPagination;
}

export interface LocationSearchResult {
  items: LocationSearchRecord[];
  pagination: MasterPagination;
}

export interface LocationSearchParams {
  search?: string;
  type?: LocationType;
  page?: number;
  limit?: number;
}

const LOCATION_PAGE_SIZE = 100;

interface BackendLocationItem {
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

interface BackendLocationSearchItem extends BackendLocationItem {
  locationType?: LocationType;
}

interface BackendLocationListResponse {
  items?: BackendLocationItem[];
  pagination?: Partial<MasterPagination>;
}

interface BackendLocationSearchResponse {
  items?: BackendLocationSearchItem[];
  pagination?: Partial<MasterPagination>;
}

function normalizeLocationSearchRecord(
  item: BackendLocationSearchItem,
): LocationSearchRecord {
  return {
    ...normalizeMasterRecord(item),
    locationType: item.locationType ?? 'state',
  };
}

export async function getStates(): Promise<LocationListResult> {
  return getAllLocationPages(ApiRouteService.locations.states);
}

export async function getCitiesByState(
  stateId: number,
): Promise<LocationListResult> {
  const endpoint = ApiRouteService.locations.citiesByState.replace(
    ':stateId',
    String(stateId),
  );

  return getAllLocationPages(endpoint);
}

async function getAllLocationPages(endpoint: string): Promise<LocationListResult> {
  const fetchPage = (page: number) => apiRequest<BackendLocationListResponse>({
    endpoint: `${endpoint}${buildQueryString({page, limit: LOCATION_PAGE_SIZE})}`,
    method: 'GET',
    auth: 'none',
  });
  const first = await fetchPage(1);
  const firstItems = (first.items ?? []).map(normalizeMasterRecord);
  const pagination = normalizeMasterPagination(first.pagination, firstItems.length);
  const remainingPages = await Promise.all(
    Array.from({length: Math.max(0, pagination.totalPages - 1)}, (_, index) => fetchPage(index + 2)),
  );

  return {
    items: [
      ...firstItems,
      ...remainingPages.flatMap(response => (response.items ?? []).map(normalizeMasterRecord)),
    ],
    pagination,
  };
}

export async function getAreasByCity(cityId: number): Promise<LocationListResult> {
  const endpoint = ApiRouteService.locations.areasByCity.replace(
    ':cityId',
    String(cityId),
  );

  return getAllLocationPages(endpoint);
}

export async function searchLocations(
  params?: LocationSearchParams,
): Promise<LocationSearchResult> {
  const endpoint = `${ApiRouteService.locations.search}${buildQueryString(params)}`;

  const response = await apiRequest<BackendLocationSearchResponse>({
    endpoint,
    method: 'GET',
    auth: 'none',
  });

  const items = (response.items ?? []).map(normalizeLocationSearchRecord);

  return {
    items,
    pagination: normalizeMasterPagination(response.pagination, items.length),
  };
}

/** Resolve typed city names without substituting a hardcoded location. */
export async function resolveCityId(name: string): Promise<number> {
  const result = await searchLocations({search: name.trim(), type: 'city', limit: 100});
  const matches = result.items.filter(item => item.name.toLowerCase() === name.trim().toLowerCase());
  if (matches.length !== 1) { throw new Error(matches.length ? 'This city name is ambiguous. Select a unique city name.' : 'Enter a city available in the location directory.'); }
  return matches[0].id;
}
