import dayjs from 'dayjs';

/** Format ISO date (YYYY-MM-DD) for display */
export function formatDateDisplay(iso: string | undefined | null): string {
  if (!iso) return '';
  const parsed = dayjs(iso);
  return parsed.isValid() ? parsed.format('DD/MM/YYYY') : '';
}
