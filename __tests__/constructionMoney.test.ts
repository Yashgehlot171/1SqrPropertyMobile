import {addMoney, compareMoney, formatDelta, formatMoney, minMoney} from '../src/utils/constructionMoney';

test('money addition uses exact integer cents beyond JavaScript safe integer range',()=>expect(addMoney('90071992547409.91','0.10')).toBe('90071992547410.01'));
test('positive change amount adds to original contract exactly',()=>expect(addMoney('3000000.00','200000.00')).toBe('3200000.00'));
test('negative adjustment is represented with exact cents',()=>expect(addMoney('3000000.00','-50000.25')).toBe('2949999.75'));
test('zero adjustment leaves revised amount unchanged',()=>expect(addMoney('3000000.00','0')).toBe('3000000.00'));
test('money formatting uses Indian digit groups without floating point',()=>expect(formatMoney('3200000.01')).toBe('₹32,00,000.01'));
test('negative money formatting retains a leading sign',()=>expect(formatDelta('-50000.25')).toBe('-₹50,000.25'));
test('positive delta formatting includes a plus sign',()=>expect(formatDelta('200000.00')).toBe('+₹2,00,000.00'));
test('stage payment default clamps to global revised contract availability',()=>expect(minMoney('100000.00','25000.50')).toBe('25000.50'));
test('revised amount comparison includes cents exactly',()=>expect(compareMoney('100.01','100.02')).toBe(-1));
