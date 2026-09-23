/**
 * Central configuration for the birthday experience.
 *
 * ══ WHERE TO SWAP IN REAL CONTENT LATER ═════════════════════════════
 * 1. DAILY COMIC PAGES — every calendar day opens the next two pages of
 *    the comic in `comic/muiju-household-empress/` (26 Sept shows the
 *    cover followed by pages 1–2; 26 Oct shows pages 61–62). PHOTOS below
 *    is built automatically from the filenames — no entries to edit.
 * 2. MINI-GAMES — the five games live in `src/components/games/`, one per
 *    date in GAME_DATES below; their answers, hints and win messages are
 *    the constants at the bottom of this file.
 * ═════════════════════════════════════════════════════════════════════
 */

import { parseDateStr, toDateStr } from './time'

/** Display name of the site (nav bar, gate, browser tab). */
export const SITE_NAME = "YanYan's Surprise Birthday Calendar"

/** The visitor passcode, compared case-insensitively, uppercased. */
export const PASSCODE = 'NOONDAYGUN' // i.e. "NOONDAY GUN"

/** The hidden admin passcode, entered into the same letter grid. */
export const ADMIN_PASSCODE = '1234567890'

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

/** The photograph revealed by the 24 October mini-game. */
export const LOCATION_PHOTO = './photos/location.jpg'

/** ── Daily comic pages ─────────────────────────────────────────────── */

/**
 * The 62 pages plus cover of "Muiju: The Rise of the Household Empress",
 * imported straight from the storyboard folder so the site always serves
 * the finished art.
 */
const COMIC_ASSETS = import.meta.glob('../../comic/muiju-household-empress/*.png', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>

/** Resolve one comic file ('01-page-…' / '00-cover-…') to its served URL. */
function comicUrl(file: string): string {
  const url = COMIC_ASSETS[`../../comic/muiju-household-empress/${file}`]
  if (!url) throw new Error(`Missing comic asset: ${file}`)
  return url
}

/** The comic's cover — shown on the first day and in the About section. */
export const COMIC_COVER = comicUrl('00-cover-muiju-household-empress.png')

/**
 * Daily photo-modal pages, keyed by ISO date (YYYY-MM-DD): two pages of
 * the comic per day, in order, from 26 September (the cover followed by
 * pages 1–2) to 26 October (pages 61–62) — the whole 62-page series.
 */
export const PHOTOS: Record<string, string[]> = (() => {
  const photos: Record<string, string[]> = {}
  const { year, month, day } = parseDateStr(START_DATE)
  const cursor = new Date(year, month, day)
  for (let i = 0; ; i += 1) {
    const dateStr = toDateStr(cursor.getFullYear(), cursor.getMonth(), cursor.getDate())
    if (dateStr > END_DATE) break
    photos[dateStr] = [
      ...(i === 0 ? [COMIC_COVER] : []),
      comicUrl(`${String(2 * i + 1).padStart(2, '0')}-page-muiju-household-empress.png`),
      comicUrl(`${String(2 * i + 2).padStart(2, '0')}-page-muiju-household-empress.png`),
    ]
    cursor.setDate(cursor.getDate() + 1)
  }
  return photos
})()

/**
 * Mini-game days, in order. Each date maps to a game component in
 * `src/components/games/` (see src/components/MiniGame.tsx for the routing):
 *   2026-10-03 — Wordle          2026-10-17 — Hangman
 *   2026-10-10 — emoji guessing  2026-10-24 — photo reveal
 *   2026-10-26 — cryptic puzzle (the finale)
 * Note: 26 September (the first day) is a photo-only day — no game.
 */
export const GAME_DATES: readonly string[] = [
  '2026-10-03',
  '2026-10-10',
  '2026-10-17',
  '2026-10-24',
  '2026-10-26',
]

/** True only on the five mini-game days listed in GAME_DATES. */
export function hasMiniGame(dateStr: string): boolean {
  return GAME_DATES.includes(dateStr)
}

/** ── Mini-game content ─────────────────────────────────────────────── */

/** 3 October — Wordle (answer never shown to the player until they win). */
export const WORDLE_DATE = '2026-10-03'
export const WORDLE_ANSWER = 'WINECAB'
export const WORDLE_HINT = 'Your first present is located in the...'
export const WORDLE_WIN = 'Now go look for your present!'

/** 10 October — emoji word guess (BRUNO | MARS). */
export const EMOJI_GAME_DATE = '2026-10-10'
export const EMOJI_ANSWER = 'BRUNOMARS'
/** Number of letters before the visual gap (BRUNO | MARS). */
export const EMOJI_GAP_AFTER = 5
export const EMOJI_WIN = 'We are going to see the Bruno Mars Concert on 7th of May 2027.'

/** 17 October — Hangman. */
export const HANGMAN_DATE = '2026-10-17'
export const HANGMAN_ANSWER = 'RACINES'
export const HANGMAN_HINT = 'We are going for lunch today at this restaurant.'
export const HANGMAN_WIN = 'See you at Racines for lunch!'

/** 24 October — photo reveal (no win condition, just the hint + photo). */
export const PHOTO_GAME_DATE = '2026-10-24'
export const PHOTO_GAME_HINT =
  'Do you know where is this? Your next present is placed here.'

/** 26 October — the finale cryptic puzzle (GLOVE | BOX). */
export const FINALE_CLUE = 'Fighting Mitts in Car Compartment'
export const FINALE_HINT = 'Your last and final present is located here:'
export const FINALE_ANSWER = 'GLOVEBOX'
/** Number of letters before the visual gap (GLOVE | BOX). */
export const FINALE_GAP_AFTER = 5
export const FINALE_WIN = 'Go look for your present now!'

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
