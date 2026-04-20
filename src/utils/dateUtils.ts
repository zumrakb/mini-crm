function pad(value: number): string {
  return value.toString().padStart(2, '0');
}

export function parseISODate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);

  if (!year || !month || !day) {
    return new Date();
  }

  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

export function formatISODate(date: Date): string {
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
  ].join('-');
}

export function isToday(dateStr: string): boolean {
  return formatISODate(parseISODate(dateStr)) === todayISO();
}

export function formatDate(dateStr: string, locale = 'tr-TR'): string {
  return parseISODate(dateStr).toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function todayISO(): string {
  return formatISODate(new Date());
}
