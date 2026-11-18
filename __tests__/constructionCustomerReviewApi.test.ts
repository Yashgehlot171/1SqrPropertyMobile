import {apiRequest} from '../src/api';
import {editCustomerConstructionReview, getBuilderConstructionReview, getBuilderConstructionReviewSummary, getCustomerConstructionReview, submitCustomerConstructionReview} from '../src/services/constructionCustomerReviewApi';

jest.mock('../src/api', () => ({apiRequest: jest.fn()}));
const request = jest.mocked(apiRequest);
beforeEach(() => request.mockReset().mockResolvedValue({} as never));

test('Customer eligibility read and submit use the Customer project review route', async () => {await getCustomerConstructionReview('pr/8'); await submitCustomerConstructionReview('pr/8', {rating: 5, reviewText: 'Excellent work'}); expect(request).toHaveBeenNthCalledWith(1, {endpoint: '/construction/projects/pr%2F8/review'}); expect(request).toHaveBeenNthCalledWith(2, {endpoint: '/construction/projects/pr%2F8/review', method: 'POST', body: {rating: 5, reviewText: 'Excellent work'}});});
test('Customer edit uses update route and Builder view remains read-only', async () => {await editCustomerConstructionReview('8', {rating: 4}); await getBuilderConstructionReview('8'); expect(request).toHaveBeenNthCalledWith(1, {endpoint: '/construction/projects/8/review', method: 'PATCH', body: {rating: 4}}); expect(request).toHaveBeenNthCalledWith(2, {endpoint: '/me/construction/projects/8/review'});});
test('Builder dashboard summary is authenticated and contains safe aggregate review data', async () => {await getBuilderConstructionReviewSummary(); expect(request).toHaveBeenCalledWith({endpoint: '/me/construction/reviews'});});
