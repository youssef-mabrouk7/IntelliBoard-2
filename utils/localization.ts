import { translations, type TranslationKey } from '@/constants/i18n';
import { useAppPreferencesStore } from '@/stores/appPreferencesStore';

/**
 * Parse a date value into a JS Date.
 * ISO date-only strings (YYYY-MM-DD) are intentionally parsed as LOCAL midnight
 * to avoid the timezone-shift bug: `new Date("2026-05-01")` is UTC midnight,
 * which in UTC+3 renders as Apr 30 when formatted with Intl.DateTimeFormat.
 */
function toDate(value: string | Date) {
  if (value instanceof Date) return value;
  const isoDate = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (isoDate) {
    return new Date(Number(isoDate[1]), Number(isoDate[2]) - 1, Number(isoDate[3]));
  }
  return new Date(value);
}

export function useLocalization() {
  const language = useAppPreferencesStore((s) => s.language);
  const dateFormat = useAppPreferencesStore((s) => s.dateFormat);
  const timeFormat = useAppPreferencesStore((s) => s.timeFormat);
  const isRTL = language === 'ar';
  const locale = language === 'ar' ? 'ar-EG' : 'en-US';

  const t = (key: TranslationKey) => translations[language][key] ?? translations.en[key];

  const formatDate = (value: string | Date) => {
    const date = toDate(value);
    const parts = new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit', year: 'numeric' }).formatToParts(date);
    const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
    const dd = get('day');
    const mm = get('month');
    const yyyy = get('year');
    if (dateFormat === 'dmy') return `${dd}/${mm}/${yyyy}`;
    if (dateFormat === 'ymd') return `${yyyy}/${mm}/${dd}`;
    return `${mm}/${dd}/${yyyy}`;
  };

  const formatTime = (value: string | Date) => {
    const date = toDate(value);
    return new Intl.DateTimeFormat(locale, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: timeFormat === '12h',
    }).format(date);
  };

  return { language, isRTL, locale, t, formatDate, formatTime };
}

export function toISODate(date: Date) {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

export function weekDates(base = new Date()) {
  const current = new Date(base);
  const start = new Date(current);
  start.setDate(current.getDate() - current.getDay());
  return Array.from({ length: 7 }).map((_, idx) => {
    const d = new Date(start);
    d.setDate(start.getDate() + idx);
    return d;
  });
}

export function monthGrid(date = new Date()) {
  const y = date.getFullYear();
  const m = date.getMonth();
  const first = new Date(y, m, 1);
  const start = new Date(first);
  start.setDate(first.getDate() - first.getDay());
  return Array.from({ length: 42 }).map((_, idx) => {
    const d = new Date(start);
    d.setDate(start.getDate() + idx);
    return d;
  });
}
