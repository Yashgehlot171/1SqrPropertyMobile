import {apiRequest} from '@/api';
import type {LegalRequest, LegalTeam, LegalStatus} from '@/types';
import {getAllPages} from './remoteData';
import {documents, remarks, documentIds, titleStatus, requestHistory} from './requestMapping';
import type {RawRequest} from './requestMapping';
const base = '/legal/requests';
type Place = {id: number; name: string; parentId?: number};
async function locationIds(location: LegalRequest['location']) {
  const states = await getAllPages<Place>('/locations/states', 'none');
  const state = states.find(item => item.name.toLowerCase() === location.state.toLowerCase());
  if (!state) { throw new Error('Enter a configured state name.'); }
  const cities = await getAllPages<Place>('/locations/states/' + state.id + '/cities', 'none');
  const city = cities.find(item => item.name.toLowerCase() === location.city.toLowerCase());
  if (!city) { throw new Error('Enter a configured city in the selected state.'); }
  const areas = await getAllPages<Place>('/locations/cities/' + city.id + '/areas', 'none');
  const area = areas.find(item => item.name.toLowerCase() === location.area?.toLowerCase());
  if (location.area && !area) { throw new Error('Enter a configured area in the selected city.'); }
  return {stateId: state.id, cityId: city.id, areaId: area?.id};
}
async function normalizeLegal(raw: RawRequest): Promise<LegalRequest> {
  const [states, cities, areas] = await Promise.all([
    raw.stateId ? getAllPages<Place>('/locations/states', 'none') : [],
    raw.stateId ? getAllPages<Place>('/locations/states/' + raw.stateId + '/cities', 'none') : [],
    raw.cityId ? getAllPages<Place>('/locations/cities/' + raw.cityId + '/areas', 'none') : [],
  ]);
  return {id: String(raw.id), type: raw.type as LegalRequest['type'], assignedTeamId: raw.assignedTeamId == null ? undefined : String(raw.assignedTeamId),
    applicantName: raw.applicantName ?? '', ownerName: raw.ownerName ?? '', buyerName: raw.buyerName ?? '',
    propertyDetails: raw.description ?? '', location: {state: states.find(item => item.id === raw.stateId)?.name ?? '',
      city: cities.find(item => item.id === raw.cityId)?.name ?? '', area: areas.find(item => item.id === raw.areaId)?.name ?? ''},
    preferredRegistrationDate: raw.preferredRegistrationDate?.slice(0, 10),
    status: titleStatus(raw.legalStatus?.slug ?? raw.legalStatus?.name ?? 'submitted') as LegalStatus,
    documents: documents(raw), remarks: remarks(raw), history: (await requestHistory(raw, 'legal-statuses')) as LegalRequest['history'], createdAt: raw.createdAt ?? ''};
}
async function body(payload: Partial<LegalRequest>) {
  return {type: payload.type, assignedTeamId: payload.assignedTeamId ? Number(payload.assignedTeamId) : undefined,
    applicantName: payload.applicantName, ownerName: payload.ownerName, buyerName: payload.buyerName,
    propertyDetails: payload.propertyDetails, preferredRegistrationDate: payload.preferredRegistrationDate || undefined,
    ...(payload.location ? await locationIds(payload.location) : {}), documentFileIds: documentIds(payload.documents)};
}
export async function getLegalTeams(): Promise<LegalTeam[]> {
  const rows = await apiRequest<{id: number; name: string}[]>({endpoint: '/legal/teams'});
  return rows.map(row => ({id: String(row.id), name: row.name, specialization: '', city: '', phone: '', whatsapp: '', email: '', experience: '', highlights: []}));
}
export async function getLegalRequests() { return Promise.all((await getAllPages<RawRequest>(base)).map(normalizeLegal)); }
export async function getLegalRequest(id: string) { return normalizeLegal(await apiRequest<RawRequest>({endpoint: base + '/' + id})); }
export async function addLegalRequest(payload: Omit<LegalRequest, 'id' | 'createdAt'>) {
  return normalizeLegal(await apiRequest<RawRequest>({endpoint: base, method: 'POST', body: await body(payload)}));
}
export async function updateLegalRequest(id: string, payload: Partial<LegalRequest>) {
  await apiRequest({endpoint: base + '/' + id, method: 'PATCH', body: await body(payload)}); return getLegalRequest(id);
}
export async function deleteLegalRequest(id: string) { await apiRequest({endpoint: base + '/' + id, method: 'DELETE'}); return true; }
export async function addLegalRemark(id: string, remark: string) {
  await apiRequest({endpoint: base + '/' + id + '/remarks', method: 'POST', body: {remark, visibility: 'public'}}); return getLegalRequest(id);
}
