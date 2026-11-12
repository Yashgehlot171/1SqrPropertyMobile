// Offline contract and state regression tests. Never contacts the configured server.
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const assert = require('node:assert/strict');
const {test, beforeEach} = require('node:test');
const ts = require('typescript');
const {create} = require('zustand');
const root = path.resolve(__dirname, '..');
let requestHandler;
let pickerHandler;
let uploadHandler;
const errors = [];
const requests = [];
const auth = create(() => ({user: {id: 'user-1'}, isLoggedIn: true}));
const originalLoad = Module._load;
Module._load = function (id, parent, main) {
  if (id === 'react-native') return {Platform: {select: values => values.default ?? values.android, OS: 'android'}, StyleSheet: {create: value => value}, ActivityIndicator: 'ActivityIndicator', Button: 'Button', Text: 'Text', View: 'View', Pressable: 'Pressable'};
  if (id === '@/components') return new Proxy({}, {get: (_, key) => key === '__esModule' ? true : key});
  if (id === '@/utils/toast') return {showToast: () => {}};
  if (id === '@react-navigation/native') return {useFocusEffect: callback => require('react').useEffect(callback, [callback])};
  if (id === '@/api') return {
    showApiError: error => errors.push(error.message),
    apiRequest: async options => { requests.push(options); return requestHandler(options); },
    uploadFile: (...args) => uploadHandler(...args),
  };
  if (id === 'react-native-image-picker') return {launchImageLibrary: (...args) => pickerHandler(...args)};
  if (id === '@/store/authStore' || (id === './authStore' && parent?.filename.includes('store'))) return {useAuthStore: auth};
  if (id.startsWith('@/')) id = path.join(root, 'src', id.slice(2));
  return originalLoad.call(this, id, parent, main);
};
require.extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
  compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true, jsx: ts.JsxEmit.React},
}).outputText, filename);
require.extensions['.tsx'] = require.extensions['.ts'];
global.IS_REACT_ACT_ENVIRONMENT = true;
const {getAllPages} = require('../src/services/remoteData.ts');
const loan = require('../src/services/loanApi.ts');
const support = require('../src/services/supportApi.ts');
const legal = require('../src/services/legalApi.ts');
const construction = require('../src/services/constructionApi.ts');
const mapping = require('../src/services/requestMapping.ts');
const attachments = require('../src/services/requestAttachment.ts');
const {useSupportStore} = require('../src/store/supportStore.ts');
const {useLoanStore} = require('../src/store/loanStore.ts');
const page = items => ({items, pagination: {totalPages: 1}});
const raw = {id: '9007199254740993', applicantName: 'Customer', amount: '2500000.50', loanStatus: {slug: 'in-review'}, remarks: [], files: []};
beforeEach(() => {
  requests.length = 0;
  requestHandler = () => { throw Error('Unexpected request'); };
  auth.setState({user: {id: 'user-1'}, isLoggedIn: true});
  useSupportStore.setState({tickets: [], categories: [], loading: false, error: null});
  useLoanStore.setState({requests: [], banks: [], loading: false, error: null});
});
test('pagination returns every page with existing query filters preserved', async () => {
  requestHandler = ({endpoint}) => ({items: [endpoint.includes('page=1') ? 1 : 2], pagination: {totalPages: 2}});
  assert.deepEqual(await getAllPages('/requests?status=open'), [1, 2]);
  assert.equal(requests[1].endpoint, '/requests?status=open&limit=100&page=2');
});
test('BigInt identifiers and Decimal amounts survive normalization', () => {
  const item = loan.normalizeLoan(raw);
  assert.equal(item.id, '9007199254740993');
  assert.equal(item.loanAmount, 2500000.5);
  assert.equal(item.status, 'In Review');
});
test('internal or unspecified visibility remarks are never shown to customers', () => {
  assert.deepEqual(mapping.remarks({id: '1', remarks: [
    {id: '1', remark: 'private', visibility: 'internal'},
    {id: '2', remark: 'unspecified'},
    {id: '3', remark: 'customer message', visibility: 'public'},
  ]}).map(item => item.text), ['customer message']);
});
test('unuploaded placeholder documents are rejected before a mutation', async () => {
  await assert.rejects(loan.addLoanRequest({documents: [{id: 'local-doc', status: 'uploaded'}]}), /Upload each attachment/);
  assert.equal(requests.length, 0);
});
test('loan create maps bank/amount and preserves preferences as supported public remarks', async () => {
  requestHandler = options => ({...raw, remarks: [{id: '1', visibility: 'public', remark: options.body.remark}]});
  const result = await loan.addLoanRequest({preferredBankId: '9007199254740995', loanAmount: 2000000, applicantName: 'Customer', mobile: '9876543210', propertyDetails: 'Flat', tenureYears: 20, downPayment: 100000, interestRate: 8, documents: []});
  assert.equal(requests[0].body.bankId, '9007199254740995');
  assert.equal(requests[0].body.loanAmount, 1900000);
  assert.equal(requests[0].body.status, undefined);
  assert.equal(result.propertyDetails, 'Flat');
  assert.equal(result.tenureYears, 20);
});
test('support category names resolve to backend master IDs', async () => {
  requestHandler = options => options.endpoint.startsWith('/masters/') ? page([{id: 7, name: 'General'}]) : {id: '15', status: 'OPEN', category: {name: 'General'}};
  const ticket = await support.addSupportTicket({issueType: 'General', subject: 'Help', description: 'Issue', documents: []});
  assert.equal(requests.find(item => item.method === 'POST').body.issueTypeId, 7);
  assert.equal(ticket.status, 'Open');
});
test('invalid support categories never create a ticket', async () => {
  requestHandler = () => page([{id: 7, name: 'General'}]);
  await assert.rejects(support.addSupportTicket({issueType: 'Unknown'}), /Select an available/);
  assert.equal(requests.some(item => item.method === 'POST'), false);
});
test('support close sends the actual CLOSED status and supplied reason', async () => {
  requestHandler = () => ({id: '15', status: 'CLOSED'});
  await support.updateSupportStatus('15', 'Closed', 'Issue fixed');
  assert.deepEqual(requests[0].body, {status: 'CLOSED', remark: 'Issue fixed'});
});
test('legal locations resolve within the selected parent and send numeric IDs', async () => {
  requestHandler = options => {
    if (options.endpoint.startsWith('/locations/states/1/cities')) return page([{id: 2, name: 'City'}]);
    if (options.endpoint.startsWith('/locations/cities/2/areas')) return page([{id: 3, name: 'Area'}]);
    if (options.endpoint.startsWith('/locations/states')) return page([{id: 1, name: 'State'}]);
    return {id: '10', type: 'Property Verification', ...options.body};
  };
  await legal.addLegalRequest({type: 'Property Verification', assignedTeamId: '2', location: {state: 'State', city: 'City', area: 'Area'}, documents: []});
  const body = requests.find(item => item.method === 'POST').body;
  assert.equal(body.stateId, 1); assert.equal(body.cityId, 2); assert.equal(body.areaId, 3);
});
test('failed mutation does not remove a local ticket or create fake success state', async () => {
  useSupportStore.setState({tickets: [{id: '1', subject: 'Keep me'}]});
  requestHandler = () => { throw Error('Network unavailable'); };
  await assert.rejects(useSupportStore.getState().deleteTicket('1'), /Network unavailable/);
  assert.equal(useSupportStore.getState().tickets[0].subject, 'Keep me');
});
test('successful delete updates the store only after server acknowledgement', async () => {
  useSupportStore.setState({tickets: [{id: '1'}]});
  let resolve;
  requestHandler = () => new Promise(done => {resolve = done;});
  const pending = useSupportStore.getState().deleteTicket('1');
  assert.equal(useSupportStore.getState().tickets.length, 1);
  resolve({deleted: true}); await pending;
  assert.equal(useSupportStore.getState().tickets.length, 0);
});
test('logout discards a previous session response', async () => {
  let resolve;
  requestHandler = options => options.endpoint.startsWith('/masters/') ? page([]) : new Promise(done => {resolve = done;});
  const pending = useSupportStore.getState().load();
  auth.setState({user: undefined, isLoggedIn: false});
  resolve(page([{id: '1', subject: 'Private old session'}])); await pending;
  assert.deepEqual(useSupportStore.getState().tickets, []);
});
test('customer cannot simulate loan approval or edit/delete existing remarks', async () => {
  await assert.rejects(useLoanStore.getState().updateRequestStatus('1', 'Approved'), /not available/);
  await assert.rejects(useLoanStore.getState().deleteRemark('1', '2'), /not available/);
  assert.equal(requests.length, 0);
});
test('cancelled image selection never uploads a file', async () => {
  pickerHandler = async () => ({didCancel: true});
  uploadHandler = () => { throw Error('Upload must not run'); };
  assert.equal(await attachments.pickRequestAttachment('support'), undefined);
});
test('attachment upload is private and retains the returned file ID', async () => {
  pickerHandler = async () => ({assets: [{uri: 'file://proof.jpg', type: 'image/jpeg', fileName: 'proof.jpg'}]});
  uploadHandler = async (file, options) => {assert.equal(options.visibility, 'private'); assert.equal(options.module, 'legal'); return {fileId: '9007199254740999'};};
  assert.equal((await attachments.pickRequestAttachment('legal')).id, '9007199254740999');
});
test('construction calculator sends total built-up area exactly once across floors', async () => {
  requestHandler = () => ({materialCost: 100, labourCost: 50, totalCost: 200, estimatedTimelineDays: 150});
  const result = await construction.calculateConstructionEstimate({plotSizeSqFt: 1200, builtUpAreaSqFt: 1000, floors: 2, quality: 'Standard'});
  assert.equal(requests[0].body.builtUpAreaSqft, 2000);
  assert.equal(result.builtUpAreaSqFt, 1000);
  assert.equal(result.totalCost, 200);
});

