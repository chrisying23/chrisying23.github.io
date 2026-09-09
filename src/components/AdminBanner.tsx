import { useAdmin, type AdminOverride } from '../lib/admin'
import { hkParts, prettyHkDateTime } from '../lib/time'
import { useNow } from '../lib/useNow'

/**
 * The admin banner — only mounted when the hidden admin mode is active.
 * Lets the owner pick any date + time (interpreted on the Hong Kong clock)
 * to preview how the site behaves at that moment: the countdown target,
 * which days' photo/game icons are enabled, everything.
 *
 * Hidden by design: no nav link reaches it; only the admin passcode opens
 * this session, and it stays invisible to visitors.
 */
export function AdminBanner() {
  const realNow = useNow(500)
  const { nowOverride, override, setOverride, exitAdmin } = useAdmin()

  // While no override is chosen, the pickers simply mirror the live HK
  // clock; as soon as the owner edits either field, that value takes over.
  const shown = override ?? hkParts(realNow)

  function change(partial: Partial<AdminOverride>) {
    setOverride({ ...shown, ...partial })
  }

  return (
    <section
      className="admin-banner"
      aria-label="Hidden admin mode — Hong Kong time override"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-rose-600">
            Admin mode
          </p>
          <p className="mt-1 text-sm text-ink-500">
            Previewing as:{' '}
            <span className="font-medium text-ink-100">
              {nowOverride !== null
                ? prettyHkDateTime(nowOverride)
                : `real clock — ${prettyHkDateTime(realNow)}`}
            </span>
          </p>
        </div>
        <button
          type="button"
          onClick={exitAdmin}
          className="rounded-full border border-ink-600/40 px-4 py-1.5 text-sm text-ink-500 transition-colors hover:border-rose-400 hover:text-ink-100"
        >
          Exit admin
        </button>
      </div>

      <div className="mt-4 flex flex-wrap items-end gap-x-4 gap-y-3">
        <label className="flex flex-col gap-1 text-xs text-ink-500">
          Date (Hong Kong)
          <input
            type="date"
            className="admin-input"
            value={shown.date}
            onChange={(event) => change({ date: event.target.value })}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-ink-500">
          Time (Hong Kong)
          <input
            type="time"
            className="admin-input"
            value={shown.time}
            onChange={(event) => change({ time: event.target.value })}
          />
        </label>
        <button
          type="button"
          onClick={() => setOverride(null)}
          className="mb-0.5 rounded-full border border-rose-400/50 bg-rose-600/10 px-4 py-1.5 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-600/20"
        >
          Use real time
        </button>
      </div>
    </section>
  )
}
