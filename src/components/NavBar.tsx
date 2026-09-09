import { useAdmin } from '../lib/admin'
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
  const realNow = useNow(1000)
  const { nowOverride } = useAdmin()
  const now = nowOverride ?? realNow
  const remaining = formatCountdown(msUntilNextHkMidnight(now))

  return (
    <header className="sticky top-0 z-40 border-b border-mauve-800/25 bg-mauve-300/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2.5">
          <WaxSeal className="size-8" />
          <span className="font-display text-xl font-medium text-ink-100">
            The Midnight Calendar
          </span>
        </div>

        <nav
          className="flex items-center rounded-full border border-mauve-800/25 bg-mauve-100/60 p-0.5"
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
                  ? 'bg-white/70 font-medium text-rose-600'
                  : 'text-ink-500 hover:text-ink-100'
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
          <span className="font-ui text-xl font-semibold tracking-[0.12em] text-gold-400 tabular-nums">
            {remaining}
          </span>
          <span className="text-xs text-ink-500">until midnight in Hong Kong</span>
        </div>
      </div>
    </header>
  )
}
