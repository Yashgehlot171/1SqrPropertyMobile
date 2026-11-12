import {apiRequest} from '@/api';
import type {SupportTicket, SupportTicketStatus} from '@/types';
import {getAllPages} from './remoteData';
import {documents, remarks, documentIds, titleStatus} from './requestMapping';
import type {RawRequest} from './requestMapping';
const base = '/support-tickets';
export async function getSupportCategories() { return getAllPages<{id: number; name: string}>('/masters/support-categories', 'none'); }
export function normalizeSupport(raw: RawRequest): SupportTicket {
  return {id: String(raw.id), issueType: raw.category?.name ?? '', relatedProperty: raw.relatedPropertyId ? String(raw.relatedPropertyId) : undefined,
    subject: raw.subject ?? '', description: raw.description ?? '', status: titleStatus(raw.status ?? 'OPEN') as SupportTicketStatus,
    documents: documents(raw), remarks: remarks(raw), history: (raw.statusHistory ?? []).map(item => ({
      id: String(item.id), status: titleStatus(item.newStatus ?? '') as SupportTicketStatus,
      updatedBy: String(item.changedById ?? ''), updatedAt: item.createdAt ?? '', note: item.remarks,
    })), createdAt: raw.createdAt ?? ''};
}
async function body(payload: Partial<SupportTicket>) {
  const category = payload.issueType === undefined ? undefined : (await getSupportCategories()).find(item => item.name.toLowerCase() === payload.issueType?.toLowerCase());
  if (payload.issueType && !category) { throw new Error('Select an available issue type.'); }
  if (payload.relatedProperty && !/^[1-9][0-9]*$/.test(payload.relatedProperty)) { throw new Error('Enter a valid property ID.'); }
  return {issueTypeId: category?.id, relatedPropertyId: payload.relatedProperty || undefined,
    subject: payload.subject, description: payload.description, documentFileIds: documentIds(payload.documents)};
}
export async function getSupportTickets() { return (await getAllPages<RawRequest>(base)).map(normalizeSupport); }
export async function getSupportTicket(id: string) { return normalizeSupport(await apiRequest<RawRequest>({endpoint: base + '/' + id})); }
export async function addSupportTicket(payload: Omit<SupportTicket, 'id' | 'createdAt'>) {
  return normalizeSupport(await apiRequest<RawRequest>({endpoint: base, method: 'POST', body: await body(payload)}));
}
export async function updateSupportTicket(id: string, payload: Partial<SupportTicket>) {
  await apiRequest({endpoint: base + '/' + id, method: 'PATCH', body: await body(payload)}); return getSupportTicket(id);
}
export async function deleteSupportTicket(id: string) { await apiRequest({endpoint: base + '/' + id, method: 'DELETE'}); return true; }
export async function addSupportRemark(id: string, remark: string) {
  await apiRequest({endpoint: base + '/' + id + '/remarks', method: 'POST', body: {remark, visibility: 'public'}}); return getSupportTicket(id);
}
export async function updateSupportStatus(id: string, status: SupportTicketStatus, remark?: string) {
  await apiRequest({endpoint: base + '/' + id + '/status', method: 'PATCH', body: {status: status.toUpperCase().replace(/ /g, '_'), remark}});
  return getSupportTicket(id);
}
