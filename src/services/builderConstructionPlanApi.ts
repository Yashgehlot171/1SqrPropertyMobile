import {apiRequest} from '@/api';

export type BuilderPlanStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'CHANGES_REQUESTED' | 'REJECTED' | 'INACTIVE';
export interface BuilderPlanContent {
  name: string;
  description: string;
  pricingBasis: 'PER_SQ_FT' | 'CUSTOM_ON_ASSESSMENT';
  indicativeRatePerSqFt?: number | null;
  specifications: {category: string; data: Record<string, string>}[];
  upgrades: {name: string; description?: string; pricingType: 'FIXED' | 'PER_SQ_FT' | 'ON_ASSESSMENT'; price?: number | null}[];
  inclusions: string[];
  exclusions: string[];
  warranty: {duration?: number | null; unit?: 'MONTHS' | 'YEARS' | null; description?: string};
  timeline: {duration?: number | null; unit?: 'DAYS' | 'MONTHS' | null; notes?: string};
  paymentSchedule?: {type: 'PERCENTAGE' | 'CUSTOM'; milestones: {name: string; percentage?: number; description?: string; sequence: number}[]} | null;
  terms?: string;
  additionalNotes?: string;
}
export interface BuilderPlanVersion {id: string; version: number; status: BuilderPlanStatus; content: BuilderPlanContent; submittedAt?: string | null; reviewedAt?: string | null; reviewComment?: string | null}
export interface BuilderConstructionPlan {id: string; name: string; status: BuilderPlanStatus; currentVersion: number; updatedAt: string; versions: BuilderPlanVersion[]}
type BackendPlan = Omit<BuilderConstructionPlan, 'id' | 'versions'> & {id: string | number; versions: Array<Omit<BuilderPlanVersion, 'id'> & {id: string | number}>};
const normalize = (plan: BackendPlan): BuilderConstructionPlan => ({...plan, id: String(plan.id), versions: plan.versions.map(version => ({...version, id: String(version.id)}))});

export async function listBuilderConstructionPlans(): Promise<BuilderConstructionPlan[]> {
  const result = await apiRequest<BackendPlan[]>({endpoint: '/me/construction/plans'});
  return result.map(normalize);
}
export async function getBuilderConstructionPlan(id: string): Promise<BuilderConstructionPlan> {
  return normalize(await apiRequest<BackendPlan>({endpoint: `/me/construction/plans/${encodeURIComponent(id)}`}));
}
export async function createBuilderConstructionPlan(content: BuilderPlanContent): Promise<BuilderConstructionPlan> {
  return normalize(await apiRequest<BackendPlan>({endpoint: '/me/construction/plans', method: 'POST', body: {content}}));
}
export async function updateBuilderConstructionPlan(id: string, content: BuilderPlanContent): Promise<BuilderConstructionPlan> {
  return normalize(await apiRequest<BackendPlan>({endpoint: `/me/construction/plans/${encodeURIComponent(id)}`, method: 'PATCH', body: {content}}));
}
export async function submitBuilderConstructionPlan(id: string): Promise<BuilderConstructionPlan> {
  return normalize(await apiRequest<BackendPlan>({endpoint: `/me/construction/plans/${encodeURIComponent(id)}/submit`, method: 'POST'}));
}
