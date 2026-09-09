import { formatCountdown, msUntilNextHkMidnight } from '../lib/time'
import { useNow } from '../lib/useNow'
import { WaxSeal } from './Icons'

export type NavView = 'calendar' | 'about'

type NavBarProps = {
  view: NavView
  onNavigate: (view: NavView) => void
}

/** Sticky top bar: brand, live countdown to 00:00 HKT, and section switch. */
export function NavBar({ view, onNavigate }: NavBarProps) {
  const now = useNow(1000)
  const remaining = formatCountdown(msUntilNextHkMidnight(now))

  return (
    <header className="sticky top-0 z-40 border-b border-gold-500/20 bg-night-950/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2.5">
          <WaxSeal className="size-8" />
          <span className="font-display text-xl font-medium text-ivory-100">
            The Midnight Calendar
          </span>
        </div>

        <nav
          className="flex items-center rounded-full border border-gold-500/25 p-0.5"
          aria-label="Sections"
        >
          {(['calendar', 'about'] as const).map((name) => (
            <button
              key={name}
              type="button"
              aria-pressed={view === name}
              onClick={() => onNavigate(name)}
              className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
                view === name
                  ? 'bg-gold-500/15 font-medium text-gold-200'
                  : 'text-ivory-500 hover:text-ivory-300'
              }`}
            >
              {name === 'calendar' ? 'Calendar' : 'About'}
            </button>
          ))}
        </nav>

        <div
          className="order-3 flex w-full items-baseline justify-center gap-2.5 sm:order-none sm:w-auto"
          role="timer"
          aria-label="Time remaining until the next surprise unlocks at midnight, Hong Kong time"
        >
          <span className="font-ui text-xl font-semibold tracking-[0.12em] text-gold-300 tabular-nums">
            {remaining}
          </span>
          <span className="text-xs text-ivory-500">until midnight in Hong Kong</span>
        </div>
      </div>
    </header>
  )
}
