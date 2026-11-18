import React from 'react';
import {act, create, type ReactTestRenderer} from 'react-test-renderer';
import {Text, TextInput} from 'react-native';
import {getBuilderConstructionCommission, type BuilderConstructionCommission} from '../src/services/constructionCommissionApi';
import {ConstructionCommissionPanel} from '../src/screens/constructionRequirement/ConstructionCommissionPanel';

jest.mock('../src/services/constructionCommissionApi', () => ({getBuilderConstructionCommission: jest.fn()}));
jest.mock('@react-navigation/native', () => {const ReactLib = jest.requireActual('react'); return {useFocusEffect: (callback: () => void) => ReactLib.useEffect(callback, [callback])};});
jest.mock('../src/screens/constructionRequirement/FlowUI', () => {const ReactLib = jest.requireActual('react'); const RN = jest.requireActual('react-native'); return {FlowSection: ({title, children}: any) => ReactLib.createElement(RN.View, null, ReactLib.createElement(RN.Text, null, title), children), FlowInfo: ({label, value}: any) => ReactLib.createElement(RN.Text, null, `${label} ${value}`), flow: {blue: 'blue', muted: 'gray', red: 'red', green: 'green', line: 'gray', ink: 'black', surface: 'white'}};});
jest.mock('../src/screens/constructionRequirement/customerQuotationUi', () => {const ReactLib = jest.requireActual('react'); const RN = jest.requireActual('react-native'); return {QuoteCard: ({title, children}: any) => ReactLib.createElement(RN.View, null, ReactLib.createElement(RN.Text, null, title), children)};});
const commission: BuilderConstructionCommission = {id:'c1', projectId:'p1', projectNo:'1SQ-CON-2026-000001', rateSnapshot:'0.50', agreementAmount:'3000000.00', baseCommission:'15000.00', accruedCommission:'16000.00', settledCommission:'15000.00', outstandingCommission:'1000.00', builderCredit:'0.00', status:'PENDING', triggeredAt:'2026-11-01T00:00:00Z', adjustments:[{id:'a1', changeOrderNo:1, baseAmountDelta:'200000.00', commissionDelta:'1000.00', createdAt:'2026-11-02T00:00:00Z'}], payments:[{id:'pay1', amount:'15000.00', reference:'RCPT-7', note:null, paidAt:'2026-11-03T00:00:00Z'}]};
const fetchCommission = jest.mocked(getBuilderConstructionCommission);
let renderer: ReactTestRenderer;
const content = (value: unknown): string => typeof value === 'string' || typeof value === 'number' ? String(value) : Array.isArray(value) ? value.map(content).join(' ') : value && typeof value === 'object' && 'props' in value ? content((value as {props: {children?: unknown}}).props.children) : '';
const strings = () => renderer.root.findAllByType(Text).map(item => content(item.props.children)).join(' ');

beforeEach(() => {jest.clearAllMocks(); fetchCommission.mockResolvedValue(commission);});

test('Builder sees frozen rate, accrued/settled/outstanding totals and Change Order plus payment history', async () => {
  await act(async () => {renderer = create(<ConstructionCommissionPanel projectId="p1"/>); await Promise.resolve();});
  expect(fetchCommission).toHaveBeenCalledWith('p1');
  expect(strings()).toContain('0.50%'); expect(strings()).toContain('Accrued'); expect(strings()).toContain('Settled'); expect(strings()).toContain('Outstanding');
  expect(strings()).toContain('Change Order # 1'); expect(strings()).toContain('RCPT-7');
});

test('Builder commission panel has no edit or mark-paid controls', async () => {
  await act(async () => {renderer = create(<ConstructionCommissionPanel projectId="p1"/>); await Promise.resolve();});
  expect(renderer.root.findAllByType(TextInput)).toHaveLength(0);
});

test('Missing commission from a disabled trigger has no fabricated values and API errors are shown', async () => {
  fetchCommission.mockResolvedValueOnce(null);
  await act(async () => {renderer = create(<ConstructionCommissionPanel projectId="p1"/>); await Promise.resolve();});
  expect(strings()).toBe(''); await act(async () => {renderer.unmount();});
  fetchCommission.mockRejectedValueOnce(new Error('Commission service unavailable'));
  await act(async () => {renderer = create(<ConstructionCommissionPanel projectId="p1"/>); await Promise.resolve();});
  expect(strings()).toContain('Commission service unavailable');
});
