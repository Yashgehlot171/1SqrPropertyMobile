import {formatDate, formatTime, localDateKey, localTimeKey, scheduleDate} from '../src/utils/dateTime';

describe('Phase 4 schedule date utilities', () => {
  it('keeps local calendar values without UTC date shifting', () => {
    const value = new Date(2026, 10, 16, 16, 30);
    expect(localDateKey(value)).toBe('2026-11-16');
    expect(localTimeKey(value)).toBe('16:30');
    expect(scheduleDate('2026-11-16', '16:30').getDate()).toBe(16);
  });

  it('uses Indian-friendly display formats', () => {
    expect(formatDate('2026-11-16')).toContain('16');
    expect(formatDate('2026-11-16')).toContain('2026');
    expect(formatTime('16:30')).toMatch(/04:30\s?pm/i);
  });
});
