import {apiRequest} from '@/api';

export interface BuilderServiceAreaState {
  cityId: number;
  cityName: string;
  legacyAreaId: number | null;
  serviceAreas: Array<{id: number; name: string; cityId: number}>;
}

export function getMyBuilderServiceAreas(): Promise<BuilderServiceAreaState> {
  return apiRequest({endpoint: '/me/construction/service-areas', method: 'GET'});
}

export function updateMyBuilderServiceAreas(areaIds: number[]): Promise<BuilderServiceAreaState> {
  return apiRequest({endpoint: '/me/construction/service-areas', method: 'PUT', body: {areaIds}});
}
