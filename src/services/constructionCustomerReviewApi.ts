import {apiRequest} from '@/api';

export interface ConstructionCustomerReview {
  id: string; projectId: string; rating: number; workQualityRating: number | null; communicationRating: number | null; timelinessRating: number | null; valueForMoneyRating: number | null;
  reviewText: string | null; createdAt: string; updatedAt: string; verified: true; customerDisplayName?: string;
}
export interface ConstructionReviewInput {rating: number; reviewText?: string; workQualityRating?: number; communicationRating?: number; timelinessRating?: number; valueForMoneyRating?: number}
export const getCustomerConstructionReview = (projectId: string) => apiRequest<{projectId: string; eligible: boolean; review: ConstructionCustomerReview | null}>({endpoint: `/construction/projects/${encodeURIComponent(projectId)}/review`});
export const submitCustomerConstructionReview = (projectId: string, data: ConstructionReviewInput) => apiRequest<{projectId: string; eligible: boolean; review: ConstructionCustomerReview | null}, ConstructionReviewInput>({endpoint: `/construction/projects/${encodeURIComponent(projectId)}/review`, method: 'POST', body: data});
export const editCustomerConstructionReview = (projectId: string, data: ConstructionReviewInput) => apiRequest<{projectId: string; eligible: boolean; review: ConstructionCustomerReview | null}, ConstructionReviewInput>({endpoint: `/construction/projects/${encodeURIComponent(projectId)}/review`, method: 'PATCH', body: data});
export const getBuilderConstructionReview = (projectId: string) => apiRequest<{projectId: string; review: ConstructionCustomerReview | null}>({endpoint: `/me/construction/projects/${encodeURIComponent(projectId)}/review`});
export const getBuilderConstructionReviewSummary = () => apiRequest<{averageRating: number | null; verifiedReviewCount: number; reviews: Omit<ConstructionCustomerReview, 'projectId'>[]} >({endpoint: '/me/construction/reviews'});
