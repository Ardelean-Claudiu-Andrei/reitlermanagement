const FMT = new Intl.DateTimeFormat('ro-RO', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})

/**
 * Format an activity timestamp string for display.
 * - ISO strings with timezone are converted to the browser's local timezone.
 * - Legacy strings without timezone are interpreted as local time (no artificial shift).
 * - Invalid strings fall back to the original value.
 */
export function formatActivityTimestamp(ts: string): string {
  if (!ts) return ts
  const d = new Date(ts)
  if (isNaN(d.getTime())) return ts
  return FMT.format(d)
}
