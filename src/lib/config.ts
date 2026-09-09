/**
 * Central configuration for the birthday experience.
 *
 * ══ WHERE TO SWAP IN REAL CONTENT LATER ═════════════════════════════
 * 1. DAILY PHOTOS — put the real image files in `public/photos/` and add
 *    one entry per day to PHOTOS below, e.g.
 *        '2026-09-26': './photos/2026-09-26.jpg',
 *    (keep paths relative with a leading './' so GitHub Pages project
 *    URLs keep working). Days without an entry show an auto-generated
 *    placeholder image.
 * 2. MINI-GAME SECRETS — replace the placeholder entries in SECRETS with
 *    the real messages, keyed by date ('2026-09-26', '2026-10-03', …).
 * 3. MINI-GAMES THEMSELVES — see src/components/MiniGame.tsx, which has a
 *    clearly marked placeholder area where each real game will live.
 * ═════════════════════════════════════════════════════════════════════
 */

/** The passcode, compared case-insensitively with spaces/punctuation ignored. */
export const PASSCODE = 'NOONDAYGUN' // i.e. "NOONDAY GUN"

/** Number of letters before the visual gap (NOONDAY | GUN). */
export const PASSCODE_GAP_AFTER = 7

/** Required hint copy shown above the passcode inputs — keep verbatim. */
export const GATE_HINT =
  'Solve this cryptic puzzle to get access to your birthday surprises. Hint: Afternoon Sex Genesis'

/** localStorage keys. */
export const UNLOCK_KEY = 'midnight-calendar-unlocked-v1'
export const WINS_KEY = 'midnight-calendar-wins-v1'

/** First and last day of the surprise period (inclusive), ISO format. */
export const START_DATE = '2026-09-26'
export const END_DATE = '2026-10-26'

/** Months rendered by the calendar: [year, monthIndex (0-based)]. */
export const CALENDAR_MONTHS: ReadonlyArray<readonly [number, number]> = [
  [2026, 8], // September 2026
  [2026, 9], // October 2026
]

/**
 * Daily photos, keyed by ISO date (YYYY-MM-DD).
 * Empty for now — every day falls back to a generated placeholder.
 */
export const PHOTOS: Record<string, string> = {
  // '2026-09-26': './photos/2026-09-26.jpg',
  // '2026-09-27': './photos/2026-09-27.jpg',
  // … one entry per day through '2026-10-26'
}

/**
 * Secret messages revealed after winning each mini-game, keyed by ISO date.
 * The mini-game days are every Saturday in the period plus the finale:
 *   2026-09-26, 2026-10-03, 2026-10-10, 2026-10-17, 2026-10-24, 2026-10-26
 */
export const SECRETS: Record<string, string> = {
  // '2026-09-26': 'Your first secret message goes here…',
}

/** Shown when a game is won but no bespoke secret has been written yet. */
export const FALLBACK_SECRET =
  'You did it, my love. A secret written just for you will live here soon — until then, know that you are adored beyond measure.'

/** True for every Saturday inside the period, plus the final day (26 Oct). */
export function hasMiniGame(dateStr: string): boolean {
  const [y, m, d] = dateStr.split('-').map(Number)
  const isSaturday = new Date(y, m - 1, d).getDay() === 6
  return isSaturday || dateStr === END_DATE
}

/** ── Persistence helpers for mini-game wins ────────────────────────── */

export function loadWins(): string[] {
  try {
    const raw = localStorage.getItem(WINS_KEY)
    const parsed: unknown = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === 'string') : []
  } catch {
    return []
  }
}

export function saveWin(dateStr: string): void {
  try {
    const wins = loadWins()
    if (!wins.includes(dateStr)) {
      wins.push(dateStr)
      localStorage.setItem(WINS_KEY, JSON.stringify(wins))
    }
  } catch {
    /* storage unavailable — win state just won't persist */
  }
}
