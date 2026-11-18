import {apiRequest} from '@/api';
import type {LoanBank, LoanRequest, LoanStatus} from '@/types';
import {getAllPages} from './remoteData';
import {documents, remarks, documentIds, titleStatus, requestHistory} from './requestMapping';
import type {RawRequest} from './requestMapping';
const base = '/loans/requests';
const preferencePrefix = 'Application preferences (v1): ';
function preferences(payload: Partial<LoanRequest>) {
  if (payload.propertyDetails === undefined && payload.tenureYears === undefined) { return undefined; }
  return preferencePrefix + JSON.stringify({propertyDetails: payload.propertyDetails, downPayment: payload.downPayment,
    tenureYears: payload.tenureYears, interestRate: payload.interestRate});
}
function readPreferences(raw: RawRequest): Partial<LoanRequest> {
  const note = (raw.remarks ?? []).find(item => item.visibility === 'public' && item.remark.startsWith(preferencePrefix));
  if (!note) { return {}; }
  try {
    const value: unknown = JSON.parse(note.remark.slice(preferencePrefix.length));
    if (!value || typeof value !== 'object') { return {}; }
    const item = value as Record<string, unknown>;
    return {propertyDetails: typeof item.propertyDetails === 'string' ? item.propertyDetails : '',
      downPayment: typeof item.downPayment === 'number' ? item.downPayment : 0,
      tenureYears: typeof item.tenureYears === 'number' ? item.tenureYears : 0,
      interestRate: typeof item.interestRate === 'number' ? item.interestRate : 0};
  } catch { return {}; }
}
export function normalizeLoan(raw: RawRequest): LoanRequest {
  return {id: String(raw.id), preferredBankId: raw.bankId == null ? undefined : String(raw.bankId),
    applicantName: raw.applicantName ?? '', mobile: raw.mobile ?? '', email: raw.email ?? '',
    monthlyIncome: Number(raw.monthlyIncome ?? 0), employmentType: raw.employmentType ?? '',
    loanAmount: Number(raw.amount ?? 0) + (readPreferences(raw).downPayment ?? 0), downPayment: 0, tenureYears: 0, interestRate: Number(raw.bank?.interestRate ?? 0),
    propertyDetails: '', status: titleStatus(raw.loanStatus?.slug ?? raw.loanStatus?.name ?? 'new') as LoanStatus,
    documents: documents(raw), remarks: remarks(raw), history: [], createdAt: raw.createdAt ?? '', ...readPreferences(raw)};
}
async function presentLoan(raw: RawRequest): Promise<LoanRequest> {
  const item = normalizeLoan(raw);
  item.history = (await requestHistory(raw, 'loan-statuses')) as LoanRequest['history'];
  return item;
}
function body(payload: Partial<LoanRequest>) {
  return {bankId: payload.preferredBankId || undefined, applicantName: payload.applicantName,
    mobile: payload.mobile, email: payload.email || undefined, monthlyIncome: payload.monthlyIncome || undefined,
    employmentType: payload.employmentType, loanAmount: payload.loanAmount === undefined ? undefined : payload.loanAmount - (payload.downPayment ?? 0), documentFileIds: documentIds(payload.documents)};
}
export async function getLoanBanks(): Promise<LoanBank[]> {
  const rows = await apiRequest<{id: string; name: string; interestRate?: string; processingFee?: string}[]>({endpoint: '/loans/banks'});
  return rows.map(row => {
    const parsedRate = Number(row.interestRate);
    return {id: String(row.id), name: row.name,
      interestRate: Number.isFinite(parsedRate) && parsedRate > 0 ? parsedRate : undefined,
      processingFee: row.processingFee || undefined,
      highlights: []};
  });
}
export async function getLoanRequests() { return Promise.all((await getAllPages<RawRequest>(base)).map(presentLoan)); }
export async function getLoanRequest(id: string) { return presentLoan(await apiRequest<RawRequest>({endpoint: base + '/' + id})); }
export async function addLoanRequest(payload: Omit<LoanRequest, 'id' | 'createdAt'>) {
  return normalizeLoan(await apiRequest<RawRequest>({endpoint: base, method: 'POST', body: {...body(payload), remark: preferences(payload)}}));
}
export async function updateLoanRequest(id: string, payload: Partial<LoanRequest>) {
  await apiRequest({endpoint: base + '/' + id, method: 'PATCH', body: body(payload)});
  const note = preferences(payload);
  if (note) { await apiRequest({endpoint: base + '/' + id + '/remarks', method: 'POST', body: {remark: note, visibility: 'public'}}); }
  return getLoanRequest(id);
}
export async function deleteLoanRequest(id: string) { await apiRequest({endpoint: base + '/' + id, method: 'DELETE'}); return true; }
export async function addLoanRemark(id: string, remark: string) {
  await apiRequest({endpoint: base + '/' + id + '/remarks', method: 'POST', body: {remark, visibility: 'public'}});
  return getLoanRequest(id);
}
