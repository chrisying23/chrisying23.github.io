/**
 * Time helpers. Everything here is anchored to Hong Kong time (UTC+8),
 * because every surprise unlocks at 00:00 Hong Kong time.
 */

const HK_OFFSET_MS = 8 * 60 * 60 * 1000 // UTC+8
const DAY_MS = 24 * 60 * 60 * 1000

/** Milliseconds remaining until the next 00:00 in Hong Kong. */
export function msUntilNextHkMidnight(nowMs: number): number {
  const hkMs = nowMs + HK_OFFSET_MS
  const nextMidnightHkMs = (Math.floor(hkMs / DAY_MS) + 1) * DAY_MS
  return nextMidnightHkMs - hkMs
}

/** Format a duration in ms as HH:MM:SS on a 24-hour clock. */
export function formatCountdown(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  return [h, m, s].map((n) => String(n).padStart(2, '0')).join(':')
}

/**
 * True once `dateStr` (YYYY-MM-DD) has reached 00:00 Hong Kong time.
 * 00:00 HKT on day D == 16:00 UTC on day D-1.
 */
export function isDayUnlocked(dateStr: string, nowMs: number): boolean {
  const { year, month, day } = parseDateStr(dateStr)
  const dayStartUtcMs = Date.UTC(year, month, day) - HK_OFFSET_MS
  return nowMs >= dayStartUtcMs
}

/** '2026-09-26' -> { year: 2026, month: 8, day: 26 } (month is 0-based). */
export function parseDateStr(dateStr: string): {
  year: number
  month: number
  day: number
} {
  const [year, month, day] = dateStr.split('-').map(Number)
  return { year, month: month - 1, day }
}

/** (2026, 8, 26) -> '2026-09-26' (month is 0-based). */
export function toDateStr(year: number, month: number, day: number): string {
  const mm = String(month + 1).padStart(2, '0')
  const dd = String(day).padStart(2, '0')
  return `${year}-${mm}-${dd}`
}

/** '2026-09-26' -> '26 September 2026' */
export function prettyDate(dateStr: string): string {
  const { year, month, day } = parseDateStr(dateStr)
  return new Date(year, month, day).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
