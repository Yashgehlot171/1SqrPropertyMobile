import {apiRequest} from '@/api';
import type {ConstructionPackage, ConstructionQuality, ConstructionQuote, ConstructionRequest, DirectoryEntry} from '@/types';
import {getAllPages} from './remoteData';
import {remarks, titleStatus} from './requestMapping';
import type {RawRequest} from './requestMapping';
interface RawPackage {id: string; name: string; quality: string; pricePerSqft: string; timelineDays?: number; features?: unknown; includedMaterials?: unknown; includedServices?: unknown}
interface RawConstruction extends RawRequest {user?: {fullName?: string; mobile?: string}; address?: string; status?: string}
const strings = (value: unknown): string[] => Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
export async function getConstructionPackages(): Promise<ConstructionPackage[]> {
  const rows = await getAllPages<RawPackage>('/construction/packages', 'none');
  return rows.map(row => ({id: String(row.id), name: row.name, quality: titleStatus(row.quality) as ConstructionQuality,
    costPerSqFt: Number(row.pricePerSqft), materialQuality: strings(row.includedMaterials).join(', '),
    labourIncluded: strings(row.includedServices).some(item => /labou?r/i.test(item)),
    timeline: row.timelineDays ? row.timelineDays + ' days' : 'Not specified', features: strings(row.features)}));
}
async function directory(endpoint: string): Promise<DirectoryEntry[]> {
  const rows = await getAllPages<{id: string; name: string; address?: string; mobile?: string; whatsapp?: string; averageRating?: string; materialCategory?: string; serviceType?: string}>(endpoint, 'none');
  return rows.map(row => {
    const parsedRating = Number(row.averageRating);
    return {id: String(row.id), name: row.name, location: row.address ?? '',
    rating: Number.isFinite(parsedRating) && parsedRating > 0 ? parsedRating : undefined,
    phone: row.mobile || undefined, whatsapp: row.whatsapp || undefined,
    tags: [row.materialCategory ?? row.serviceType ?? ''].filter(Boolean)};
  });
}
export const getSuppliers = () => directory('/material-suppliers');
export const getContractors = () => directory('/contractors');
function normalizeRequest(row: RawConstruction): ConstructionRequest {
  return {id: String(row.id), customerName: row.user?.fullName ?? '', mobile: row.user?.mobile ?? '',
    location: {state: '', city: '', area: row.address ?? ''}, documents: [], remarks: remarks(row),
    history: [{id: String(row.id), status: titleStatus(row.status ?? 'pending'), updatedBy: '', updatedAt: row.createdAt ?? ''}]};
}
export async function getConstructionRequests() { return (await getAllPages<RawConstruction>('/me/construction/requests')).map(normalizeRequest); }
export async function addConstructionRequest(payload: Omit<ConstructionRequest, 'id' | 'history' | 'remarks'>, quote: ConstructionQuote, packageId?: string) {
  const row = await apiRequest<RawConstruction>({endpoint: '/construction/requests', method: 'POST', body: {
    packageId, title: quote.quality + ' construction enquiry',
    description: 'Customer estimate: ' + quote.totalCost + '. Contact: ' + payload.customerName + ', ' + payload.mobile,
    plotAreaSqft: quote.plotSizeSqFt, builtUpAreaSqft: quote.builtUpAreaSqFt * quote.floors, floors: quote.floors,
    address: [payload.location.area, payload.location.city, payload.location.state].filter(Boolean).join(', '),
    budgetMax: quote.totalCost, priority: 'medium',
  }});
  return {...normalizeRequest(row), quoteId: quote.id};
}
export async function calculateConstructionEstimate(input: {plotSizeSqFt: number; builtUpAreaSqFt: number; floors: number; quality: ConstructionQuality}) {
  if (!['Standard', 'Premium', 'Luxury'].includes(input.quality)) {
    throw new Error('Online estimates currently support Standard, Premium and Luxury. Choose one to continue.');
  }
  const result = await apiRequest<{materialCost: number; labourCost: number; totalCost: number; estimatedTimelineDays: number}>({
    endpoint: '/construction/calculate', method: 'POST', auth: 'none', body: {
      plotSizeSqft: input.plotSizeSqFt, builtUpAreaSqft: input.builtUpAreaSqFt * input.floors, floors: input.floors,
      quality: input.quality.toLowerCase(), parking: false, basement: false, terrace: false, boundaryWall: false,
    },
  });
  return {...input, materialCost: result.materialCost, labourCost: result.labourCost, totalCost: result.totalCost,
    estimatedTimelineMonths: Math.ceil(result.estimatedTimelineDays / 30)};
}

export const getServiceProviders = (serviceType: string) => directory('/service-providers?serviceType=' + encodeURIComponent(serviceType));
