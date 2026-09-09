import { UNLOCK_KEY, WINS_KEY } from '../lib/config'
import { WaxSeal } from './Icons'

/** Warm, short explanation of what this whole experience is. */
export function About() {
  return (
    <section aria-label="About this surprise" className="mx-auto w-full max-w-2xl">
      <div className="about-panel">
        <WaxSeal className="mx-auto size-14" />

        <h1 className="font-display mt-6 text-center text-3xl font-medium text-ivory-100 sm:text-4xl">
          For you, and no one else
        </h1>

        <div className="font-display mt-8 space-y-5 text-lg leading-relaxed text-ivory-300">
          <p>My love,</p>
          <p>
            This little corner of the internet was built for you and you alone.
            From <em>26 September to 26 October 2026</em>, it becomes a small
            ceremony we keep together: every day at midnight a new photograph
            unlocks — one for each of the thirty-one days — and every Saturday a
            little game appears with a secret hidden inside, waiting for you to
            win it. The final night holds the last surprise of all.
          </p>
          <p>
            Come back each morning. Something new will always be waiting for you
            here.
          </p>
          <p className="text-right text-gold-300 italic">— yours, entirely</p>
        </div>

        <div className="mt-10 border-t border-gold-500/15 pt-6 text-center">
          <button
            type="button"
            onClick={() => {
              try {
                localStorage.removeItem(UNLOCK_KEY)
                localStorage.removeItem(WINS_KEY)
              } catch {
                /* storage unavailable */
              }
              window.location.reload()
            }}
            className="text-xs text-ivory-600 underline decoration-ivory-600/40 underline-offset-4 transition-colors hover:text-ivory-300"
          >
            Reset access and mini-game wins (site owner’s testing tool)
          </button>
        </div>
      </div>
    </section>
  )
}
