export function localDateKey(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function localTimeKey(value: Date) {
  return `${String(value.getHours()).padStart(2, '0')}:${String(value.getMinutes()).padStart(2, '0')}`;
}

export function scheduleDate(date: string, time: string) {
  const [year, month, day] = date.split('-').map(Number);
  const [hours, minutes] = time.split(':').map(Number);
  return new Date(year, month - 1, day, hours, minutes, 0, 0);
}

export function formatDate(value?: string | Date | null) {
  if (!value) return 'Not provided';
  const date = value instanceof Date ? value : /^\d{4}-\d{2}-\d{2}/.test(value) ? scheduleDate(value.slice(0, 10), '12:00') : new Date(value);
  return Number.isNaN(date.getTime()) ? 'Not provided' : date.toLocaleDateString('en-IN', {day: '2-digit', month: 'short', year: 'numeric'});
}

export function formatTime(value?: string | null) {
  if (!value || !/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) return value || 'Not provided';
  return scheduleDate('2000-01-01', value).toLocaleTimeString('en-IN', {hour: '2-digit', minute: '2-digit', hour12: true});
}

export function formatSchedule(date?: string | null, time?: string | null) {
  return `${formatDate(date)}${time ? `, ${formatTime(time)}` : ''}`;
}
