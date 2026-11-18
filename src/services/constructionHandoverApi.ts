import {apiRequest} from '@/api';

export type HandoverStatus = 'COMPLETION_REQUESTED' | 'ISSUES_REPORTED' | 'READY_FOR_REVIEW' | 'ACCEPTED';
export interface HandoverIssue {id: string; title: string; description: string; status: 'OPEN' | 'RESOLVED'; reportedAt: string; resolvedAt: string | null; resolutionNote: string | null}
export interface ConstructionHandoverView {
  projectId: string; projectNo: string; projectStatus: string; customer: {name: string | null}; builder: {name: string | null};
  originalContractAmount: string; acceptedChangeOrdersTotal: string; revisedContractAmount: string; verifiedPaid: string; pendingVerification: string; outstanding: string;
  overallProgress: number; milestoneSummary: {total: number; completed: number; planStatus: string | null}; verifiedProjectEligible: boolean;
  handover: null | {id: string; status: HandoverStatus; builderCompletionNote: string; builderRequestedAt: string; customerDecisionNote: string | null; customerAcceptedAt: string | null; completedAt: string | null; openIssueCount: number; issues: HandoverIssue[]; history: {type: string; status: string | null; note: string | null; createdAt: string}[]};
}
export const getCustomerHandover = (id: string) => apiRequest<ConstructionHandoverView>({endpoint: `/construction/projects/${encodeURIComponent(id)}/handover`});
export const getBuilderHandover = (id: string) => apiRequest<ConstructionHandoverView>({endpoint: `/me/construction/projects/${encodeURIComponent(id)}/handover`});
export const requestConstructionCompletion = (id: string, completionNote: string) => apiRequest<ConstructionHandoverView, {completionNote: string}>({endpoint: `/me/construction/projects/${encodeURIComponent(id)}/handover/request`, method: 'POST', body: {completionNote}});
export const reportConstructionHandoverIssue = (id: string, title: string, description: string) => apiRequest<ConstructionHandoverView, {title: string; description: string}>({endpoint: `/construction/projects/${encodeURIComponent(id)}/handover/issues`, method: 'POST', body: {title, description}});
export const resolveConstructionHandoverIssue = (id: string, issueId: string, resolutionNote: string) => apiRequest<ConstructionHandoverView, {resolutionNote: string}>({endpoint: `/me/construction/projects/${encodeURIComponent(id)}/handover/issues/${encodeURIComponent(issueId)}/resolve`, method: 'POST', body: {resolutionNote}});
export const acceptConstructionHandover = (id: string) => apiRequest<ConstructionHandoverView, {confirmed: true}>({endpoint: `/construction/projects/${encodeURIComponent(id)}/handover/accept`, method: 'POST', body: {confirmed: true}});
