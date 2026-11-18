import {apiRequest} from '@/api';

export interface BuilderConstructionCommission {
  id: string; projectId: string; projectNo: string; rateSnapshot: string;
  agreementAmount: string; baseCommission: string; accruedCommission: string;
  settledCommission: string; outstandingCommission: string; builderCredit: string;
  status: string; triggeredAt: string;
  adjustments: {id: string; changeOrderNo: number; baseAmountDelta: string; commissionDelta: string; createdAt: string}[];
  payments: {id: string; amount: string; reference?: string | null; note?: string | null; paidAt: string}[];
}

export const getBuilderConstructionCommission = (projectId: string) =>
  apiRequest<BuilderConstructionCommission | null>({endpoint: `/me/construction/projects/${encodeURIComponent(projectId)}/commission`});
