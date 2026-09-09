import { useAdmin } from '../lib/admin'
import { CALENDAR_MONTHS, END_DATE, START_DATE, hasMiniGame } from '../lib/config'
import { isDayUnlocked, parseDateStr, toDateStr } from '../lib/time'
import { useNow } from '../lib/useNow'
import { BlastIcon, LockIcon, PhotoIcon } from './Icons'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const

type CalendarProps = {
  onOpenPhoto: (dateStr: string) => void
  onOpenGame: (dateStr: string) => void
}

export function Calendar({ onOpenPhoto, onOpenGame }: CalendarProps) {
  // Re-render every second so days flip from locked to open exactly at
  // 00:00 Hong Kong time, even if the page is left open overnight. Under
  // the hidden admin mode, the override stands in for the real clock and
  // drives the same unlock logic.
  const realNow = useNow(1000)
  const { nowOverride } = useAdmin()
  const now = nowOverride ?? realNow

  return (
    <section aria-label="Surprise calendar" className="mx-auto w-full max-w-6xl">
      <header className="text-center">
        <h1 className="font-display text-3xl font-medium text-ink-100 sm:text-4xl">
          A month of small ceremonies
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-ink-500 sm:text-base">
          Every day at midnight, Hong Kong time, a new photograph unlocks. Every
          Saturday — and on the final night — a small game arrives with a secret
          hidden inside.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-xs text-ink-500">
          <span className="flex items-center gap-2">
            <PhotoIcon className="size-4 text-gold-400" /> a photo, every day
          </span>
          <span className="flex items-center gap-2">
            <BlastIcon className="size-4 text-rose-400" /> a game, every Saturday
            and on the final night
          </span>
        </div>
      </header>

      <div className="mt-10 grid gap-10 lg:grid-cols-2 lg:gap-8">
        {CALENDAR_MONTHS.map(([year, month]) => (
          <MonthGrid
            key={`${year}-${month}`}
            year={year}
            month={month}
            now={now}
            onOpenPhoto={onOpenPhoto}
            onOpenGame={onOpenGame}
          />
        ))}
      </div>
    </section>
  )
}

type MonthGridProps = CalendarProps & {
  year: number
  month: number // 0-based
  now: number
}

function MonthGrid({ year, month, now, onOpenPhoto, onOpenGame }: MonthGridProps) {
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const leadingBlanks = new Date(year, month, 1).getDay() // Sunday-first grid

  const cells: Array<string | null> = [
    ...Array<string | null>(leadingBlanks).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => toDateStr(year, month, i + 1)),
  ]

  return (
    <div className="month-panel">
      <h2 className="font-display text-center text-2xl font-medium text-ink-100">
        {MONTH_NAMES[month]} {year}
      </h2>

      <div className="mt-5 grid grid-cols-7 gap-1.5 sm:gap-2">
        {WEEKDAYS.map((weekday) => (
          <div
            key={weekday}
            className="pb-1 text-center text-[0.65rem] font-medium tracking-[0.2em] text-ink-600"
          >
            {weekday}
          </div>
        ))}

        {cells.map((dateStr, index) =>
          dateStr === null ? (
            <div key={`blank-${index}`} aria-hidden="true" />
          ) : (
            <DayCell
              key={dateStr}
              dateStr={dateStr}
              now={now}
              onOpenPhoto={onOpenPhoto}
              onOpenGame={onOpenGame}
            />
          ),
        )}
      </div>
    </div>
  )
}

type DayCellProps = CalendarProps & {
  dateStr: string
  now: number
}

function DayCell({ dateStr, now, onOpenPhoto, onOpenGame }: DayCellProps) {
  const { day } = parseDateStr(dateStr)
  // ISO strings compare lexicographically — safe for the inclusive range test.
  const inRange = dateStr >= START_DATE && dateStr <= END_DATE

  if (!inRange) {
    return (
      <div className="day-cell day-outside" aria-hidden="true">
        <span className="day-number">{day}</span>
      </div>
    )
  }

  const open = isDayUnlocked(dateStr, now)
  const game = hasMiniGame(dateStr)
  const lockHint = 'Unlocks at 00:00, Hong Kong time'

  return (
    <div className={`day-cell ${open ? 'day-open' : 'day-locked'}`}>
      <span className="day-number flex items-center gap-1">
        {day}
        {!open && <LockIcon className="size-2.5 text-ink-600" />}
      </span>

      <div className="flex flex-wrap items-center justify-center gap-1">
        <button
          type="button"
          disabled={!open}
          onClick={() => onOpenPhoto(dateStr)}
          title={open ? 'Open this day’s photo' : lockHint}
          aria-label={`Photo for ${dateStr}${open ? '' : ` — ${lockHint}`}`}
          className="icon-btn text-gold-400"
        >
          <PhotoIcon className="size-4.5" />
        </button>

        {game && (
          <button
            type="button"
            disabled={!open}
            onClick={() => onOpenGame(dateStr)}
            title={open ? 'Play this day’s surprise game' : lockHint}
            aria-label={`Surprise game for ${dateStr}${open ? '' : ` — ${lockHint}`}`}
            className="icon-btn text-rose-400"
          >
            <BlastIcon className="size-4.5" />
          </button>
        )}
      </div>
    </div>
  )
}
