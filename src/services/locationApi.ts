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
  const response = await apiRequest<BackendLocationListResponse>({
    endpoint: ApiRouteService.locations.states,
    method: 'GET',
    auth: 'none',
  });

  const items = (response.items ?? []).map(normalizeMasterRecord);

  return {
    items,
    pagination: normalizeMasterPagination(response.pagination, items.length),
  };
}

export async function getCitiesByState(
  stateId: number,
): Promise<LocationListResult> {
  const endpoint = ApiRouteService.locations.citiesByState.replace(
    ':stateId',
    String(stateId),
  );

  const response = await apiRequest<BackendLocationListResponse>({
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

export async function getAreasByCity(cityId: number): Promise<LocationListResult> {
  const endpoint = ApiRouteService.locations.areasByCity.replace(
    ':cityId',
    String(cityId),
  );

  const response = await apiRequest<BackendLocationListResponse>({
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
