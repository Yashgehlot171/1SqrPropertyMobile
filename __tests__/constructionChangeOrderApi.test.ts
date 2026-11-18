import {apiRequest} from '../src/api';
import {cancelConstructionChangeOrder, createBuilderChangeProposal, createCustomerChangeRequest, decideCustomerChangeOrder, getBuilderChangeOrders, getCustomerChangeOrders, proposeCustomerChangeOrder} from '../src/services/constructionChangeOrderApi';

jest.mock('../src/api',()=>({apiRequest:jest.fn()}));
const request=jest.mocked(apiRequest);
beforeEach(()=>{request.mockReset();request.mockResolvedValue({} as never);});

test('Customer list reads project scoped Change Orders',async()=>{await getCustomerChangeOrders('project/1');expect(request).toHaveBeenCalledWith({endpoint:'/construction/projects/project%2F1/change-orders'});});
test('Builder list uses selected Builder API namespace',async()=>{await getBuilderChangeOrders('1');expect(request).toHaveBeenCalledWith({endpoint:'/me/construction/projects/1/change-orders'});});
test('Customer request submits only scope and reason fields',async()=>{const input={title:'Upgrade floor',description:'Premium tiles in all rooms',reason:'Requested finish'};await createCustomerChangeRequest('1',input);expect(request).toHaveBeenCalledWith({endpoint:'/construction/projects/1/change-orders',method:'POST',body:input});});
test('Builder initiated proposal carries commercial terms',async()=>{const input={title:'Foundation depth',description:'Add reinforcement',reason:'Site conditions',amountDelta:'-1250.25',daysDelta:0};await createBuilderChangeProposal('1',input);expect(request).toHaveBeenCalledWith({endpoint:'/me/construction/projects/1/change-orders',method:'POST',body:input});});
test('Builder proposal is scoped to requested change order',async()=>{const input={amountDelta:'0.00',daysDelta:5};await proposeCustomerChangeOrder('1','9',input);expect(request).toHaveBeenCalledWith({endpoint:'/me/construction/projects/1/change-orders/9/proposal',method:'POST',body:input});});
test('Customer decisions require explicit confirmation in payload',async()=>{await decideCustomerChangeOrder('1','9','ACCEPT');expect(request).toHaveBeenCalledWith({endpoint:'/construction/projects/1/change-orders/9/decision',method:'POST',body:{decision:'ACCEPT',confirmed:true}});});
test('Customer and Builder cancellation use their separate authenticated routes',async()=>{await cancelConstructionChangeOrder('1','9','customer');await cancelConstructionChangeOrder('1','10','builder');expect(request).toHaveBeenNthCalledWith(1,{endpoint:'/construction/projects/1/change-orders/9/cancel',method:'POST',body:{confirmed:true}});expect(request).toHaveBeenNthCalledWith(2,{endpoint:'/me/construction/projects/1/change-orders/10/cancel',method:'POST',body:{confirmed:true}});});
