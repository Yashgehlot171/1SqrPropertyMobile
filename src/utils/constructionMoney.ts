const cents = (value: string): bigint => {
  const match = /^(-?)(\d+)(?:\.(\d{1,2}))?$/.exec(value.trim());
  if (!match) throw new Error('Invalid decimal money value.');
  const whole = BigInt(match[2]);
  const fraction = BigInt((match[3] ?? '').padEnd(2, '0'));
  const amount = whole * 100n + fraction;
  return match[1] ? -amount : amount;
};

export const addMoney = (first: string, second: string): string => {
  const value = cents(first) + cents(second);
  const negative = value < 0n;
  const absolute = negative ? -value : value;
  return `${negative ? '-' : ''}${absolute / 100n}.${String(absolute % 100n).padStart(2, '0')}`;
};

export const compareMoney = (first: string, second: string): number => {
  const a = cents(first); const b = cents(second);
  return a < b ? -1 : a > b ? 1 : 0;
};

export const minMoney = (first: string, second: string): string => compareMoney(first, second) <= 0 ? first : second;

export const formatMoney = (value: string | null | undefined): string => {
  if (value == null || value === '') return 'Not provided';
  const amount = cents(value);
  const negative = amount < 0n;
  const absolute = negative ? -amount : amount;
  const whole = String(absolute / 100n);
  const lastThree = whole.slice(-3);
  const prefix = whole.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  return `${negative ? '-' : ''}₹${prefix ? `${prefix},` : ''}${lastThree}.${String(absolute % 100n).padStart(2, '0')}`;
};

export const formatDelta = (value: string | null | undefined): string => {
  if (value == null) return 'Pending';
  const comparison = compareMoney(value, '0');
  return `${comparison > 0 ? '+' : ''}${formatMoney(value)}`;
};

export const formatDaysDelta = (value: number | null | undefined): string => {
  if (value == null) return 'Pending';
  if (value === 0) return 'No timeline change';
  return `${value > 0 ? '+' : ''}${value} ${Math.abs(value) === 1 ? 'day' : 'days'}`;
};