test('EMI contract subtracts the down payment once and maps server breakdown', async () => {
  const {getEmiEstimate} = require('../src/services/calculatorApi.ts');
  requestHandler = () => ({breakdown: {emi: 17000, interest: 500000, totalPayment: 2500000}});
  const result = await getEmiEstimate({loanAmount: 2500000, downPayment: 500000, interestRate: 8, tenureYears: 20});
  assert.equal(requests[0].body.loanAmount, 2000000);
  assert.equal(result.monthlyEmi, 17000);
});
test('support form preserves input on failure, prevents duplicate submit, and navigates with the server ID on success', async () => {
  const React = require('react'), Renderer = require('react-test-renderer');
  const {SupportTicketFormScreen} = require('../src/screens/support/SupportTicketFormScreen.tsx');
  const navigated = [];
  let complete;
  requestHandler = options => {
    if (options.endpoint.startsWith('/masters/')) return page([{id: 7, name: 'General'}]);
    if (options.method === 'POST') return new Promise((resolve, reject) => {complete = {resolve, reject};});
    return page([]);
  };
  let tree;
  await Renderer.act(async () => {tree = Renderer.create(React.createElement(SupportTicketFormScreen, {route: {params: {}}, navigation: {replace: (...args) => navigated.push(args), goBack: () => {}}}));});
  const input = label => tree.root.findAllByType('AppInput').find(node => node.props.label === label);
  await Renderer.act(async () => {
    input('Issue Type').props.onChangeText('General');
    input('Subject').props.onChangeText('Cannot open property');
    input('Description').props.onChangeText('Please help');
  });
  const submit = () => tree.root.findAllByType('AppButton').find(node => node.props.label === 'Submit Ticket').props.onPress();
  let pending;
  await Renderer.act(async () => {pending = submit(); submit(); await Promise.resolve();});
  assert.equal(requests.filter(item => item.method === 'POST').length, 1);
  assert.deepEqual(navigated, []);
  await Renderer.act(async () => {complete.reject(Error('Connection lost')); await pending;});
  assert.deepEqual(navigated, []);
  assert.equal(input('Subject').props.value, 'Cannot open property');
  assert.equal(useSupportStore.getState().tickets.length, 0);
  await Renderer.act(async () => {pending = submit(); await Promise.resolve();});
  await Renderer.act(async () => {complete.resolve({id: '652', subject: 'Cannot open property', status: 'OPEN', category: {name: 'General'}}); await pending;});
  assert.equal(navigated[0][1].ticketId, '652');
  assert.equal(useSupportStore.getState().tickets[0].id, '652');
  await Renderer.act(async () => tree.unmount());
});
