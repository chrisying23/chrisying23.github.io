import { useState } from 'react'
import {
  END_DATE,
  HANGMAN_DATE,
  PHOTO_GAME_DATE,
  SCRAMBLE_DATE,
  WORDLE_DATE,
  loadWins,
  saveWin,
} from '../lib/config'
import { prettyDate } from '../lib/time'
import { BlastIcon } from './Icons'
import { CrypticGame } from './games/CrypticGame'
import { HangmanGame } from './games/HangmanGame'
import { PhotoGame } from './games/PhotoGame'
import { ScrambleGame } from './games/ScrambleGame'
import { WordleGame } from './games/WordleGame'

type MiniGameProps = {
  dateStr: string
  onBack: () => void
}

/**
 * The mini-game page. Each game day in GAME_DATES routes to its own
 * component under `src/components/games/`; the only contract a game must
 * honour is to call `onWin()` when the player wins, which persists the win
 * in localStorage (and keeps the celebration visible on later visits).
 */
export function MiniGame({ dateStr, onBack }: MiniGameProps) {
  const [won, setWon] = useState(() => loadWins().includes(dateStr))

  const isFinale = dateStr === END_DATE

  function handleWin() {
    saveWin(dateStr)
    setWon(true)
  }

  // The Wordle takes over the whole viewport (its own dark page, like the
  // official game), so it renders without the usual page chrome.
  if (dateStr === WORDLE_DATE) {
    return <WordleGame won={won} onWin={handleWin} onBack={onBack} />
  }

  const knownGame =
    dateStr === PHOTO_GAME_DATE ||
    dateStr === HANGMAN_DATE ||
    dateStr === SCRAMBLE_DATE ||
    isFinale

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
      </header>

      <div className="mt-10">
        {dateStr === PHOTO_GAME_DATE && <PhotoGame dateStr={dateStr} />}
        {dateStr === HANGMAN_DATE && <HangmanGame onWin={handleWin} />}
        {dateStr === SCRAMBLE_DATE && <ScrambleGame won={won} onWin={handleWin} />}
        {isFinale && <CrypticGame won={won} onWin={handleWin} />}

        {/* Safety net — unreachable while GAME_DATES and the routing agree. */}
        {!knownGame && (
          <div className="rounded-2xl border border-dashed border-ink-600/40 bg-mauve-100/50 px-6 py-14 text-center">
            <BlastIcon className="mx-auto size-10 text-rose-400/70" />
            <p className="font-display mt-4 text-xl text-ink-500 italic">
              The mini-game for this evening will live here.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
