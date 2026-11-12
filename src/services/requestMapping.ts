import {getAllPages} from './remoteData';
import type {Remark, UploadedDocument} from '@/types';

export interface RawRequest {
  id: string | number; createdAt?: string; applicantName?: string; mobile?: string;
  email?: string; monthlyIncome?: string | number; employmentType?: string;
  amount?: string | number; bankId?: string | number; bank?: {interestRate?: string | number};
  loanStatus?: {name?: string; slug?: string}; legalStatus?: {name?: string; slug?: string};
  type?: string; assignedTeamId?: number; ownerName?: string; buyerName?: string;
  description?: string; preferredRegistrationDate?: string; stateId?: number; cityId?: number; areaId?: number;
  category?: {name?: string}; relatedPropertyId?: string; subject?: string; status?: string;
  files?: {file: {id: string | number; originalName?: string; mimeType?: string; url?: string; createdAt?: string}}[];
  remarks?: {id: string | number; remark: string; visibility?: string; userId?: string; createdAt?: string}[];
  statusHistory?: {id: string | number; newStatus?: string; newStatusId?: number; createdAt?: string; changedById?: string; remarks?: string}[];
}
export function documents(raw: RawRequest): UploadedDocument[] {
  return (raw.files ?? []).map(({file}) => ({id: String(file.id), name: file.originalName ?? 'Attachment',
    type: file.mimeType === 'application/pdf' ? 'PDF' : file.mimeType === 'image/png' ? 'PNG' : 'JPG',
    uri: file.url ?? '', uploadedAt: file.createdAt ?? '', status: 'uploaded'}));
}
export function remarks(raw: RawRequest): Remark[] {
  return (raw.remarks ?? []).filter(item => item.visibility === 'public').map(item => ({
    id: String(item.id), text: item.remark, addedBy: String(item.userId ?? ''), date: item.createdAt ?? '',
  }));
}
export function documentIds(items?: UploadedDocument[]) {
  if (!items) { return undefined; }
  if (items.some(item => !/^[1-9][0-9]*$/.test(item.id) || item.status !== 'uploaded')) {
    throw new Error('Upload each attachment before submitting.');
  }
  return items.map(item => item.id);
}
export function titleStatus(value: string) {
  return value.toLowerCase().split(/[-_ ]/).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

const statuses = new Map<string, Promise<{id: number; name: string}[]>>();
export async function requestHistory(raw: RawRequest, type: 'loan-statuses' | 'legal-statuses') {
  if (!raw.statusHistory?.length) { return []; }
  let pending = statuses.get(type);
  if (!pending) {
    pending = getAllPages<{id: number; name: string}>('/masters/' + type, 'none').catch(error => {statuses.delete(type); throw error;});
    statuses.set(type, pending);
  }
  const items = await pending;
  return raw.statusHistory.map(item => ({id: String(item.id), status: items.find(status => status.id === item.newStatusId)?.name ?? 'Status updated',
    updatedBy: String(item.changedById ?? ''), updatedAt: item.createdAt ?? '', note: item.remarks}));
}
