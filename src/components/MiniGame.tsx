import { useState } from 'react'
import { END_DATE, FALLBACK_SECRET, SECRETS, loadWins, saveWin } from '../lib/config'
import { prettyDate } from '../lib/time'
import { BlastIcon } from './Icons'

type MiniGameProps = {
  dateStr: string
  onBack: () => void
}

/**
 * Placeholder mini-game page.
 *
 * ══ WHERE THE REAL MINI-GAMES GO ═════════════════════════════════════
 * Replace the dashed placeholder panel below with the real game for this
 * date. The only contract a game must honour is: when the player wins,
 * call `handleWin()`. That marks the day as won (persisted in
 * localStorage) and reveals the secret message at the bottom.
 * ═════════════════════════════════════════════════════════════════════
 */
export function MiniGame({ dateStr, onBack }: MiniGameProps) {
  const [won, setWon] = useState(() => loadWins().includes(dateStr))

  const isFinale = dateStr === END_DATE
  const secret = SECRETS[dateStr] ?? FALLBACK_SECRET

  function handleWin() {
    saveWin(dateStr)
    setWon(true)
  }

  return (
    <section aria-label="Surprise mini-game" className="mx-auto w-full max-w-2xl">
      <button
        type="button"
        onClick={onBack}
        className="text-sm text-ink-500 underline decoration-ink-600/40 underline-offset-4 transition-colors hover:text-rose-600"
      >
        Return to the calendar
      </button>

      <header className="mt-8 text-center">
        <p className="text-[0.7rem] font-medium tracking-[0.35em] text-rose-400">
          {isFinale ? 'The final surprise' : 'A Saturday surprise'}
        </p>
        <h1 className="font-display mt-3 text-3xl font-medium text-ink-100 sm:text-4xl">
          {prettyDate(dateStr)}
        </h1>
        <p className="mt-3 text-sm text-ink-500">
          Win the game below to reveal the secret hidden inside this day.
        </p>
      </header>

      {/* ── PLACEHOLDER GAME AREA — swap in the real mini-game here ── */}
      <div className="mt-10 rounded-2xl border border-dashed border-ink-600/40 bg-mauve-100/50 px-6 py-14 text-center">
        <BlastIcon className="mx-auto size-10 text-rose-400/70" />
        <p className="font-display mt-4 text-xl text-ink-500 italic">
          The mini-game for this evening will live here.
        </p>
        <p className="mx-auto mt-2 max-w-sm text-xs leading-relaxed text-ink-600">
          (Placeholder — the real game is on its way. For now, the button below
          stands in for a victory.)
        </p>
        {!won && (
          <button
            type="button"
            onClick={handleWin}
            className="mt-8 rounded-full border border-gold-400/60 bg-gold-400/10 px-8 py-3 text-sm font-medium tracking-wide text-gold-600 transition-all hover:border-gold-400 hover:bg-gold-400/20"
          >
            Simulate a win
          </button>
        )}
      </div>
      {/* ── END OF PLACEHOLDER GAME AREA ── */}

      {won && (
        <div className="animate-rise mt-8 rounded-2xl border border-gold-400/50 bg-gradient-to-b from-gold-400/15 to-transparent px-6 py-10 text-center">
          <p className="text-[0.7rem] font-medium tracking-[0.35em] text-gold-400">
            Your secret
          </p>
          <p className="font-display mx-auto mt-4 max-w-md text-2xl leading-relaxed text-ink-100 italic">
            “{secret}”
          </p>
        </div>
      )}
    </section>
  )
}
